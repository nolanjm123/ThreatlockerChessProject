import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/apiservice.service';
import { FenHelper } from '../services/fen-helper.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Match } from '../models/match.model';
import { Move } from '../models/move.model';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GamePage implements OnInit {
  fen: string = '';
  board: string[][] = [];
  status: string = 'Starting new game...';
  error: string | null = null;
  currentMatchId: number | null = null;
  currentTheme: string = 'default';
  selectedSquare: { rank: number; file: number } | null = null;

  constructor(private apiService: ApiService, private fenHelper: FenHelper, private router: Router) {}

  ngOnInit(): void {
    this.startNewGame();
  }

  // Start a new game
  startNewGame(): void {
    this.status = 'Starting new game...';
    this.error = null;
    const player1Id = 1; // TODO: Replace with real player ID
    const player2Id = 2; // TODO: Replace with real player ID (or null for AI)
    this.apiService.createMatch(player1Id, player2Id).subscribe({
      next: (response: any) => {
        // Map backend response to Match interface
        const match: Match = {
          matchID: response.matchID,
          player1ID: response.player1ID,
          player2ID: response.player2ID,
          winnerID: response.winnerID,
          startTime: new Date(response.startTime), // Convert string to Date
          endTime: response.endTime ? new Date(response.endTime) : undefined,
          currentFEN: response.currentFEN,
        };
        this.currentMatchId = match.matchID;
        this.fenHelper.loadFen(match.currentFEN || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        this.fen = this.fenHelper.getFen();
        this.board = this.fenHelper.getBoard();
        this.updateStatus();
      },
      error: (err) => {
        console.error('createMatch error:', err);
        this.error = 'Failed to start new game. Please try again.';
        this.status = '';
      },
    });
  }

  // Handle square click for move input
  onSquareClick(rank: number, file: number): void {
    if (!this.currentMatchId) {
      this.error = 'No active game. Start a new game.';
      return;
    }

    // TODO: Replace with actual player ID from auth
    const playerID = this.fenHelper.getGameStatus().activeColor === 'w' ? 1 : 2;

    if (!this.selectedSquare) {
      if (this.board[rank][file]) {
        this.selectedSquare = { rank, file };
      }
    } else {
      const move = {
        fromSquare: this.toAlgebraic(this.selectedSquare.rank, this.selectedSquare.file),
        toSquare: this.toAlgebraic(rank, file),
        promotion: 'q', // Default to queen; add UI for promotion later
        playerID,
      };
      this.apiService.sendMove(this.currentMatchId, move).subscribe({
        next: (moveResponse: Move) => {
          this.apiService.getMatch(this.currentMatchId!).subscribe({
            next: (response: any) => {
              const match: Match = {
                matchID: response.matchID,
                player1ID: response.player1ID,
                player2ID: response.player2ID,
                winnerID: response.winnerID,
                startTime: new Date(response.startTime),
                endTime: response.endTime ? new Date(response.endTime) : undefined,
                currentFEN: response.currentFEN,
              };
              this.fenHelper.loadFen(match.currentFEN || this.fen);
              this.fen = this.fenHelper.getFen();
              this.board = this.fenHelper.getBoard();
              this.updateStatus();
              this.error = null;
              this.selectedSquare = null;
            },
            error: () => {
              this.error = 'Failed to update game state.';
              this.board = this.fenHelper.getBoard();
            },
          });
        },
        error: () => {
          this.error = 'Invalid move. Please try again.';
          this.selectedSquare = null;
        },
      });
    }
  }

  private toAlgebraic(rank: number, file: number): string {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return `${files[file]}${8 - rank}`;
  }

  getPieceSymbol(piece: string): string {
    const pieces: { [key: string]: string } = {
      'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
      'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙',
    };
    return pieces[piece] || '';
  }

  private updateStatus(): void {
    const status = this.fenHelper.getGameStatus();
    if (status.inCheckmate) {
      this.status = 'Checkmate! Game over.';
    } else if (status.inStalemate) {
      this.status = 'Stalemate! Game over.';
    } else if (status.inDraw) {
      this.status = 'Draw! Game over.';
    } else if (status.inCheck) {
      this.status = `Check! Turn: ${status.activeColor === 'w' ? 'White' : 'Black'}`;
    } else {
      this.status = `Turn: ${status.activeColor === 'w' ? 'White' : 'Black'}`;
    }
  }

  onThemeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.currentTheme = target.value;
    }
  }

  backToMenu(): void {
    this.router.navigate(['/']);
  }
}