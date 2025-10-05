import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  private players = [
    'Max',
    'Maximus',
    'Greg',
    'Nolan',
    'Ava',
    'Maya',
    'Mayaa2',
    'Sophia'
  ];

  // Simulate a one-time "database fetch"
  getAllPlayers(): Promise<string[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.players), 300); // simulate network delay
    });
  }
}
