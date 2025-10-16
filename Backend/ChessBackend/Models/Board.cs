namespace ChessBackend.Models.Pieces
{
    public class Board
    {
        private Piece[,] _board = new Piece[8, 8];

        public Piece GetPiece((int File, int Rank) position)
        {
            if (position.File >= 0 && position.File < 8 && position.Rank >= 0 && position.Rank < 8)
                return _board[position.File, position.Rank];
            return null;
        }

        public void SetPiece((int File, int Rank) position, Piece piece)
        {
            if (position.File >= 0 && position.File < 8 && position.Rank >= 0 && position.Rank < 8)
                _board[position.File, position.Rank] = piece;
        }
    }
}