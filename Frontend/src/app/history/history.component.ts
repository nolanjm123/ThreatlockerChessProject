import { Component, OnInit, HostListener} from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { ApiService } from '../services/apiservice.service';
import { FormsModule } from '@angular/forms';

interface Match {
  matchID: number;
  player1ID: number;
  player2ID: number;
  startTime: Date;
  endTime?: Date;
  winnerID?: number;
}

interface Player {
  playerID: number;
  username: string;
  wins: number;
  losses: number;
  draws: number;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryPage implements OnInit {
  selectedView: 'history' | 'leaderboard' = 'history';

  matches: Match[] = [];
  leaderboard: Player[] = [];
  playersMap: Map<number, string> = new Map();

  loadingMatches = true;
  loadingLeaderboard = true;

  selectedPlayerFilter?: number;
  filterInput: string = '';
  filteredPlayerSuggestions: Player[] = [];

  selectedPlayer: Player | null = null;
  matchesFilteredByPlayer: Match[] = [];


  constructor(private router: Router, private apiService: ApiService) {}


  ngOnInit(): void {
    console.log('\nNavigated to History\n\n');
    this.fetchMatches();
    this.fetchLeaderboard();
  }

  goBack() {
    this.router.navigate(['/']);
  }

  selectView(view: 'history' | 'leaderboard') {
    this.selectedView = view;
  }

  handleMatchClick(match: Match) {
  if (match.endTime) {
    alert(`Viewing play-by-play for match ${match.matchID}`);
    // TODO: Implement navigation to a replay
  } else {
    this.router.navigate(['/game'], {
      state: {
        matchID: match.matchID,
        player1: this.getPlayerName(match.player1ID),
        player2: this.getPlayerName(match.player2ID),
        player1Id: match.player1ID,
        player2Id: match.player2ID
      }
    });
  }
}

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // If click is outside the filter input or dropdown, hide suggestions
    if (!target.closest('.player-filter')) {
      this.filteredPlayerSuggestions = [];
    }
  }

  getPlayerName(playerID?: number): string {
    if (!playerID) return 'Unknown';
    return this.playersMap.get(playerID) || `Player ${playerID}`;
  }

  private fetchMatches() {
  this.apiService.getMatches().subscribe({
    next: (matches: Match[]) => {
      console.log('Matches received from API:', matches); // <-- debug
      this.matches = matches;

      matches.forEach(m => {
        if (!this.playersMap.has(m.player1ID)) this.playersMap.set(m.player1ID, `Player ${m.player1ID}`);
        if (!this.playersMap.has(m.player2ID)) this.playersMap.set(m.player2ID, `Player ${m.player2ID}`);
      });

      this.matchesFilteredByPlayer = [...this.matches];
      this.loadingMatches = false;
    },
    error: (err) => {
      console.error('Error fetching matches', err);
      this.loadingMatches = false;
    }
  });
}

private fetchLeaderboard() {
  this.apiService.getLeaderboard().subscribe({
    next: (players: Player[]) => {
      console.log('Leaderboard received from API:', players); // <-- debug
      this.leaderboard = players;

      players.forEach(p => this.playersMap.set(p.playerID, p.username));
      this.loadingLeaderboard = false;
    },
    error: (err) => {
      console.error('Error fetching leaderboard', err);
      this.loadingLeaderboard = false;
    }
  });
}



get filteredMatches(): Match[] {
  if (!this.selectedPlayerFilter) {
    return this.matches;
  }
  return this.matches.filter(
    m =>
      m.player1ID === this.selectedPlayerFilter ||
      m.player2ID === this.selectedPlayerFilter
  );
}

// Call this when the dropdown changes
onPlayerFilterChange(playerID?: number) {
  this.selectedPlayerFilter = playerID;
}

onFilterInputChange() {
  // Reset selectedPlayer if input doesn't match a player exactly
  const match = this.leaderboard.find(
    p => p.username.toLowerCase() === this.filterInput.toLowerCase()
  );
  this.selectedPlayer = match || null;

  this.applyMatchFilter();

  // Update suggestions based on typed input
  const inputLower = this.filterInput.toLowerCase();
  this.filteredPlayerSuggestions = this.leaderboard.filter(
    p => p.username.toLowerCase().startsWith(inputLower)
  );
}


selectPlayer(player: Player) {
  this.selectedPlayer = player;
  this.filterInput = player.username;
  this.filteredPlayerSuggestions = [];
  this.applyMatchFilter();
}

applyMatchFilter() {
  if (!this.selectedPlayer) {
    this.matchesFilteredByPlayer = [...this.matches];
    return;
  }

  const id = this.selectedPlayer.playerID;

  this.matchesFilteredByPlayer = this.matches.filter(
    m => m.player1ID === id || m.player2ID === id
  );
}


}
