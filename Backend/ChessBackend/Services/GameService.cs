using ChessBackend.Models;
using ChessBackend.Models.Pieces;

namespace ChessBackend.Services
{
    public class GameService
    {
        private Board _board;
        private PieceColor _currentTurn;

        public GameService()
        {
            _board = new Board();
            _currentTurn = PieceColor.White;
        }

        public Board GetBoard() => _board;

        public PieceColor GetCurrentTurn() => _currentTurn;

        public void StartNewGame()
        {
            _board = new Board();
            _currentTurn = PieceColor.White;
        }

        public bool MakeMove((int File, int Rank) from, (int File, int Rank) to)
        {
            var piece = _board.GetPieceAt(from);
            if (piece == null || piece.Color != _currentTurn)
                return false;

            bool moved = _board.MovePiece(from, to);
            if (moved)
                _currentTurn = _currentTurn == PieceColor.White ? PieceColor.Black : PieceColor.White;

            return moved;
        }
    }
}
