import { Component, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/apiservice.service';
import { FenHelper } from '../services/fen-helper.service';
import { PlayerManagementComponent } from './player-management.component';
import { ChessBoardComponent } from './chess-board.component';
import { Match } from '../models/match.model'; // Import Match interface

// Define interface for navigation state
interface NavigationState {
  matchID?: number;
  player1?: string;
  player2?: string;
  player1Id?: number;
  player2Id?: number;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, PlayerManagementComponent, ChessBoardComponent],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GamePage implements OnInit, AfterViewInit {
  @ViewChild(ChessBoardComponent) chessBoard!: ChessBoardComponent;

  player1: string = 'White';
  player2: string = 'Black';
  player1Id: number = 0;
  player2Id: number = 0;
  currentMatchId: number | null = null;
  status: string = 'Loading game...';
  error: string | null = null;
  currentTheme: string = 'default';

  private isBoardReady = false;
  private pendingUpdate = false;

  constructor(
    private apiService: ApiService,
    private fenHelper: FenHelper,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('GamePage ngOnInit called');
    const state: NavigationState =
      this.router.getCurrentNavigation()?.extras?.state || history.state;

    if (state?.matchID) {
      // Resume existing game
      this.resumeGame(state);
    } else {
      // New game
      this.player1 = state?.player1?.trim() || 'White';
      this.player2 = state?.player2?.trim() || 'Black';
      console.log('Players:', this.player1, this.player2);
      this.status = `Starting new game: ${this.player1} vs ${this.player2}...`;
      this.cdr.detectChanges();
      // PlayerManagementComponent will trigger onPlayerIdsResolved to create match
    }
  }

  ngAfterViewInit(): void {
    this.isBoardReady = true;
    if (this.pendingUpdate) {
      this.updateChildBoard();
      this.pendingUpdate = false;
    }
    this.cdr.detectChanges();
  }

  private resumeGame(state: NavigationState): void {
    if (!state.matchID || !state.player1 || !state.player2 || !state.player1Id || !state.player2Id) {
      this.error = 'Invalid game data for resuming.';
      this.status = '';
      this.cdr.detectChanges();
      return;
    }

    this.currentMatchId = state.matchID;
    this.player1 = state.player1;
    this.player2 = state.player2;
    this.player1Id = state.player1Id;
    this.player2Id = state.player2Id;
    this.status = `Resuming game: ${this.player1} vs ${this.player2}...`;
    this.error = null;
    this.cdr.detectChanges();

    // Fetch match details including currentFEN
    this.apiService.getMatch(this.currentMatchId).subscribe({
      next: (match: Match) => {
        if (match.currentFEN) {
          this.fenHelper.loadFen(match.currentFEN);
          this.status = `Game resumed: Turn for ${this.fenHelper.getGameStatus().activeColor === 'w' ? this.player1 : this.player2}`;
          this.triggerBoardUpdate();
        } else {
          this.error = 'Failed to resume: No FEN found for match.';
          this.status = '';
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        this.error = `Failed to resume game: ${err.error || err.message || 'Unknown error'}.`;
        this.status = '';
        this.cdr.detectChanges();
      },
    });
  }

  onPlayerIdsResolved({ player1Id, player2Id }: { player1Id: number; player2Id: number }): void {
    // Only for new games
    if (this.currentMatchId) return; // Skip if resuming

    this.player1Id = player1Id;
    this.player2Id = player2Id;
    this.apiService.createMatch(player1Id, player2Id).subscribe({
      next: (response: { matchID: number }) => {
        if (!response || typeof response.matchID !== 'number') {
          this.error = 'Failed to create match: Invalid response from server.';
          this.status = '';
          this.cdr.detectChanges();
          return;
        }
        this.currentMatchId = response.matchID;
        this.fenHelper.loadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        this.status = `Game started: Turn for ${this.player1}`;
        this.triggerBoardUpdate();
      },
      error: (err: any) => {
        this.error = `Failed to start new game: ${err.error || err.message || 'Unknown error'}.`;
        this.status = '';
        this.cdr.detectChanges();
      },
    });
  }

  private triggerBoardUpdate(): void {
    this.cdr.detectChanges();
    if (this.isBoardReady && this.chessBoard) {
      this.updateChildBoard();
    } else {
      this.pendingUpdate = true;
    }
  }

  private updateChildBoard(): void {
    this.chessBoard.updateBoard();
    this.chessBoard.updateStatus();
    this.cdr.detectChanges();
    console.log('Forced board update after FEN load');
  }

  onStatusChange(status: string): void {
    this.status = status;
    this.cdr.detectChanges();
    console.log('GameComponent status:', status);
  }

  onError(error: string): void {
    this.error = error;
    this.status = '';
    this.cdr.detectChanges();
    console.log('GameComponent error:', error);
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