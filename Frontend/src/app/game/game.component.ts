import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/apiservice.service';
import { FenHelper } from '../services/fen-helper.service';
import { PlayerManagementComponent } from './player-management.component';
import { ChessBoardComponent } from './chess-board.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, PlayerManagementComponent, ChessBoardComponent],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GamePage implements OnInit {
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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('GamePage ngOnInit called');
    const state = this.router.getCurrentNavigation()?.extras?.state || history.state;
    this.player1 = state?.player1?.trim() || 'White';
    this.player2 = state?.player2?.trim() || 'Black';
    console.log('Players:', this.player1, this.player2);
    this.startNewGame();
  }

  private startNewGame(): void {
    this.status = `Starting new game: ${this.player1} vs ${this.player2}...`;
    this.error = null;
    this.cdr.detectChanges();
  }

  onPlayerIdsResolved({ player1Id, player2Id }: { player1Id: number; player2Id: number }): void {
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
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = `Failed to start new game: ${err.error || err.message || 'Unknown error'}.`;
        this.status = '';
        this.cdr.detectChanges();
      },
    });
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