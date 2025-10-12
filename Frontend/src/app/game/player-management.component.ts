// player-management.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/apiservice.service';
import { Player } from '../models/player.model';
import { firstValueFrom } from 'rxjs';

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