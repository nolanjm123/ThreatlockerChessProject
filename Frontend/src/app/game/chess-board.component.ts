import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
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
    console.log('ChessBoardComponent ngOnInit');
    this.updateBoard();
    this.updateStatus();
  }

  isBoardValid(): boolean {
    const valid = this.board && this.board.length === 8 && this.board.every(row => row && row.length === 8);
    console.log('isBoardValid:', valid);
    return valid;
  }

  private getValidMoves(rank: number, file: number): { rank: number; file: number }[] {
    if (rank === 6 && file === 4 && this.board[rank][file] === 'P') {
      return [
        { rank: 5, file: 4 }, // e3
        { rank: 4, file: 4 }, // e4
      ];
    }
    return [];
  }

  isValidMove(rank: number, file: number): boolean {
    return this.validMoves.some(move => move.rank === rank && move.file === file);
  }

  onSquareClick(rank: number, file: number): void {
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

    // Handle valid move click
    if (this.selectedSquare && this.isValidMove(rank, file)) {
      const playerID = this.fenHelper.getGameStatus().activeColor === 'w' ? this.player1Id : this.player2Id;
      const fromSquare = this.toAlgebraic(this.selectedSquare.rank, this.selectedSquare.file);
      const toSquare = this.toAlgebraic(rank, file);
      const pieceMoved = this.board[this.selectedSquare.rank][this.selectedSquare.file];
      const capturedPiece = this.board[rank][file] || null;

      // Compute resulting FEN
      const resultingFEN = this.computeResultingFEN(
        this.fen,
        fromSquare,
        toSquare,
        pieceMoved,
        capturedPiece
      );
      console.log('Computed FEN:', resultingFEN);

      const move: Move = {
        moveID: 0,
        matchID: this.currentMatchId!,
        moveNumber: this.moveNumber,
        playerID: playerID,
        pieceMoved: pieceMoved,
        fromSquare: fromSquare,
        toSquare: toSquare,
        capturedPiece: capturedPiece,
        timeStamp: new Date(),
        ResultingFEN: resultingFEN, // Use camelCase to match backend
      };
      console.log('Sending move:', move);

      this.apiService.sendMove(this.currentMatchId!, move).subscribe({
        next: (moveResponse: { moveID: number }) => {
          console.log('Move saved, ID:', moveResponse.moveID);
          this.moveNumber++;
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
              console.log('Match response:', match);
              const fenToLoad = match.currentFEN || resultingFEN;
              console.log('Loading FEN:', fenToLoad);
              this.fenHelper.loadFen(fenToLoad);
              this.updateBoard();
              this.updateStatus();
              this.selectedSquare = null;
              this.validMoves = [];
              this.errorMessage = null;
              this.cdr.detectChanges();
            },
            error: (err) => {
              this.errorMessage = `Failed to load match: ${err.message || 'Unknown error'}`;
              this.selectedSquare = null;
              this.validMoves = [];
              this.cdr.detectChanges();
            },
          });
        },
        error: (err) => {
          let errorMsg = 'Invalid move';
          if (err.status === 404) {
            errorMsg = 'Match or player not found';
          } else if (err.status === 400) {
            errorMsg = 'Bad request: Invalid move data';
          } else if (err.status === 500) {
            errorMsg = 'Server error';
          }
          this.errorMessage = errorMsg;
          this.selectedSquare = null;
          this.validMoves = [];
          this.cdr.detectChanges();
        },
      });
      return;
    }

    // Select a new piece or deselect if clicking an empty or non-valid square
    if (this.board[rank][file]) {
      this.selectedSquare = { rank, file };
      this.validMoves = this.getValidMoves(rank, file);
    } else {
      this.selectedSquare = null;
      this.validMoves = [];
    }
    this.cdr.detectChanges();
  }

  private computeResultingFEN(
    currentFEN: string,
    fromSquare: string,
    toSquare: string,
    pieceMoved: string,
    capturedPiece: string | null
  ): string {
    const parts = currentFEN.split(' ');
    let position = parts[0];
    const activeColor = parts[1];
    const castling = parts[2];
    const enPassant = parts[3];
    const halfmove = parseInt(parts[4], 10);
    const fullmove = parseInt(parts[5], 10);

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const fromFile = files.indexOf(fromSquare[0]);
    const fromRank = 8 - parseInt(fromSquare[1], 10);
    const toFile = files.indexOf(toSquare[0]);
    const toRank = 8 - parseInt(toSquare[1], 10);

    const rows = position.split('/');
    const board = rows.map(row => {
      const chars = row.split('');
      const expanded = [];
      for (const char of chars) {
        if (isNaN(parseInt(char, 10))) {
          expanded.push(char);
        } else {
          for (let i = 0; i < parseInt(char, 10); i++) {
            expanded.push('');
          }
        }
      }
      return expanded;
    });

    board[toRank][toFile] = pieceMoved;
    board[fromRank][fromFile] = '';

    const newRows = board.map(row => {
      let emptyCount = 0;
      let fenRow = '';
      for (const square of row) {
        if (square === '') {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fenRow += emptyCount;
            emptyCount = 0;
          }
          fenRow += square;
        }
      }
      if (emptyCount > 0) {
        fenRow += emptyCount;
      }
      return fenRow;
    });
    const newPosition = newRows.join('/');

    const newActiveColor = activeColor === 'w' ? 'b' : 'w';
    const newHalfmove = capturedPiece || pieceMoved.toLowerCase() === 'p' ? 0 : halfmove + 1;
    const newFullmove = activeColor === 'b' ? fullmove + 1 : fullmove;

    const newFen = `${newPosition} ${newActiveColor} ${castling} ${enPassant} ${newHalfmove} ${newFullmove}`;
    console.log('Computed FEN:', newFen);
    return newFen;
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

  private updateBoard(): void {
    this.fen = this.fenHelper.getFen();
    this.board = this.fenHelper.getBoard();
    console.log('Updated FEN:', this.fen);
    console.log('Updated board state:', this.board);
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