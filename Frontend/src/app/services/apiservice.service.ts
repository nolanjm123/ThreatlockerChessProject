import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from '../models/player.model';
import { Match } from '../models/match.model';
import { Move } from '../models/move.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://localhost:7020/api/database'; // your backend base URL

  constructor(private http: HttpClient) {}

  // Players
  getPlayer(id: number): Observable<Player> {
    return this.http.get<Player>(`${this.baseUrl}/player/${id}`);
  }

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.baseUrl}/players/`);
  }

  createPlayer(name: string): Observable<{ PlayerID: number }> {
    return this.http.post<{ PlayerID: number }>(`${this.baseUrl}/player`, null, {
      params: { name }
    });
  }

  // Matches
  getMatch(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.baseUrl}/match`); // NEED TO ADD MATCHID AT END OF URL
  }

  getMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.baseUrl}/matches`);
  }

  createMatch(player1Id: number, player2Id: number): Observable<{ MatchID: number }> {
    return this.http.post<{ MatchID: number }>(`${this.baseUrl}/match`, null, {
      params: { player1Id, player2Id }
    });
  }

  getMovesForMatch(matchId: number): Observable<Move[]> {
    return this.http.get<Move[]>(`${this.baseUrl}/match/${matchId}/moves`);
  }

  updateMatchWinner(matchId: number, winnerId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/match/${matchId}/winner`, null, {
      params: { winnerId }
    });
  }

  // Leaderboard
  getLeaderboard(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.baseUrl}/leaderboard`);
  }
}
