import { Difficulty } from './difficulty';
import { Constraint } from './constraint';

export interface FutoshikiBoard {
  puzzleId: string;
  size: number;
  difficulty: Difficulty;
  grid: number[][];
  constraints: Constraint[];
}
