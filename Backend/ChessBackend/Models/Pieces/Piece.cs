namespace ChessBackend.Models.Pieces
{
    public enum PieceType
    {
        Pawn,
        Knight,
        Bishop,
        Rook,
        Queen,
        King
    }

    public enum PieceColor
    {
        White,
        Black
    }

    public abstract class Piece
    {
        public abstract PieceType Type { get; }
        public abstract PieceColor Color { get; }
        public bool HasMoved { get; set; }
        public (int File, int Rank) Position { get; set; }

        protected Piece()
        {
            Position = (-1,-1);
            HasMoved = false;
        }

        public bool IsOpponent(Piece? other)
        {
            return other != null && this.Color != other.Color;
        }

        public abstract bool IsValidMove((int File, int Rank) target, Board board);
    }
}