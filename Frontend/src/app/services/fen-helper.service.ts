import { Injectable } from '@angular/core';
import { Chess } from 'chess.js';

@Injectable({
  providedIn: 'root',
})
export class FenHelper {
  private game: Chess;

  constructor() {
    this.game = new Chess(); // Initialize with starting position
  }

  // Load a FEN string for display
  loadFen(fen: string): boolean {
    try {
      this.game.load(fen);
      return true;
    } catch (error) {
      console.error('Invalid FEN:', error);
      return false;
    }
  }

  // Get current FEN for display
  getFen(): string {
    return this.game.fen();
  }

  // Get game status for display (e.g., turn, check)
  getGameStatus(): { activeColor: 'w' | 'b'; inCheck: boolean; inCheckmate: boolean; inStalemate: boolean; inDraw: boolean } {
    return {
      activeColor: this.game.turn(),
      inCheck: this.game.inCheck(),
      inCheckmate: this.game.isCheckmate(),
      inStalemate: this.game.isStalemate(),
      inDraw: this.game.isDraw(),
    };
  }

  getBoard(): string[][] {
    const board: string[][] = Array(8).fill(null).map(() => Array(8).fill(''));
    const fenRows = this.getFen().split(' ')[0].split('/');
    for (let rank = 0; rank < 8; rank++) {
      let file = 0;
      for (const char of fenRows[rank]) {
        if (/[1-8]/.test(char)) {
          file += parseInt(char); // Skip empty squares
        } else if (/[rnbqkpRNBQKP]/.test(char)) {
          board[7 - rank][file] = char; // FEN starts at rank 8
          file++;
        }
      }
    }
    return board;
  }
}