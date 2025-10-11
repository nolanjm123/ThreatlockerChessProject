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
    return this.http.get<Player[]>(`${this.baseUrl}/players`);
  }

  createPlayer(name: string): Observable<{ playerID: number }> {
    return this.http.post<{ playerID: number }>(`${this.baseUrl}/player?name=${encodeURIComponent(name)}`, {});
  }

  // Matches
  getMatch(matchId: number): Observable<Match> {
    return this.http.get<Match>(`${this.baseUrl}/match/${matchId}`); // NEED TO ADD MATCHID AT END OF URL
  }

  getMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.baseUrl}/matches`);
  }

  createMatch(player1Id: number, player2Id: number): Observable<{ matchID: number }> {
    return this.http.post<{ matchID: number }>(
      `${this.baseUrl}/match?player1Id=${player1Id}&player2Id=${player2Id}`,
      {}
    );
  }

  getMovesForMatch(matchId: number): Observable<Move[]> {
    return this.http.get<Move[]>(`${this.baseUrl}/match/${matchId}/moves`);
  }

  sendMove(matchId: number, move: { fromSquare: string; toSquare: string; promotion?: string, playerID: number}): Observable<Move> {
    return this.http.post<Move>(`${this.baseUrl}/move`, { matchId, ...move });
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
