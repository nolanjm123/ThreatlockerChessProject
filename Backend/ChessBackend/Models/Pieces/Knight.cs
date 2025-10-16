namespace ChessBackend.Models.Pieces
{
    public class Knight : Piece
    {
        public override PieceType Type => PieceType.Knight;
        public override PieceColor Color { get; }

        public Knight(PieceColor color)
        {
            Color = color;
        }

        public override bool IsValidMove((int File, int Rank) target, Board board)
        {
            return true;
        }
        
        public Piece Copy()
        {
            Knight copy = new Knight(Color);
            copy.HasMoved = HasMoved;
            return copy;
        }
    }
}
