using ChessBackend.Models;
using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Http.HttpResults;

namespace ChessBackend.Services
{
    public class DatabaseService
    {
        private readonly string _connectionString;

        public DatabaseService(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection");
        }

        // -------------------- Players --------------------

        public int CreatePlayer(string name)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("CreatePlayer", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@Username", name ?? string.Empty);

            SqlParameter playerIdParam = new SqlParameter("@PlayerID", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            cmd.Parameters.Add(playerIdParam);

            SqlParameter resultCodeParam = new SqlParameter("@ResultCode", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            cmd.Parameters.Add(resultCodeParam);

            conn.Open();
            cmd.ExecuteNonQuery();

            int resultCode = (int)resultCodeParam.Value;

            if (resultCode == 0)
                return (int)playerIdParam.Value;

            return resultCode;
        }


        public Player? GetPlayer(int playerId)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("GetPlayer", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@PlayerID", playerId);

            conn.Open();
            using SqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                return new Player
                {
                    PlayerID = (int)reader["PlayerID"],
                    Username = reader["Username"] as string,
                    Wins = (int)reader["Wins"],
                    Losses = (int)reader["Losses"],
                    Draws = (int)reader["Draws"]
                };
            }

            return null;
        }

        public List<Player> GetAllPlayers()
        {
            var players = new List<Player>();

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("GetAllPlayers", conn);
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            conn.Open();
            using SqlDataReader reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                players.Add(new Player
                {
                    PlayerID = (int)reader["PlayerID"],
                    Username = reader["Username"] as string,
                    Wins = (int)reader["Wins"],
                    Losses = (int)reader["Losses"],
                    Draws = (int)reader["Draws"]
                });
            }

            return players;
        }


        // -------------------- Matches --------------------

