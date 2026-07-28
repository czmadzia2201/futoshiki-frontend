import { DialogConfig, DialogType } from '../../models/dialog-config';

export const SHOW_SOLUTION_DIALOG: DialogConfig = {
  type: DialogType.SHOW_SOLUTION,
  title: 'Show solution?',
  paragraphs: ['Revealing the solution will end the current game. Are you sure you want to continue?'],
  confirmLabel: 'Show solution',
  cancelLabel: 'Cancel',
  showCancelButton: true
};

export const RESET_BOARD_DIALOG: DialogConfig = {
  type: DialogType.RESET_BOARD,
  title: 'Reset board?',
  paragraphs: ['Your current game progress will be lost. Are you sure you want to continue?'],
  confirmLabel: 'Reset board',
  cancelLabel: 'Cancel',
  showCancelButton: true
};

export const NEW_GAME_DIALOG: DialogConfig = {
  type: DialogType.NEW_GAME,
  title: 'Start new game?',
  paragraphs: ['You have a game in progress. Are you sure you want to start a new one?'],
  confirmLabel: 'Start new game',
  cancelLabel: 'Cancel',
  showCancelButton: true
};

export const UNDO_UNAVAILABLE_DIALOG: DialogConfig = {
  type: DialogType.UNDO_UNAVAILABLE,
  title: 'Undo unavailable',
  paragraphs: ['Undo is unavailable in Pencil Mode.'],
  confirmLabel: 'OK',
  showCancelButton: false
};

export const GAME_WON_DIALOG: DialogConfig = {
  type: DialogType.GAME_WON,
  title: 'Congratulations!',
  paragraphs: ['You solved the puzzle correctly.'],
  confirmLabel: 'OK',
  showCancelButton: false
};

export const ABOUT: DialogConfig = {
  type: DialogType.ABOUT,
  title: 'About the Game',
  paragraphs: [
    'Futoshiki is a logic puzzle played on a square grid. Fill each cell with the numbers from 1 to the board size so that every number appears exactly once in each row and column. This arrangement is called a Latin square.',
    'Some numbers are given at the start. Some neighboring cells are connected by inequality signs (< or >), which must be satisfied. These clues help you solve the puzzle.',
    'Choose a board size and difficulty before starting a new game. Select a number from the top panel, then click a cell to place the number on the board.',
    'You can also use additional options displayed below the grid: undo your moves, clear the board or use pencil mode to enter multiple candidate numbers in a cell.',
    'The solution is checked automatically once the grid is complete.'
  ],
  confirmLabel: 'OK',
  showCancelButton: false
};
