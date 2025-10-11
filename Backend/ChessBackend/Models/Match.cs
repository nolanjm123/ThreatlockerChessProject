namespace ChessBackend.Models
{
    public class Match
    {
        public int MatchID { get; set; }
        public int Player1ID { get; set; }
        public int Player2ID { get; set; }
        public int? WinnerID { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? CurrentFEN {  get; set; }
    }
}