        public int CreateMatch(int player1Id, int player2Id)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("CreateMatch", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@Player1ID", player1Id);
            cmd.Parameters.AddWithValue("@Player2ID", player2Id);
            cmd.Parameters.AddWithValue("@CurrentFEN", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

            SqlParameter matchIdParam = new SqlParameter("@MatchID", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            cmd.Parameters.Add(matchIdParam);

            SqlParameter resultCodeParam = new SqlParameter("@ResultCode", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            cmd.Parameters.Add(resultCodeParam);

            conn.Open();
            cmd.ExecuteNonQuery();

            int resultCode = (int)resultCodeParam.Value;
            int matchId = (int)matchIdParam.Value;

            switch (resultCode)
            {
                case 0: return matchId;
                case 1: return 1;
                case 2: return 2;
                default: return 0;
            };
        }


        public Match? GetMatch(int matchId)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("GetMatch", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@MatchID", matchId);

            conn.Open();
            using SqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                return new Match
                {
                    MatchID = (int)reader["MatchID"],
                    Player1ID = (int)reader["Player1ID"],
                    Player2ID = (int)reader["Player2ID"],
                    WinnerID = reader["WinnerID"] == DBNull.Value ? null : (int?)reader["WinnerID"],
                    StartTime = (DateTime)reader["StartTime"],
                    EndTime = reader["EndTime"] == DBNull.Value ? null : (DateTime?)reader["EndTime"],
                    CurrentFEN = reader["CurrentFEN"] as string
                };
            }

            return null;
        }

        public List<Match> GetAllMatches()
        {
            List<Match> matches = new List<Match>();

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("GetAllMatches", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            conn.Open();
            using SqlDataReader reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                matches.Add(new Match
                {
                    MatchID = (int)reader["MatchID"],
                    Player1ID = (int)reader["Player1ID"],
                    Player2ID = (int)reader["Player2ID"],
                    WinnerID = reader["WinnerID"] == DBNull.Value ? null : (int?)reader["WinnerID"],
                    StartTime = (DateTime)reader["StartTime"],
                    EndTime = reader["EndTime"] == DBNull.Value ? null : (DateTime?)reader["EndTime"],
                    CurrentFEN = reader["CurrentFEN"] as string
                });
            }

            return matches;
        }



        public int UpdateMatchWinner(int matchId, int winnerId) {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("UpdateMatchWinner", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@MatchID", matchId);
            cmd.Parameters.AddWithValue("@WinnerID", winnerId);
            SqlParameter resultParam = new SqlParameter("@Result", SqlDbType.Int) { Direction = ParameterDirection.Output };
            cmd.Parameters.Add(resultParam);

            conn.Open();
            cmd.ExecuteNonQuery();
            int result = (int)resultParam.Value;

            return result;
        }

        public int MatchIsDraw(int matchId)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("MatchIsDraw", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@MatchID", matchId);

            SqlParameter resultParam = new SqlParameter("@Result", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            cmd.Parameters.Add(resultParam);

            conn.Open();
            cmd.ExecuteNonQuery();

            int result = (int)resultParam.Value;
            return result;
        }


        // -------------------- Moves --------------------

        public int AddMove(Move move)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("AddMove", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@MatchID", move.MatchID);
            cmd.Parameters.AddWithValue("@MoveNumber", move.MoveNumber);
            cmd.Parameters.AddWithValue("@PlayerID", move.PlayerID);
            cmd.Parameters.AddWithValue("@PieceMoved", move.PieceMoved ?? string.Empty);
            cmd.Parameters.AddWithValue("@FromSquare", move.FromSquare ?? string.Empty);
            cmd.Parameters.AddWithValue("@ToSquare", move.ToSquare ?? string.Empty);
            cmd.Parameters.AddWithValue("@CapturedPiece", move.CapturedPiece ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ResultingFEN", move.ResultingFEN ?? (object)DBNull.Value);

            SqlParameter moveIdParam = new SqlParameter("@MoveID", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            cmd.Parameters.Add(moveIdParam);

            SqlParameter resultCodeParam = new SqlParameter("@ResultCode", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            cmd.Parameters.Add(resultCodeParam);

            conn.Open();
            cmd.ExecuteNonQuery();

            int resultCode = (int)resultCodeParam.Value;

            return resultCode;
        }


        public List<Move> GetMovesForMatch(int matchId)
        {
            var moves = new List<Move>();

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("GetMovesForMatch", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@MatchID", matchId);

            SqlParameter resultCodeParam = new SqlParameter("@ResultCode", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            cmd.Parameters.Add(resultCodeParam);

            conn.Open();

            using (SqlDataReader reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    moves.Add(new Move
                    {
                        MoveID = reader["MoveID"] == DBNull.Value ? 0 : (int)reader["MoveID"],
                        MatchID = reader["MatchID"] == DBNull.Value ? 0 : (int)reader["MatchID"],
                        MoveNumber = reader["MoveNumber"] == DBNull.Value ? 0 : (int)reader["MoveNumber"],
                        PlayerID = reader["PlayerID"] == DBNull.Value ? 0 : (int)reader["PlayerID"],
                        PieceMoved = reader["PieceMoved"] as string ?? "",
                        FromSquare = reader["FromSquare"] as string ?? "",
                        ToSquare = reader["ToSquare"] as string ?? "",
                        CapturedPiece = reader["CapturedPiece"] as string ?? "",
                        TimeStamp = reader["Timestamp"] == DBNull.Value ? DateTime.UtcNow : (DateTime)reader["Timestamp"],  // Default if null; fix column name if needed
                        ResultingFEN = reader["ResultingFEN"] as string ?? ""
                    });
                }
            }

            object resultCodeObj = resultCodeParam.Value;
            int resultCode = (resultCodeObj == DBNull.Value || resultCodeObj == null) ? 0 : (int)resultCodeObj;  // Default to 0 (success) if unset/DBNull

            if (resultCode != 0)
            {
                Console.WriteLine($"GetMovesForMatch: SP error ResultCode {resultCode} for MatchID {matchId}. Returning empty list.");
                return new List<Move>();
            }

            Console.WriteLine($"GetMovesForMatch: Returned {moves.Count} moves for MatchID {matchId}");
            return moves;
        }

        public int UpdateMatchFenAndStatus(int matchId, string newFen, bool isGameOver, int? winnerId)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("UpdateMatchFenAndStatus", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@MatchID", matchId);
            cmd.Parameters.AddWithValue("@CurrentFEN", newFen);
            cmd.Parameters.AddWithValue("@EndTime", isGameOver ? (object)DateTime.UtcNow : DBNull.Value);
            cmd.Parameters.AddWithValue("@WinnerID", winnerId.HasValue ? (object)winnerId.Value : DBNull.Value);

            SqlParameter resultCodeParam = new SqlParameter("@ResultCode", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            cmd.Parameters.Add(resultCodeParam);

            conn.Open();
            cmd.ExecuteNonQuery();

            return (int)resultCodeParam.Value;
        }


        // -------------------- Leaderboard --------------------

        public List<Player> GetLeaderboard()
        {
            var leaderboard = new List<Player>();

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("SELECT * FROM Players ORDER BY Wins DESC, Draws DESC, Losses ASC", conn);

            conn.Open();
            using SqlDataReader reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                leaderboard.Add(new Player
                {
                    PlayerID = (int)reader["PlayerID"],
                    Username = reader["Username"] as string,
                    Wins = (int)reader["Wins"],
                    Losses = (int)reader["Losses"],
                    Draws = (int)reader["Draws"]
                });
            }

            return leaderboard;
        }
    }
}
