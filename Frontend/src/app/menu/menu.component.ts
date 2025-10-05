import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../services/player.service';
import { PlayerSetupModalComponent } from './player-setup-modal/player-setup-modal.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerSetupModalComponent],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuPage {
  showNewGameModal = false;
  player1 = "";
  player2 = "";

  constructor(private router: Router, private playerService: PlayerService) {}


  startGame(event: { player1: string; player2: string }) {
    console.log('Starting game with:', event.player1, event.player2);
    this.closeNewGameModal();
    this.router.navigate(['/game']);
  }
  

  openNewGameModal() {
    this.showNewGameModal = true;
    // Database fetch

  }

  closeNewGameModal() {
    this.showNewGameModal = false;
  }
}