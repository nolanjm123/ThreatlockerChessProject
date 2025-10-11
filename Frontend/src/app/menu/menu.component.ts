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


  startGame(players: { player1: string, player2: string }) {
    console.log('Navigating to game with players:', players.player1, players.player2);
    this.router.navigate(['/game'], {
      state: { player1: players.player1.trim(), player2: players.player2.trim() }
    });
    this.closeNewGameModal();
  }

  openHistoryPage() {
    this.router.navigate(['/history']);
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
    },
    error: (err) => {
      console.error('Error fetching players', err);
    }
  });
}
}