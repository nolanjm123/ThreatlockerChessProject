import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../services/apiservice.service';
import { Match } from '../../models/match.model';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-match-list',
  standalone: true,
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.css']
})
export class MatchListComponent implements OnInit {
  matches: Match[] = [];
  @Output() matchSelected = new EventEmitter<number>();

  constructor(private apiservice: ApiService) {}

  ngOnInit(): void {
    this.loadMatches();
  }

  loadMatches() {
    this.apiservice.getMatches().subscribe({
      next: (data) => this.matches = data,
      error: (err) => console.error(err)
    });
  }

  selectMatch(matchId: number) {
    this.matchSelected.emit(matchId);
  }
}
