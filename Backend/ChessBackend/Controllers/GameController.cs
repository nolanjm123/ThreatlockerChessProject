//using ChessBackend.Models;
//using ChessBackend.Models.Pieces;
//using ChessBackend.Services;
//using ChessBackend.Utils;
//using Microsoft.AspNetCore.Mvc;

//[ApiController]
//[Route("api/[controller]")]
//public class GameController : ControllerBase
//{
//    private readonly GameService _gameService;

//    public GameController(GameService gameService)
//    {
//        _gameService = gameService;
//    }

//    [HttpGet("board")]
//    public IActionResult GetBoard()
//    {
//        var board = _gameService.GetBoard();
//        var fen = FENUtility.GenerateFEN(board); // Convert board to FEN
//        var turn = _gameService.GetCurrentTurn();
//        return Ok(new { fen, turn });
//    }

//    [HttpPost("move")]
//    public IActionResult MakeMove([FromBody] MoveRequest move)
//    {
//        bool success = _gameService.MakeMove(move.From, move.To);
//        if (!success) return BadRequest("Invalid move");

//        var board = _gameService.GetBoard();
//        var fen = FENUtility.GenerateFEN(board);
//        var turn = _gameService.GetCurrentTurn();

//        return Ok(new { fen, turn });
//    }

//    [HttpPost("new")]
//    public IActionResult StartNewGame()
//    {
//        _gameService.StartNewGame();
//        var board = _gameService.GetBoard();
//        var fen = FENUtility.GenerateFEN(board);
//        var turn = _gameService.GetCurrentTurn();
//        return Ok(new { fen, turn });
//    }
//}
