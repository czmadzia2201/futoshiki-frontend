import { Position } from './position';

export interface Move {
  beforeValue: number;
  afterValue: number;
  position: Position;
}
