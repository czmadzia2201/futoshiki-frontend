import { FutoshikiBoard } from './futoshiki-board';

export interface ActiveGame {
  gameId: string;
  board: FutoshikiBoard;
}
