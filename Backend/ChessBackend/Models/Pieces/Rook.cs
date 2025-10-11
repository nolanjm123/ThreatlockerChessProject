namespace ChessBackend.Models.Pieces
{
    public class Rook : Piece
    {
        public override PieceType Type => PieceType.Rook;
        public override PieceColor Color { get; }

        public Rook(PieceColor color)
        {
            Color = color;
        }

        public override bool IsValidMove((int File, int Rank) target, Board board)
        {
            // TODO: Implement Rook movement logic
            return false;
        }

        public Piece Copy()
        {
            Rook copy = new Rook(Color);
            copy.HasMoved = HasMoved;
            return copy;
        }
    }
}
