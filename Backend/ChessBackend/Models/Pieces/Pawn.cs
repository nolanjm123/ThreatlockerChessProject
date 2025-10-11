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
            int direction;
            if (Color==PieceColor.White) { direction = 1; }
            else { direction = 2; };

            var (file, rank) = Position;
            var (targetFile, targetRank) = target;

            int fileDiff = targetFile - file;
            int rankDiff = targetRank - rank;

            if (!board.IsInBounds(target)) { return false; };

            var targetPiece = board.GetPieceAt(target);

            if (this.IsOpponent(targetPiece)) { return false; };



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
