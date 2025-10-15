// player-setup-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-player-setup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-setup-modal.component.html',
  styleUrls: ['./player-setup-modal.component.scss']
})
export class PlayerSetupModalComponent {
  @Input() allPlayers: Player[] = [];
  @Output() closeModal = new EventEmitter<void>();
  @Output() start = new EventEmitter<{player1: string, player2: string}>();

  player1 = '';
  player2 = '';

  // Temp database
  //allPlayers = ['Max', 'Maximus', 'Greg', 'Alice', 'Bob', 'bobbyboy'];
  filteredPlayers1: Player[] = [];
  filteredPlayers2: Player[] = [];

  onStart() {
    if (!this.player1) {
      alert("Must choose a player 1");
      return
    }
    if (!this.player2) {
      alert("Must choose a player 2");
      return
    }
    if (this.player1 == this.player2) {
      alert("Can't choose the same player");
      return
    }
    this.start.emit({ player1: this.player1, player2: this.player2 });
  }

  onCancel() {
    this.closeModal.emit();
  }

  filterPlayers1() {
    const query = this.player1.toLowerCase();
    this.filteredPlayers1 = this.allPlayers.filter(p =>
      p.username.toLowerCase().startsWith(query)
    );
  }

  filterPlayers2() {
    const query = this.player2.toLowerCase();
    this.filteredPlayers2 = this.allPlayers.filter(p =>
      p.username.toLowerCase().startsWith(query)
    );
  }

  selectPlayer1(player: Player) {
    this.player1 = player.username;
    this.filteredPlayers1 = [];
  }

  selectPlayer2(player: Player ) {
    this.player2 = player.username;
    this.filteredPlayers2 = [];
  }

  hideDropdown(player: number) {
  if (player === 1) {
    setTimeout(() => {
    this.filteredPlayers1 = [];
  }, 100);
  }
  if (player === 2) {
    setTimeout(() => {
    this.filteredPlayers2 = [];
  }, 100);
  }
}
}
