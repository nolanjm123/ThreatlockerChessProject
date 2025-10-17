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
  private baseUrl = '/api/chess';
  private databaseUrl = '/api/database';

  constructor(private http: HttpClient) {}

  // Players
  getPlayer(id: number): Observable<Player> {
    return this.http.get<Player>(`${this.databaseUrl}/player/${id}`);
  }

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.databaseUrl}/players`);
  }

  createPlayer(name: string): Observable<{ playerID: number }> {
    return this.http.post<{ playerID: number }>(`${this.databaseUrl}/player?name=${encodeURIComponent(name)}`, {});
  }

  // Matches
  getMatch(matchId: number): Observable<Match> {
    return this.http.get<Match>(`${this.databaseUrl}/match/${matchId}`);
  }

  getMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.databaseUrl}/matches`);
  }

  createMatch(player1Id: number, player2Id: number): Observable<{ matchID: number }> {
    return this.http.post<{ matchID: number }>(
      `${this.databaseUrl}/match?player1Id=${player1Id}&player2Id=${player2Id}`,
      {}
    );
  }

  getMovesForMatch(matchId: number): Observable<Move[]> {
    return this.http.get<Move[]>(`${this.databaseUrl}/match/${matchId}/moves`);
  }

  getValidMoves(matchId: number, square: string): Observable<{ rank: number; file: number }[]> {
    return this.http.get<{ rank: number; file: number }[]>(`${this.baseUrl}/${matchId}/moves/valid/${square}`);
  }

  sendMove(moveRequest: { matchId: number; playerId: number; fromSquare: string; toSquare: string; promotion: string | null }): Observable<{ newFEN: string; status: string }> {
    return this.http.post<{ newFEN: string; status: string }>(`${this.baseUrl}/${moveRequest.matchId}/moves`, {
      playerID: moveRequest.playerId,
      fromSquare: moveRequest.fromSquare,
      toSquare: moveRequest.toSquare,
      promotion: moveRequest.promotion
    });
  }

  updateMatchWinner(matchId: number, winnerId: number): Observable<void> {
    return this.http.post<void>(`${this.databaseUrl}/match/${matchId}/winner`, null, {
      params: { winnerId }
    });
  }

  // Leaderboard
  getLeaderboard(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.databaseUrl}/leaderboard`);
  }
}
