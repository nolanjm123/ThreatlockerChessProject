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
            int fileDiff = Math.Abs(target.File - Position.File);
            int rankDiff = Math.Abs(target.Rank - Position.Rank);

            // Knight moves in an "L" shape: 2 by 1 or 1 by 2
            bool isLMove = (fileDiff == 2 && rankDiff == 1) || (fileDiff == 1 && rankDiff == 2);
            if (!isLMove)
                return false;

            // Check if target square has a piece of the same color
            Piece? targetPiece = board.GetPieceAt(target);
            if (targetPiece != null && targetPiece.Color == this.Color)
                return false;

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
