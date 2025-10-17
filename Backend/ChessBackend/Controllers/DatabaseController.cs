using ChessBackend.Models;
using ChessBackend.Services;
using Microsoft.AspNetCore.Mvc;
using System.Numerics;
using System.Text.RegularExpressions;

namespace ChessBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseController : ControllerBase
    {
        private readonly DatabaseService _dbService;

        public DatabaseController(DatabaseService dbService)
        {
            _dbService = dbService;
        }

        // -------------------- Players --------------------

        [HttpPost("player")]
        public IActionResult CreatePlayer([FromQuery] string name)
        {
            int result = _dbService.CreatePlayer(name);

            switch (result)
            {
                case 0: return StatusCode(500, "Unexpected error occurred.");
                case 1: return BadRequest("Player name is required or invalid.");
                case 2: return StatusCode(500, "Database error occurred while creating player.");
                default: return Ok(new { PlayerID = result });
            }
        }

        [HttpGet("player/{id}")]
        public IActionResult GetPlayer(int id)
        {
            var player = _dbService.GetPlayer(id);

            if (player == null)
                return NotFound($"Player with ID {id} not found.");

            return Ok(player);
        }

        [HttpGet("players")]
        public IActionResult GetAllPlayers()
        {
                var players = _dbService.GetAllPlayers();

                if (players == null)
                    return NotFound($"No players found.");

                return Ok(players);
        }


        // -------------------- Matches --------------------

        [HttpPost("match")]
        public IActionResult CreateMatch([FromQuery] int player1Id, [FromQuery] int player2Id)
        {
            int result = _dbService.CreateMatch(player1Id, player2Id);
            switch (result) {
                case 0: return StatusCode(500);
                case 1: return NotFound();
                case 2: return BadRequest();
                default: return Ok(new { MatchID = result });
            };
        }

        [HttpGet("match/{id}")]
        public IActionResult GetMatch(int id)
        {
            var match = _dbService.GetMatch(id);
            if (match == null)
                return NotFound();

            return Ok(match);
        }

        [HttpGet("matches")]
        public IActionResult GetAllMatches()
        {
            var matches = _dbService.GetAllMatches();
            if (matches == null)
                return NotFound("cant find them bub");
            return Ok(matches);
        }

        [HttpPost("match/{id}/winner")]
        public IActionResult UpdateMatchWinner(int id, [FromQuery] int winnerId)
        {
            int result = _dbService.UpdateMatchWinner(id, winnerId);
            switch (result) {
                case 0: return Ok();
                case 1: return NotFound();
                case 2: return NotFound();
                case 3: return BadRequest();
                default: return StatusCode(500);
            };
        }

        [HttpPost("match/{id}/draw")]
        public IActionResult MatchIsDraw(int id)
        {
            int result = _dbService.MatchIsDraw(id);
            switch (result)
            {
                case 0: return Ok("Match marked as draw successfully.");
                case 1: return NotFound("Match not found.");
                default: return StatusCode(500, "Unexpected error occurred.");
            }
            ;
        }

        // -------------------- Moves --------------------

        [HttpPost("move")]
        public IActionResult AddMove([FromBody] Move move)
        {
            int result = _dbService.AddMove(move);

            switch (result)
            {
                case 0: return StatusCode(500);
                case 1: return NotFound();
                case 2: return NotFound();
                case 3: return BadRequest();
                default: return Ok(new { MoveId = result });
            }
        }


        [HttpGet("match/{id}/moves")]
        public IActionResult GetMovesForMatch(int id)
        {
            var moves = _dbService.GetMovesForMatch(id);

            if (moves == null)
                return StatusCode(500, "An error occurred while retrieving moves.");

            if (moves.Count == 0)
                return NotFound("No moves found for this match.");

            return Ok(moves);
        }



        // -------------------- Leaderboard --------------------

        [HttpGet("leaderboard")]
        public IActionResult GetLeaderboard()
        {
            var leaderboard = _dbService.GetLeaderboard();
            return Ok(leaderboard);
        }
    }
}
