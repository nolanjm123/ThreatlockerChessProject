using ChessBackend.Models.Pieces;

namespace ChessBackend.Models
{
    public class GameState
    {
        public Board Board { get; set; } = new Board();
        public int MatchID { get; set; }
        public string CurrentFEN { get; set; } = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        public bool IsGameOver { get; set; }
        public int? WinnerID { get; set; }
    }
}