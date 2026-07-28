import { ActiveGame } from '../../models/active-game';
import { BoardElement, BoardElementType } from '../../models/board-element';

export class GridResolver {

    static resolve(activeGame: ActiveGame, currentGrid: number[][], candidates: number[][][]): BoardElement[][] {
      const size = activeGame.board.size * 2 - 1;

      const fullBoard: BoardElement[][] = new Array(size);

      for (let row = 0; row < size; row++) {
        fullBoard[row] = new Array(size);

        for (let col = 0; col < size; col++) {
          if (this.isEven(row) && this.isEven(col)) {
            const value = currentGrid[row / 2][col / 2];
            const cellCandidates = candidates[row / 2][col / 2]
            if (value !== 0 && cellCandidates.length !== 0) {
              throw new Error(
                  `Invariant violated at (${row/2}, ${col/2}): filled cell cannot contain candidates.`
              );
            }
            fullBoard[row][col] = {
              type: BoardElementType.CELL,
              value: value === 0 ? null : value,
              candidates: cellCandidates,
              operator: null
            };
          } else if (this.isOdd(row) && this.isOdd(col)) {
            fullBoard[row][col] = {
              type: BoardElementType.EMPTY,
              value: null,
              candidates: null,
              operator: null
            };
          } else if (this.isOdd(row) && this.isEven(col)) {
            fullBoard[row][col] = {
              type: BoardElementType.VERTICAL_CONSTRAINT,
              value: null,
              candidates: null,
              operator: null
            };
          } else {
            fullBoard[row][col] = {
              type: BoardElementType.HORIZONTAL_CONSTRAINT,
              value: null,
              candidates: null,
              operator: null
            };
          }
        }
      }

      this.populateConstraints(activeGame, fullBoard);
      return fullBoard;
    }

    private static populateConstraints(activeGame: ActiveGame, fullBoard: BoardElement[][]): void {
      const constraints = activeGame!.board.constraints;
      for (const constraint of constraints) {
        const fromRow = (constraint.from.row - 1) * 2;
        const fromCol = (constraint.from.col - 1) * 2;

        const toRow = (constraint.to.row - 1) * 2;
        const toCol = (constraint.to.col - 1) * 2;

        const row = (fromRow + toRow) / 2;
        const col = (fromCol + toCol) / 2;

        fullBoard[row][col].operator = constraint.operator;
      }
    }

    private static isEven(number: number): boolean {
      return number % 2 === 0;
    }

    private static isOdd(number: number): boolean {
      return number % 2 === 1;
    }

}
