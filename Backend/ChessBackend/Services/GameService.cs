using ChessBackend.Models;
using ChessBackend.Utils;
using ChessDotNet;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Linq;

namespace ChessBackend.Services
{
    public class GameService
    {
        private readonly DatabaseService _dbService;

        public GameService(DatabaseService dbService)
        {
            _dbService = dbService;
        }

        public (int MatchID, int ResultCode) CreateMatch(int player1Id, int player2Id)
        {
            int matchId = _dbService.CreateMatch(player1Id, player2Id);
            return (matchId, matchId > 0 ? 0 : matchId);
        }

        public List<MoveCoordinate>? GetValidMoves(int matchId, string square)
        {
            try
            {
                var match = _dbService.GetMatch(matchId);
                if (match == null)
                {
                    Console.WriteLine($"GetValidMoves: Match {matchId} not found");
                    return null;
                }

                Console.WriteLine($"GetValidMoves: MatchID={matchId}, Square={square}, CurrentFEN={match.CurrentFEN}");

                var game = new ChessGame(match.CurrentFEN);
                var fromPosition = new Position(square);
                var validMoves = game.GetValidMoves(fromPosition);

                var result = new List<MoveCoordinate>();
                var files = new[] { 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h' };
                foreach (var move in validMoves)
                {
                    string toSquare = move.NewPosition.ToString().ToLower();
                    Console.WriteLine($"GetValidMoves: Processing move to {toSquare}");
                    if (toSquare.Length == 2)
                    {
                        int file = Array.IndexOf(files, toSquare[0]);
                        int rank = 8 - int.Parse(toSquare[1].ToString());
                        if (file >= 0 && rank >= 0 && rank < 8)
                        {
                            result.Add(new MoveCoordinate(rank, file));
                            Console.WriteLine($"GetValidMoves: Added move ({rank}, {file})");
                        }
                        else
                        {
                            Console.WriteLine($"GetValidMoves: Invalid move coordinates for {toSquare}");
                        }
                    }
                    else
                    {
                        Console.WriteLine($"GetValidMoves: Invalid toSquare format: {toSquare}");
                    }
                }
                Console.WriteLine($"GetValidMoves: Returning {result.Count} moves");
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetValidMoves: Exception - {ex.Message}");
                return null;
            }
        }

        public (string? NewFEN, int ResultCode) MakeMove(int matchId, int playerId, string fromSquare, string toSquare, string? promotion)
        {
            try
            {
                var match = _dbService.GetMatch(matchId);
                if (match == null)
                {
                    Console.WriteLine($"MakeMove: Match {matchId} not found");
                    return (null, 1);
                }

                var game = new ChessGame(match.CurrentFEN);
                ChessDotNet.Player expectedPlayer = playerId == match.Player1ID ? ChessDotNet.Player.White : ChessDotNet.Player.Black;
                if (game.WhoseTurn != expectedPlayer)
                {
                    Console.WriteLine($"MakeMove: Not player {playerId}'s turn. Expected: {game.WhoseTurn}");
                    return (null, 2);
                }

                var fromPos = new Position(fromSquare);
                var toPos = new Position(toSquare);
                char? promotionPiece = promotion switch
                {
                    "Q" => 'Q',
                    "R" => 'R',
                    "B" => 'B',
                    "N" => 'N',
                    _ => null
                };

                var move = new ChessDotNet.Move(fromPos, toPos, expectedPlayer, promotionPiece);
                if (!game.IsValidMove(move))
                {
                    Console.WriteLine($"MakeMove: Invalid move: {fromSquare} to {toSquare}");
                    return (null, 3);
                }

                // After if (!game.IsValidMove(move)) ...
                var movingPieceObj = game.GetPieceAt(fromPos);
                string pieceMoved = GetFENFromPieceType(movingPieceObj, expectedPlayer);

                var capturedPieceObj = game.GetPieceAt(toPos);
                string capturedPiece = GetFENFromPieceType(capturedPieceObj, expectedPlayer);  // Uses captured's own color

                // Handle promotion
                if (promotionPiece != null)
                {
                    pieceMoved = expectedPlayer == ChessDotNet.Player.White
                        ? promotionPiece.Value.ToString().ToUpper()
                        : promotionPiece.Value.ToString().ToLower();
                }

                // Log
                Console.WriteLine($"MakeMove: PieceMoved='{pieceMoved}', Captured='{capturedPiece}' (pre-move)");

                game.MakeMove(move, true);
                string newFen = game.GetFen();
                Console.WriteLine($"New FEN from engine: {newFen}");

                // Game over checks (fine post-move)
                int? winnerId = null;
                bool isGameOver = false;
                if (game.IsCheckmated(game.WhoseTurn))
                {
                    winnerId = playerId == match.Player1ID ? match.Player2ID : match.Player1ID;
                    isGameOver = true;
                }
                else if (game.IsStalemated(game.WhoseTurn) || game.IsDraw())
                {
                    isGameOver = true;
                }

                // Use the pre-computed values
                var moveModel = new ChessBackend.Models.Move
                {
                    MatchID = matchId,
                    MoveNumber = GetNextMoveNumber(matchId),
                    PlayerID = playerId,
                    FromSquare = fromSquare,
                    ToSquare = toSquare,
                    PieceMoved = pieceMoved,  // Now "P" or "Q", etc.
                    CapturedPiece = capturedPiece,
                    TimeStamp = DateTime.UtcNow,
                    ResultingFEN = newFen
                };

                int moveResult = _dbService.AddMove(moveModel);
                if (moveResult != 0)
                {
                    Console.WriteLine($"MakeMove: Failed to add move, result: {moveResult}");
                    return (null, moveResult);
                }

                var state = new GameState
                {
                    Board = FENUtility.FenToBoard(newFen),
                    MatchID = matchId,
                    CurrentFEN = newFen,
                    IsGameOver = isGameOver,
                    WinnerID = winnerId
                };

                //int updateResult = _dbService.UpdateMatchFenAndStatus(matchId, newFen, isGameOver, winnerId);
                //if (updateResult != 0)
                //{
                //    Console.WriteLine($"MakeMove: Failed to update match, result: {updateResult}");
                //    return (null, updateResult);
                //}

                return (newFen, 0);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MakeMove: Exception - {ex.Message}\n{ex.StackTrace}");
                return (null, 4);
            }
        }

        private int GetNextMoveNumber(int matchId)
        {
            var moves = _dbService.GetMovesForMatch(matchId);
            if (moves == null || !moves.Any())
            {
                return 1;
            }
            return moves.Max(m => m.MoveNumber) + 1;
        }

        private string GetFENFromPieceType(ChessDotNet.Piece piece, ChessDotNet.Player currentPlayer)
        {
            if (piece == null) return "";
            return piece.GetFenCharacter().ToString();  // Handles case automatically
        }
    }
}