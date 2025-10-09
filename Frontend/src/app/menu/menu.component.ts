import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/apiservice.service';
import { PlayerSetupModalComponent } from './player-setup-modal/player-setup-modal.component';
import { Player } from '../models/player.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerSetupModalComponent],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuPage {
  showNewGameModal = false;
  players: Player[] = [];
  playersMap: Map<number, string> = new Map();
  player1 = "";
  player2 = "";

  constructor(private router: Router, private apiService: ApiService) {}


  startGame(event: { player1: string; player2: string }) {
    console.log('Starting game with:', event.player1, event.player2);
    this.closeNewGameModal();
    this.router.navigate(['/game']);
  }

  openHistoryPage() {
    this.router.navigate(['/history']);
    // Database fetch
  }
  

  openNewGameModal() {
    this.showNewGameModal = true;
    this.fetchPlayers();
  }

  closeNewGameModal() {
    this.showNewGameModal = false;
  }

  private fetchPlayers() {
  this.apiService.getPlayers().subscribe({
    next: (players: Player[]) => {
      console.log('Players received from API:', players);
      this.players = players;

      // players.forEach(p => {
      //   this.playersMap.set(p.playerID, p.username);
      // });
    },
    error: (err) => {
      console.error('Error fetching players', err);
    }
  });
}
}