namespace ChessBackend.Models.Pieces
{
    public class Queen : Piece
    {
        public override PieceType Type => PieceType.Queen;
        public override PieceColor Color { get; }

        public Queen(PieceColor color)
        {
            Color = color;
        }

        public override bool IsValidMove((int File, int Rank) target, Board board)
        {
            // TODO: Implement Queen movement logic
            return false;
        }

        public Piece Copy()
        {
            Queen copy = new Queen(Color);
            copy.HasMoved = HasMoved;
            return copy;
        }
    }
}
