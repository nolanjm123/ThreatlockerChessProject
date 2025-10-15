import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/apiservice.service';
import { FenHelper } from '../services/fen-helper.service';
import { Match } from '../models/match.model';
import { Move } from '../models/move.model';

@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="board-container" *ngIf="isBoardValid()">
      <div class="labels ranks">
        <div *ngFor="let rank of [8, 7, 6, 5, 4, 3, 2, 1]">{{ rank }}</div>
      </div>
      <div class="board" [ngClass]="currentTheme">
        <div class="row" *ngFor="let row of board; let rank = index">
          <div
            class="square"
            *ngFor="let piece of row; let file = index"
            [ngClass]="{
              'light-square': (rank + file) % 2 === 0,
              'dark-square': (rank + file) % 2 !== 0,
              'selected': selectedSquare && selectedSquare.rank === rank && selectedSquare.file === file
            }"
            (click)="onSquareClick(rank, file)"
          >
            <span class="piece">{{ getPieceSymbol(piece) }}</span>
          </div>
        </div>
      </div>
      <div class="labels files">
        <div *ngFor="let file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']">{{ file }}</div>
      </div>
    </div>
    <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
    <div class="status">{{ status }}</div>
    <select (change)="onThemeChange($event)">
      <option value="default">Default Theme</option>
      <option value="dark">Dark Theme</option>
    </select>
  `,
  styleUrls: ['./chess-board.component.scss'],
})
export class ChessBoardComponent implements OnInit {
  @Input() currentMatchId: number | null = null;
  @Input() player1Id: number = 0;
  @Input() player2Id: number = 0;
  @Input() player1: string = '';
  @Input() player2: string = '';
  @Input() currentTheme: string = 'default';
  @Output() statusChange = new EventEmitter<string>();
  @Output() themeChange = new EventEmitter<string>();

  fen: string = '';
  board: string[][] = Array(8).fill(null).map(() => Array(8).fill(''));
  selectedSquare: { rank: number; file: number } | null = null;
  status: string = '';
  errorMessage: string | null = null; // Local error display

  constructor(private apiService: ApiService, private fenHelper: FenHelper) {}

  ngOnInit(): void {
    console.log('ChessBoardComponent ngOnInit');
    this.updateBoard();
    this.updateStatus();
  }

  isBoardValid(): boolean {
    const valid = this.board && this.board.length === 8 && this.board.every(row => row && row.length === 8);
    console.log('isBoardValid:', valid);
    return valid;
  }

  onSquareClick(rank: number, file: number): void {
    if (!this.currentMatchId) {
      this.errorMessage = 'No match selected';
      return;
    }

    const playerID = this.fenHelper.getGameStatus().activeColor === 'w' ? this.player1Id : this.player2Id;

    if (!this.selectedSquare) {
      if (this.board[rank][file]) {
        this.selectedSquare = { rank, file };
      }
    } else {
      const move = {
        fromSquare: this.toAlgebraic(this.selectedSquare.rank, this.selectedSquare.file),
        toSquare: this.toAlgebraic(rank, file),
        promotion: 'q',
        playerID,
      };
      this.apiService.sendMove(this.currentMatchId!, move).subscribe({
        next: (moveResponse: Move) => {
          this.apiService.getMatch(this.currentMatchId!).subscribe({
            next: (response: Match) => {
              const match: Match = {
                matchID: response.matchID,
                player1ID: response.player1ID,
                player2ID: response.player2ID,
                winnerID: response.winnerID,
                startTime: new Date(response.startTime),
                endTime: response.endTime ? new Date(response.endTime) : undefined,
                currentFEN: response.currentFEN,
              };
              const fenToLoad = match.currentFEN || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
              this.fenHelper.loadFen(fenToLoad);
              this.updateBoard();
              this.updateStatus();
              this.selectedSquare = null;
              this.errorMessage = null; // Clear error on successful move
            },
            error: (err) => {
              this.errorMessage = 'Failed to load match';
              this.updateBoard();
            },
          });
        },
        error: (err) => {
          this.errorMessage = 'Invalid move';
          this.selectedSquare = null;
        },
      });
    }
  }

  private toAlgebraic(rank: number, file: number): string {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return `${files[file]}${rank+1}`;
  }

  getPieceSymbol(piece: string): string {
    const pieces: { [key: string]: string } = {
      r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', p: '♟',
      R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔', P: '♙',
    };
    return pieces[piece] || '';
  }

  private updateBoard(): void {
    this.fen = this.fenHelper.getFen();
    this.board = this.fenHelper.getBoard();
    console.log('Board state:', this.board);
  }

  private updateStatus(): void {
    const status = this.fenHelper.getGameStatus();
    let newStatus: string;
    if (status.inCheckmate) {
      newStatus = `Checkmate! ${status.activeColor === 'w' ? this.player2 : this.player1} wins!`;
    } else if (status.inStalemate) {
      newStatus = 'Stalemate! Game over.';
    } else if (status.inDraw) {
      newStatus = 'Draw! Game over.';
    } else if (status.inCheck) {
      newStatus = `Check! Turn: ${status.activeColor === 'w' ? this.player1 : this.player2}`;
    } else {
      newStatus = `Turn: ${status.activeColor === 'w' ? this.player1 : this.player2}`;
    }
    this.status = newStatus;
    this.statusChange.emit(newStatus);
  }

  onThemeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.themeChange.emit(target.value);
    }
  }
}