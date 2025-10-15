namespace ChessBackend.Models
{
    public class Player
    {
        public int PlayerID { get; set; }
        public string? Username { get; set; } = string.Empty;
        public int Wins { get; set; }
        public int Losses { get; set; }
        public int Draws { get; set; }
    }
}
