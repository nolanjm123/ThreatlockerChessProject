using ChessBackend.Models.Pieces;

namespace ChessBackend.Models
{
    public class Board
    {
        public Piece?[,] Squares { get; private set; }

        public Board()
        {
            Squares = new Piece?[8, 8];
            SetupInitialPosition();
        }

        private void SetupInitialPosition()
        {
            // Place pawns
            for (int file = 0; file < 8; file++)
            {
                Squares[file, 1] = new Pawn(PieceColor.White);
                Squares[file, 6] = new Pawn(PieceColor.Black);
            }

            // Place other pieces
            Squares[0, 0] = new Rook(PieceColor.White);
            Squares[7, 0] = new Rook(PieceColor.White);
            Squares[0, 7] = new Rook(PieceColor.Black);
            Squares[7, 7] = new Rook(PieceColor.Black);

            // Knights
            Squares[1, 0] = new Knight(PieceColor.White);
            Squares[6, 0] = new Knight(PieceColor.White);
            Squares[1, 7] = new Knight(PieceColor.Black);
            Squares[6, 7] = new Knight(PieceColor.Black);

            // Bishops
            Squares[2, 0] = new Bishop(PieceColor.White);
            Squares[5, 0] = new Bishop(PieceColor.White);
            Squares[2, 7] = new Bishop(PieceColor.Black);
            Squares[5, 7] = new Bishop(PieceColor.Black);

            // Queens
            Squares[3, 0] = new Queen(PieceColor.White);
            Squares[3, 7] = new Queen(PieceColor.Black);

            // Kings
            Squares[4, 0] = new King(PieceColor.White);
            Squares[4, 7] = new King(PieceColor.Black);

            // Update positions in pieces
            for (int file = 0; file < 8; file++)
            {
                for (int rank = 0; rank < 8; rank++)
                {
                    if (Squares[file, rank] != null)
                        Squares[file, rank]!.Position = (file, rank);
                }
            }
        }

        public Piece? GetPieceAt((int File, int Rank) pos)
        {
            if (!IsInBounds(pos)) return null;
            return Squares[pos.File, pos.Rank];
        }

        public bool MovePiece((int File, int Rank) from, (int File, int Rank) to)
        {
            var piece = GetPieceAt(from);
            if (piece == null) return false;

            if (!piece.IsValidMove(to, this)) return false;

            // Move the piece
            Squares[to.File, to.Rank] = piece;
            Squares[from.File, from.Rank] = null;
            piece.Position = to;
            piece.HasMoved = true;

            return true;
        }

        public bool IsInBounds((int File, int Rank) pos)
        {
            return pos.File >= 0 && pos.File < 8 && pos.Rank >= 0 && pos.Rank < 8;
        }

        public Board Clone()
        {
            var copy = new Board();
            for (int f = 0; f < 8; f++)
                for (int r = 0; r < 8; r++)
                    if (Squares[f, r] != null)
                        copy.Squares[f, r] = Squares[f, r];

            return copy;
        }

    }
}
