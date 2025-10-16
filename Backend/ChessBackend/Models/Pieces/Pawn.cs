namespace ChessBackend.Models.Pieces
{
    public class Pawn : Piece
    {
        public override PieceType Type => PieceType.Pawn;
        public override PieceColor Color { get; }

        public Pawn(PieceColor color)
        {
            Color = color;
        }

        public override bool IsValidMove((int File, int Rank) target, Board board)
        {
            return false;
        }

        public Piece Copy()
        {
            Pawn copy = new Pawn(Color);
            copy.HasMoved = HasMoved;
            return copy;
        }
    }
}
