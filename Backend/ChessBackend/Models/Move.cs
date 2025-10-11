namespace ChessBackend.Models
{
    public class Move
    {
        public int MoveID { get; set; }
        public int MatchID { get; set; }
        public int MoveNumber { get; set; }
        public int PlayerID { get; set; }
        public string? PieceMoved { get; set; }
        public string? FromSquare { get; set; }
        public string? ToSquare { get; set; }
        public string? CapturedPiece { get; set; }
        public DateTime TimeStamp { get; set; }
        public string? ResultingFEN { get; set; }
    }
}