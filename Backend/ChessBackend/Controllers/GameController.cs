using ChessBackend.Models;
using ChessBackend.Services;
using Microsoft.AspNetCore.Mvc;

namespace ChessBackend.Controllers
{
    [Route("api/chess")]
    [ApiController]
    public class GameController : ControllerBase
    {
        private readonly GameService _gameService;

        public GameController(GameService gameService)
        {
            _gameService = gameService;
        }

        [HttpPost("{matchId}/moves")]
        public IActionResult MakeMove(int matchId, [FromBody] MoveRequest request)
        {
            Console.WriteLine($"[Controller] MakeMove called. MatchID={matchId}, PlayerID={request.PlayerID}");

            var (newFen, resultCode) = _gameService.MakeMove(
                matchId,
                request.PlayerID,
                request.FromSquare,
                request.ToSquare,
                request.Promotion
            );

            if (resultCode != 0)
            {
                string message = resultCode switch
                {
                    1 => "Match not found",
                    2 => "Not your turn",
                    3 => "Invalid move",
                    _ => "An error occurred"
                };
                return BadRequest(new { ErrorCode = resultCode, Message = message });
            }

            string status = newFen.Contains("w") ? "Turn: Player1" : "Turn: Player2";
            return Ok(new { newFEN = newFen, status });
        }

        [HttpGet("{matchId}/moves/valid/{square}")]
        public IActionResult GetValidMoves(int matchId, string square)
        {
            var moves = _gameService.GetValidMoves(matchId, square);
            if (moves == null)
            {
                return BadRequest(new { ErrorCode = 1, Message = "Match not found or invalid square" });
            }
            return Ok(moves);
        }

        [HttpPost("matches")]
        public IActionResult CreateMatch([FromQuery] int player1Id, [FromQuery] int player2Id)
        {
            var (matchId, resultCode) = _gameService.CreateMatch(player1Id, player2Id);
            if (resultCode != 0)
            {
                string message = resultCode switch
                {
                    -1 => "Failed to create match",
                    _ => "An error occurred"
                };
                return BadRequest(new { ErrorCode = resultCode, Message = message });
            }
            return Ok(new { matchID = matchId });
        }
    }

    public class MoveRequest
    {
        public int PlayerID { get; set; }
        public string FromSquare { get; set; } = null!;
        public string ToSquare { get; set; } = null!;
        public string? Promotion { get; set; }
    }
}