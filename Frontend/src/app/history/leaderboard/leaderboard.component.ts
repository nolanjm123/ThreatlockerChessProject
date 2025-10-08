import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/apiservice.service';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  leaderboard: Player[] = [];

  constructor(private apiservice: ApiService) {}

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    this.apiservice.getLeaderboard().subscribe({
      next: (data) => this.leaderboard = data,
      error: (err) => console.error(err)
    });
  }
}
