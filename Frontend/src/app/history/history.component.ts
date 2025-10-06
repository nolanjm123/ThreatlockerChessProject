import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

interface Match {
  player1: string;
  player2: string;
  startTime: Date;
  winner?: string;
  isConcluded: boolean;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryPage {
  selectedView: 'history' | 'leaderboard' = 'history';

  matches: Match[] = [
    {
      player1: 'Nolan',
      player2: 'AI Bot',
      startTime: new Date('2025-10-06T14:20:00'),
      winner: 'Nolan',
      isConcluded: true
    },
    {
      player1: 'Alice',
      player2: 'Bob',
      startTime: new Date('2025-10-05T18:00:00'),
      isConcluded: false
    }
  ];

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']);
  }

  selectView(view: 'history' | 'leaderboard') {
    this.selectedView = view;
  }

  handleMatchClick(match: Match) {
    if (match.isConcluded) {
      alert(`Viewing play-by-play for ${match.player1} vs ${match.player2}`);
    } else {
      alert(`Resuming match between ${match.player1} and ${match.player2}`);
    }
  }
}
