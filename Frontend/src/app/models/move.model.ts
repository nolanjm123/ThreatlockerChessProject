export interface Move {
  moveID: number;
  matchID: number;
  moveNumber: number;
  playerID: number;
  pieceMoved?: string;
  fromSquare?: string;
  toSquare?: string;
  capturedPiece?: string;
  timeStamp: Date;
}
