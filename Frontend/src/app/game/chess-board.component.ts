import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/apiservice.service';
import { FenHelper } from '../services/fen-helper.service';

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
              'selected': selectedSquare && selectedSquare.rank === rank && selectedSquare.file === file,
              'valid-move': isValidMove(rank, file)
            }"
            (click)="onSquareClick(rank, file)"
          >
            <span class="piece">{{ getPieceSymbol(piece) }}</span>
            <span class="valid-move-dot" *ngIf="isValidMove(rank, file)"></span>
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
  @Input() isReplayMode: boolean = false;
  @Output() statusChange = new EventEmitter<string>();
  @Output() themeChange = new EventEmitter<string>();

  fen: string = '';
  board: string[][] = Array(8).fill(null).map(() => Array(8).fill(''));
  selectedSquare: { rank: number; file: number } | null = null;
  validMoves: { rank: number; file: number }[] = [];
  status: string = '';
  errorMessage: string | null = null;
  moveNumber: number = 1;

  constructor(
    private apiService: ApiService,
    private fenHelper: FenHelper,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateBoard();
    this.updateStatus();
  }

  isBoardValid(): boolean {
    const valid = this.board && this.board.length === 8 && this.board.every(row => row && row.length === 8);
    console.log('isBoardValid:', valid);
    return valid;
  }

  private getValidMoves(rank: number, file: number): void {
    if (!this.currentMatchId) {
      this.errorMessage = 'No match selected';
      this.cdr.detectChanges();
      return;
    }
    // Call backend to get valid moves for the selected square
    const square = this.toAlgebraic(rank, file);
    this.apiService.getValidMoves(this.currentMatchId, square).subscribe({
      next: (moves: { rank: number; file: number }[]) => {
        this.validMoves = moves;
        console.log('VALIDMOVES PRINTED:', this.validMoves);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = `Failed to get valid moves: ${err.message || 'Unknown error'}`;
        this.validMoves = [];
        this.cdr.detectChanges();
      },
    });
  }

  isValidMove(rank: number, file: number): boolean {
    return this.validMoves.some(move => move.rank === rank && move.file === file);
  }

  onSquareClick(rank: number, file: number): void {

    if (this.isReplayMode) {
    return;
    }

    if (!this.currentMatchId) {
      this.errorMessage = 'No match selected';
      this.cdr.detectChanges();
      return;
    }

    // Deselect if clicking the same square
    if (
      this.selectedSquare &&
      this.selectedSquare.rank === rank &&
      this.selectedSquare.file === file
    ) {
      this.selectedSquare = null;
      this.validMoves = [];
      this.cdr.detectChanges();
      return;
    }

    // Handle move attempt
    if (this.selectedSquare && this.isValidMove(rank, file)) {
      const playerID = this.fenHelper.getGameStatus().activeColor === 'w' ? this.player1Id : this.player2Id;
      const fromSquare = this.toAlgebraic(this.selectedSquare.rank, this.selectedSquare.file);
      const toSquare = this.toAlgebraic(rank, file);

      // Send move to backend
      const moveRequest = {
        matchId: this.currentMatchId!,
        playerId: playerID,
        fromSquare,
        toSquare,
        promotion: null,
      };

      this.apiService.sendMove(moveRequest).subscribe({
        next: (response: { newFEN: string; status: string }) => {
          console.log('Move response:', response);
          this.fenHelper.loadFen(response.newFEN);
          this.updateBoard();
          this.updateStatus();
          this.moveNumber++;
          this.selectedSquare = null;
          this.validMoves = [];
          this.errorMessage = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('Move error:', err);
          let errorMsg = 'Invalid move';
          if (err.error?.message) errorMsg = err.error.message;
          else if (err.status === 404) errorMsg = 'Match or player not found';
          else if (err.status === 400) errorMsg = 'Bad request: Invalid move data';
          else if (err.status === 500) errorMsg = 'Server error';
          this.errorMessage = errorMsg;
          this.selectedSquare = null;
          this.validMoves = [];
          this.cdr.detectChanges();
        },
      });
      return;
    }

    // Select a new piece if it exists
    if (this.board[rank][file]) {
      this.selectedSquare = { rank, file };
      this.getValidMoves(rank, file);
    } else {
      this.selectedSquare = null;
      this.validMoves = [];
      this.cdr.detectChanges();
    }
  }

  private toAlgebraic(rank: number, file: number): string {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return `${files[file]}${8 - rank}`;
  }

  getPieceSymbol(piece: string): string {
    const pieces: { [key: string]: string } = {
      r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', p: '♟',
      R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔', P: '♙',
    };
    return pieces[piece] || '';
  }

  public updateBoard(): void {
    this.fen = this.fenHelper.getFen();
    this.board = this.fenHelper.getBoard();
    console.log('Updated FEN:', this.fen);
    console.log('Updated board state:', this.board);
    this.cdr.detectChanges();
  }

  public updateStatus(newStatus?: string): void {
    if (newStatus) {
      this.status = newStatus;
      this.statusChange.emit(newStatus);
      return;
    }
    // Fallback to local status if backend doesn't provide one
    const status = this.fenHelper.getGameStatus();
    let computedStatus: string;
    if (status.inCheckmate) {
    const winnerId = status.activeColor === 'w' ? this.player2Id : this.player1Id;
    const winnerName = status.activeColor === 'w' ? this.player2 : this.player1;

    computedStatus = `Checkmate! ${winnerName} wins!`;

    if (this.currentMatchId) {
      this.apiService.updateMatchWinner(this.currentMatchId, winnerId).subscribe({
        next: () => {
          console.log(`✅ Match ${this.currentMatchId} updated with winner: ${winnerName} (ID ${winnerId})`);
        },
        error: (err) => {
          console.error(`Failed to update match winner:`, err);
          this.errorMessage = 'Failed to update match result.';
          this.cdr.detectChanges();
        },
      });
    }
  } else if (status.inStalemate) {
      computedStatus = 'Stalemate! Game over.';
    } else if (status.inDraw) {
      computedStatus = 'Draw! Game over.';
    } else if (status.inCheck) {
      computedStatus = `Check! Turn: ${status.activeColor === 'w' ? this.player1 : this.player2}`;
    } else {
      computedStatus = `Turn: ${status.activeColor === 'w' ? this.player1 : this.player2}`;
    }
    this.status = computedStatus;
    this.statusChange.emit(computedStatus);
  }

  onThemeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.themeChange.emit(target.value);
    }
  }
}