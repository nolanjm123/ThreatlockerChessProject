export interface Match {
  matchID: number;
  player1ID: number;
  player2ID: number;
  winnerID?: number;
  startTime: Date;
  endTime?: Date;
}
