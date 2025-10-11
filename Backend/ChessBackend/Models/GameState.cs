using ChessBackend.Models.Pieces;

namespace ChessBackend.Models
{
    public class GameState
    {
        public Board Board { get; private set; }
        public PieceColor CurrentTurn { get; private set; }
        public bool IsGameOver { get; private set; }

        //public string? BoardFEN { get; set }

        public GameState()
        {
            Board = new Board();
            CurrentTurn = PieceColor.White;
            IsGameOver = false;
            //BoardFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1s";
        }

        public void SwitchTurn()
        {
            CurrentTurn = (CurrentTurn == PieceColor.White) ? PieceColor.Black : PieceColor.White;
        }
    }
}
