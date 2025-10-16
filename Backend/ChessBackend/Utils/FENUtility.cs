using ChessBackend.Models.Pieces;
using ChessBackend.Models;
using ChessDotNet;

namespace ChessBackend.Utils
{
    public static class FENUtility
    {
        public static Board FenToBoard(string fen)
        {
            var game = new ChessGame(fen);
            var board = new Board();

            for (int rank = 0; rank < 8; rank++)  // rank here is board row: 0 = rank8, 7 = rank1
            {
                for (int file = 0; file < 8; file++)
                {
                    // ChessDotNet: File A=0...H=7, Rank 8...1
                    var fileEnum = (ChessDotNet.File)file;  // Fixed: 0=A, not +1
                    var chessRank = 8 - rank;  // For row 0 -> rank 8
                    var position = new Position(fileEnum, chessRank);

                    var piece = game.GetPieceAt(position);
                    if (piece != null)
                    {
                        var fenChar = piece.GetFenCharacter();  // 'P','p','N','n' etc.
                        var pieceType = GetPieceType(fenChar);
                        var pieceColor = char.IsUpper(fenChar) ? PieceColor.White : PieceColor.Black;

                        ChessBackend.Models.Pieces.Piece newPiece = pieceType switch
                        {
                            PieceType.Pawn => new Pawn(pieceColor) { Position = (file, rank) },
                            PieceType.Knight => new Knight(pieceColor) { Position = (file, rank) },
                            PieceType.Bishop => new Bishop(pieceColor) { Position = (file, rank) },
                            PieceType.Rook => new Rook(pieceColor) { Position = (file, rank) },
                            PieceType.Queen => new Queen(pieceColor) { Position = (file, rank) },
                            PieceType.King => new King(pieceColor) { Position = (file, rank) },
                            _ => throw new InvalidOperationException("Unknown piece type")
                        };
                        board.SetPiece((file, rank), newPiece);  // rank inverted consistently
                    }
                }
            }
            return board;
        }

        private static PieceType GetPieceType(char pieceChar)
        {
            return char.ToUpper(pieceChar) switch
            {
                'P' => PieceType.Pawn,
                'N' => PieceType.Knight,
                'B' => PieceType.Bishop,
                'R' => PieceType.Rook,
                'Q' => PieceType.Queen,
                'K' => PieceType.King,
                _ => throw new ArgumentException("Unknown piece character")
            };
        }

        public static string BoardToFen(Board board, GameState state)
        {
            var ranks = new string[8];
            for (int rank = 0; rank < 8; rank++)
            {
                var fenRank = "";
                int emptyCount = 0;
                for (int file = 0; file < 8; file++)
                {
                    var piece = board.GetPiece((file, rank));
                    if (piece == null)
                    {
                        emptyCount++;
                    }
                    else
                    {
                        if (emptyCount > 0)
                        {
                            fenRank += emptyCount.ToString();
                            emptyCount = 0;
                        }
                        var pieceChar = piece.Type switch
                        {
                            PieceType.Pawn => 'P',
                            PieceType.Knight => 'N',
                            PieceType.Bishop => 'B',
                            PieceType.Rook => 'R',
                            PieceType.Queen => 'Q',
                            PieceType.King => 'K',
                            _ => throw new ArgumentException("Unknown piece type")
                        };
                        fenRank += piece.Color == PieceColor.White ? pieceChar : char.ToLower(pieceChar);
                    }
                }
                if (emptyCount > 0)
                {
                    fenRank += emptyCount.ToString();
                }
                ranks[rank] = fenRank;
            }

            var position = string.Join("/", ranks);

            // Parse CurrentFEN for additional components
            var fenParts = state.CurrentFEN.Split(' ');
            string activeColor = fenParts.Length > 1 ? fenParts[1] : "w";
            string castling = fenParts.Length > 2 ? fenParts[2] : "KQkq";
            string enPassant = fenParts.Length > 3 ? fenParts[3] : "-";
            string halfmove = fenParts.Length > 4 ? fenParts[4] : "0";
            string fullmove = fenParts.Length > 5 ? fenParts[5] : "1";

            return $"{position} {activeColor} {castling} {enPassant} {halfmove} {fullmove}";
        }
    }
}