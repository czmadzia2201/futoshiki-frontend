import { ActiveGame } from '../../models/active-game';
import { Constraint } from '../../models/constraint';
import { ConstraintOperator } from '../../models/constraint-operator';
import { Position } from '../../models/position';

export class BoardValidator {

  static validate(activeGame: ActiveGame, currentGrid: number[][]): Position[] {
    const constraintConflicts: Position[] = this.findConstraintConflicts(activeGame, currentGrid);
    const rowAndColConflicts: Position[] = this.findRowAndColConflicts(currentGrid)
    return [ ...rowAndColConflicts, ...constraintConflicts ];
  }

  private static findRowAndColConflicts(currentGrid: number[][]): Position[] {
    const positions: Position[] = [];

    const rowMaps: Map<number, Position[]>[] = [];
    const colMaps: Map<number, Position[]>[] = [];

    for (let i = 0; i < currentGrid.length; i++) {
      rowMaps.push(new Map<number, Position[]>());
      colMaps.push(new Map<number, Position[]>());
    }

    for (let rowIndex = 0; rowIndex < currentGrid.length; rowIndex++) {
      for (let colIndex = 0; colIndex < currentGrid[rowIndex].length; colIndex++) {
        const value = currentGrid[rowIndex][colIndex];

        if (value === 0) {
          continue;
        }
        const position: Position = {
          row: rowIndex + 1,
          col: colIndex + 1
        };

        this.addPosition(rowMaps[rowIndex], value, position);
        this.addPosition(colMaps[colIndex], value, position);
      }
    }

    for (const valueMap of [...rowMaps, ...colMaps]) {
      for (const valuePositions of valueMap.values()) {
        if (valuePositions.length > 1) {
          positions.push(...valuePositions);
        }
      }
    }

    return positions;
  }

  private static addPosition(
    valueMap: Map<number, Position[]>,
    value: number,
    position: Position
  ): void {
    const existingPositions = valueMap.get(value);

    if (existingPositions) {
      existingPositions.push(position);
    } else {
      valueMap.set(value, [position]);
    }
  }

  private static findConstraintConflicts(activeGame: ActiveGame, currentGrid: number[][]): Position[] {
    const positions: Position[] = [];
    for (const constraint of activeGame.board.constraints) {
      const isValid = this.validateConstraint(constraint.from, constraint.to, constraint.operator, currentGrid);
      if (!isValid) {
        positions.push(constraint.from);
        positions.push(constraint.to);
      }
    }
    return positions;
  }

  private static validateConstraint(fromPosition: Position, toPosition: Position,
                                    operator: ConstraintOperator, currentGrid: number[][]): boolean {
      const fromValue = currentGrid[fromPosition.row - 1][fromPosition.col - 1];
      const toValue = currentGrid[toPosition.row - 1][toPosition.col - 1];
      if (fromValue === 0 || toValue === 0) {
        return true;
      }
      return (
          fromValue < toValue && operator === ConstraintOperator.LESS_THAN
        ) || (
          fromValue > toValue && operator === ConstraintOperator.GREATER_THAN
        );
  }

}
