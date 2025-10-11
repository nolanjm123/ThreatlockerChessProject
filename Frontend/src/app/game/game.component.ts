import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../services/apiservice.service';
import { FenHelper } from '../services/fen-helper.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Match } from '../models/match.model';
import { Move } from '../models/move.model';
import { Player } from '../models/player.model';
import { firstValueFrom } from 'rxjs';


// Player Management Component
@Component({
  selector: 'app-player-management',
  standalone: true,
  imports: [CommonModule],
  template: '', // No UI needed, logic-only component
})
export class PlayerManagementComponent implements OnInit {
  @Input() player1: string = '';
  @Input() player2: string = '';
  @Output() playerIdsResolved = new EventEmitter<{ player1Id: number; player2Id: number }>();
  @Output() error = new EventEmitter<string>();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.resolvePlayerIds(this.player1, this.player2).catch((err) => {
      console.error('PlayerManagement error:', err);
      this.error.emit('Failed to resolve players: Please try again.');
    });
  }

  private resolvePlayerIds(player1: string, player2: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.getPlayers().subscribe({
        next: (players: Player[]) => {
          let player1Id: number | null = null;
          let player2Id: number | null = null;

          for (const player of players) {
            if (player.username.toLowerCase() === player1.toLowerCase()) {
              player1Id = player.playerID;
            }
            if (player.username.toLowerCase() === player2.toLowerCase()) {
              player2Id = player.playerID;
            }
            if (player1Id && player2Id) break;
          }

          const createPlayerPromises: Promise<number>[] = [];
          if (!player1Id) {
            createPlayerPromises.push(
              firstValueFrom(this.apiService.createPlayer(player1)).then((response) => {
                if (response && typeof response.playerID === 'number') {
                  return response.playerID;
                }
                throw new Error(`Invalid response for player1: ${player1}`);
              })
            );
          }
          if (!player2Id) {
            createPlayerPromises.push(
              firstValueFrom(this.apiService.createPlayer(player2)).then((response) => {
                if (response && typeof response.playerID === 'number') {
                  return response.playerID;
                }
                throw new Error(`Invalid response for player2: ${player2}`);
              })
            );
          }

          if (createPlayerPromises.length === 0) {
            if (!player1Id || !player2Id) {
              reject(new Error('Failed to find or create players'));
              return;
            }
            this.playerIdsResolved.emit({ player1Id, player2Id });
            resolve();
          } else {
            Promise.all(createPlayerPromises)
              .then((newPlayerIds) => {
                let index = 0;
                if (!player1Id) player1Id = newPlayerIds[index++];
                if (!player2Id) player2Id = newPlayerIds[index];
                this.playerIdsResolved.emit({ player1Id: player1Id!, player2Id: player2Id! });
                resolve();
              })
              .catch(reject);
          }
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }
}

// Chess Board Component
@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="board" *ngIf="board?.length === 8 && board[0]?.length === 8" [ngClass]="currentTheme">
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
          {{ getPieceSymbol(piece) }}
        </div>
      </div>
    </div>
    <div *ngIf="error" class="error">{{ error }}</div>
    <div class="status">{{ status }}</div>
    <select (change)="onThemeChange($event)">
      <option value="default">Default Theme</option>
      <option value="dark">Dark Theme</option>
    </select>
  `,
  styles: [], // Styles remain in game.component.scss
})
export class ChessBoardComponent implements OnInit {
  @Input() currentMatchId: number | null = null;
  @Input() player1Id: number = 0;
  @Input() player2Id: number = 0;
  @Input() player1: string = '';
  @Input() player2: string = '';
  @Input() currentTheme: string = 'default';
  @Output() statusChange = new EventEmitter<string>();
  @Output() error = new EventEmitter<string>();
  @Output() themeChange = new EventEmitter<string>();

  fen: string = '';
  board: string[][] = Array(8).fill(null).map(() => Array(8).fill(''));
  selectedSquare: { rank: number; file: number } | null = null;
  status: string = '';

  constructor(private apiService: ApiService, private fenHelper: FenHelper) {}

  ngOnInit(): void {
    this.updateBoard();
    this.updateStatus();
  }

  onSquareClick(rank: number, file: number): void {
    if (!this.currentMatchId) {
      this.error.emit('No active game. Start a new game.');
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
              this.error.emit('');
              this.selectedSquare = null;
            },
            error: () => {
              this.error.emit('Failed to update game state.');
              this.updateBoard();
            },
          });
        },
        error: () => {
          this.error.emit('Invalid move. Please try again.');
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
      r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', p: '♟',
      R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔', P: '♙',
    };
    return pieces[piece] || '';
  }

  private updateBoard(): void {
    this.fen = this.fenHelper.getFen();
    this.board = this.fenHelper.getBoard();
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

// Main Game Component
@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, PlayerManagementComponent, ChessBoardComponent],
  template: `
    <app-player-management
      [player1]="player1"
      [player2]="player2"
      (playerIdsResolved)="onPlayerIdsResolved($event)"
      (error)="onError($event)"
    ></app-player-management>
    <app-chess-board
      [currentMatchId]="currentMatchId"
      [player1Id]="player1Id"
      [player2Id]="player2Id"
      [player1]="player1"
      [player2]="player2"
      (statusChange)="onStatusChange($event)"
      (error)="onError($event)"
      [currentTheme]="currentTheme"
      (themeChange)="onThemeChange($event)"
    ></app-chess-board>
    <button (click)="backToMenu()">Back to Menu</button>
    <div *ngIf="error" class="error">{{ error }}</div>
    <div class="status">{{ status }}</div>
  `,
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  player1: string = 'White';
  player2: string = 'Black';
  player1Id: number = 0;
  player2Id: number = 0;
  currentMatchId: number | null = null;
  status: string = 'Starting new game...';
  error: string | null = null;
  currentTheme: string = 'default';

  constructor(
    private apiService: ApiService,
    private fenHelper: FenHelper,
    private router: Router
  ) {}

  ngOnInit(): void {
    const state = this.router.getCurrentNavigation()?.extras?.state || history.state;
    this.player1 = state?.player1?.trim() || 'White';
    this.player2 = state?.player2?.trim() || 'Black';
    this.startNewGame();
  }

  private startNewGame(): void {
    this.status = `Starting new game: ${this.player1} vs ${this.player2}...`;
    this.error = null;
  }

  onPlayerIdsResolved({ player1Id, player2Id }: { player1Id: number; player2Id: number }): void {
    this.player1Id = player1Id;
    this.player2Id = player2Id;
    this.apiService.createMatch(player1Id, player2Id).subscribe({
      next: (response: { matchID: number }) => {
        if (!response || typeof response.matchID !== 'number') {
          this.error = 'Failed to create match: Invalid response from server.';
          this.status = '';
          return;
        }
        this.currentMatchId = response.matchID;
        this.fenHelper.loadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      },
      error: (err: any) => {
        this.error = `Failed to start new game: ${err.error || err.message || 'Unknown error'}. Please try again.`;
        this.status = '';
      },
    });
  }

  onStatusChange(status: string): void {
    this.status = status;
  }

  onError(error: string): void {
    this.error = error;
    this.status = '';
  }

  onThemeChange(theme: string): void {
    this.currentTheme = theme;
  }

  backToMenu(): void {
    this.router.navigate(['/']);
  }
}

