namespace ChessBackend.Models.Pieces
{
    public class King : Piece
    {
        public override PieceType Type => PieceType.King;
        public override PieceColor Color { get; }

        public King(PieceColor color)
        {
            Color = color;
        }

        public override bool IsValidMove((int File, int Rank) target, Board board)
        {
            // TODO: Implement King movement logic
            return false;
        }

        public Piece Copy()
        {
            King copy = new King(Color);
            copy.HasMoved = HasMoved;
            return copy;
        }
    }
}
