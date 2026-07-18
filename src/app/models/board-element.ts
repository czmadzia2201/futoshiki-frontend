import { ConstraintOperator } from './constraint-operator';

export interface BoardElement {
  type: BoardElementType;
  value: number | null;
  operator: ConstraintOperator | null;
}

export enum BoardElementType {
    CELL,
    HORIZONTAL_CONSTRAINT,
    VERTICAL_CONSTRAINT,
    EMPTY
}
