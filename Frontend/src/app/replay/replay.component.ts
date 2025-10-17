import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/apiservice.service';
import { FenHelper } from '../services/fen-helper.service';
import { ChessBoardComponent } from '../game/chess-board.component';
import { Match } from '../models/match.model';
import { Move } from '../models/move.model';
import { Chess } from 'chess.js'; // Import chess.js

interface NavigationState {
  matchID?: number;
  player1?: string;
  player2?: string;
  player1Id?: number;
  player2Id?: number;
}

@Component({
  selector: 'app-replay',
  standalone: true,
  imports: [CommonModule, ChessBoardComponent],
  templateUrl: './replay.component.html',
  styleUrls: ['./replay.component.scss'],
})
export class ReplayPage implements OnInit {
  @ViewChild(ChessBoardComponent) chessBoard!: ChessBoardComponent;

  matchID: number | null = null;
  player1: string = 'White';
  player2: string = 'Black';
  player1Id: number = 0;
  player2Id: number = 0;
  moves: Move[] = [];
  currentMoveIndex: number = -1; // -1 = initial position, 0 = first move, etc.
  status: string = 'Loading replay...';
  error: string | null = null;
  currentTheme: string = 'default';
  private chess: Chess = new Chess(); // Chess.js instance for FEN computation

  constructor(
    private apiService: ApiService,
    private fenHelper: FenHelper,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const state: NavigationState =
      this.router.getCurrentNavigation()?.extras?.state || history.state;

    if (!state?.matchID || !state.player1 || !state.player2 || !state.player1Id || !state.player2Id) {
      this.error = 'Invalid match data for replay.';
      this.status = '';
      this.cdr.detectChanges();
      return;
    }

    this.matchID = state.matchID;
    this.player1 = state.player1;
    this.player2 = state.player2;
    this.player1Id = state.player1Id;
    this.player2Id = state.player2Id;

    // Load initial position
    this.fenHelper.loadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    this.status = `Replay: ${this.player1} vs ${this.player2} - Initial position`;
    this.cdr.detectChanges();

    // Fetch moves
    this.apiService.getMovesForMatch(this.matchID!).subscribe({
      next: (moves: Move[]) => {
        this.moves = moves;
        this.status = moves.length > 0
          ? `Replay: ${this.player1} vs ${this.player2} - Use controls to navigate moves`
          : `Replay: ${this.player1} vs ${this.player2} - No moves recorded`;
        this.chess = new Chess(); // Reset chess.js to initial position
        this.chessBoard.updateBoard();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = `Failed to load moves: ${err.error || err.message || 'Unknown error'}.`;
        this.status = '';
        this.cdr.detectChanges();
      },
    });
  }

  goToPrevious(): void {
    if (this.currentMoveIndex > -1) {
      this.currentMoveIndex--;
      this.updateBoardAndStatus();
    }
  }

  goToNext(): void {
    if (this.currentMoveIndex < this.moves.length - 1) {
      this.currentMoveIndex++;
      this.updateBoardAndStatus();
    }
  }

  private updateBoardAndStatus(): void {
    // Reset chess.js to initial position
    this.chess = new Chess();

    // Apply moves up to currentMoveIndex
    for (let i = 0; i <= this.currentMoveIndex; i++) {
      const move = this.moves[i];
      if (!move.fromSquare || !move.toSquare) {
        this.error = `Missing move data at index ${i + 1}.`;
        this.status = '';
        this.cdr.detectChanges();
        return;
     }

      try {
        this.chess.move({
          from: move.fromSquare,
          to: move.toSquare,
          // promotion: move.promotion || undefined, // Uncomment if promotion is added
        });
      } catch (e) {
        this.error = `Invalid move at index ${i + 1}: ${move.fromSquare} to ${move.toSquare}`;
        this.status = '';
        this.cdr.detectChanges();
        return;
      }
    }

    // Update board with computed FEN
    const fen = this.chess.fen();
    this.fenHelper.loadFen(fen);

    // Update status
    if (this.currentMoveIndex === -1) {
      this.status = `Replay - Initial position`;
    } else {
      const move = this.moves[this.currentMoveIndex];
      const player = move.playerID === this.player1Id ? this.player1 : this.player2;
      this.status = `Move: ${this.currentMoveIndex + 1}, Player: ${player}, From: ${move.fromSquare}, To: ${move.toSquare}`;
    }

    this.chessBoard.updateBoard();
    this.cdr.detectChanges();
  }

  onThemeChange(theme: string): void {
    this.currentTheme = theme;
    this.cdr.detectChanges();
  }

  backToMenu(): void {
    this.router.navigate(['/']).then((success) => {
      console.log('Navigation to menu:', success ? 'Successful' : 'Failed');
    }).catch((error) => {
      console.error('Navigation error:', error);
    });
  }
}