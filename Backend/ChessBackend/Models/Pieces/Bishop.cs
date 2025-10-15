namespace ChessBackend.Models.Pieces
{
    public class Bishop : Piece
    {
        public override PieceType Type => PieceType.Bishop;
        public override PieceColor Color { get; }

        public Bishop(PieceColor color)
        {
            Color = color;
        }

        public override bool IsValidMove((int File, int Rank) target, Board board)
        {
            // TODO: Implement Bishop movement logic
            return false;
        }

        public Piece Copy()
        {
            Bishop copy = new Bishop(Color);
            copy.HasMoved = HasMoved;
            return copy;
        }
    }
}
