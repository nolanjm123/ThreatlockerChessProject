using ChessBackend.Models;
using ChessBackend.Models.Pieces;
using System.Text;

namespace ChessBackend.Utils
{
    public static class FENUtility
    {
        public static string GenerateFEN(Board board)
        {
            StringBuilder fen = new();

            for (int rank = 7; rank >= 0; rank--)
            {
                int emptyCount = 0;
                for (int file = 0; file < 8; file++)
                {
                    var piece = board.Squares[file, rank];
                    if (piece == null)
                    {
                        emptyCount++;
                    }
                    else
                    {
                        if (emptyCount > 0)
                        {
                            fen.Append(emptyCount);
                            emptyCount = 0;
                        }
                        fen.Append(GetFenChar(piece));
                    }
                }

                if (emptyCount > 0)
                    fen.Append(emptyCount);

                if (rank > 0)
                    fen.Append('/');
            }

            // For now, we’ll keep the rest simple:
            fen.Append(" w KQkq - 0 1");
            return fen.ToString();
        }

        private static char GetFenChar(Piece piece)
        {
            char symbol = piece.Type switch
            {
                PieceType.Pawn => 'p',
                PieceType.Knight => 'n',
                PieceType.Bishop => 'b',
                PieceType.Rook => 'r',
                PieceType.Queen => 'q',
                PieceType.King => 'k',
                _ => '?'
            };

            return piece.Color == PieceColor.White ? char.ToUpper(symbol) : symbol;
        }


        public static Board GenerateBoard(string fen)
        {
            var board = new Board();

            // Clear the board first
            for (int file = 0; file < 8; file++)
                for (int rank = 0; rank < 8; rank++)
                    board.Squares[file, rank] = null;

            string[] parts = fen.Split(' ');
            string[] rows = parts[0].Split('/');

            for (int rank = 7; rank >= 0; rank--) // FEN starts from rank 8 to 1
            {
                int file = 0;
                foreach (char c in rows[7 - rank])
                {
                    if (char.IsDigit(c))
                    {
                        file += (int)char.GetNumericValue(c);
                    }
                    else
                    {
                        var piece = CharToPiece(c);
                        if (piece != null)
                        {
                            piece.Position = (file, rank);
                            board.Squares[file, rank] = piece;
                            file++;
                        }
                    }
                }
            }

            return board;
        }

        private static Piece? CharToPiece(char c)
        {
            PieceColor color = char.IsUpper(c) ? PieceColor.White : PieceColor.Black;
            char lower = char.ToLower(c);

            return lower switch
            {
                'p' => new Pawn(color),
                'n' => new Knight(color),
                'b' => new Bishop(color),
                'r' => new Rook(color),
                'q' => new Queen(color),
                'k' => new King(color),
                _ => null
            };
        }
    }
}
