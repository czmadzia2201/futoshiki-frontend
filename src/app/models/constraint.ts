import { Position } from './position';
import { ConstraintOperator } from './constraint-operator';

export interface Constraint {
  from: Position;
  operator: ConstraintOperator;
  to: Position;
}
