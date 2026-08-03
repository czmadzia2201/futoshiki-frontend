import { DialogConfig, DialogType } from '../../models/dialog-config';

export const SHOW_SOLUTION_DIALOG = confirmationDialog(
  DialogType.SHOW_SOLUTION,
  'Show solution?',
  [ 'Revealing the solution will end the current game. Are you sure you want to continue?' ],
  'Show solution'
);

export const RESET_BOARD_DIALOG = confirmationDialog(
  DialogType.RESET_BOARD,
  'Reset board?',
  [ 'Your current game progress will be lost. Are you sure you want to continue?' ],
  'Reset board'
);

export const NEW_GAME_DIALOG = confirmationDialog(
  DialogType.NEW_GAME,
  'Start new game?',
  [ 'You have a game in progress. Are you sure you want to start a new one?' ],
  'Start new game'
);

export const UNDO_UNAVAILABLE_DIALOG = infoDialog(
  'Undo unavailable',
  [ 'Undo is unavailable in Pencil Mode.' ]
);

export const GAME_WON_DIALOG = infoDialog(
  'Congratulations!',
  [ 'You solved the puzzle correctly.' ]
);

export const ABOUT_DIALOG = infoDialog(
  'About the Game',
  [ 'Futoshiki is a logic puzzle played on a square grid. Fill each cell with the numbers from 1 to the board size so that every number appears exactly once in each row and column. This arrangement is called a Latin square.',
    'Some numbers are given at the start. Some neighboring cells are connected by inequality signs (< or >), which must be satisfied. These clues help you solve the puzzle.',
    'Choose a board size and difficulty before starting a new game. Select a number from the top panel, then click a cell to place the number on the board.',
    'You can also use additional options displayed below the grid: undo your moves, clear the board or use pencil mode to enter multiple candidate numbers in a cell.',
    'The solution is checked automatically once the grid is complete.' ]
);

export const OPENAI_LOADING_ERROR_DIALOG = infoDialog(
  'Unable to load puzzle',
  ['The puzzle could not be loaded from OpenAI. Please try again.']
);

export const FC_API_LOADING_ERROR_DIALOG = infoDialog(
  'Unable to load puzzle',
  ['The puzzle could not be loaded from Futoshiki.com. Please try again.']
);

export const FILE_LOADING_ERROR_DIALOG = infoDialog(
  'Unable to load puzzle',
  ['The puzzle could not be loaded from file. Please try again.']
);

export const UNKNOWN_ERROR_DIALOG = infoDialog(
  'Something went wrong',
  ['Please try again.']
);

function infoDialog(title: string, paragraphs: string[]): DialogConfig {
  return {
    type: DialogType.INFO,
    title,
    paragraphs,
    confirmLabel: 'OK',
    showCancelButton: false
  };
}

function confirmationDialog(type: DialogType, title: string, paragraphs: string[], confirmLabel: string): DialogConfig {
  return {
    type,
    title,
    paragraphs,
    confirmLabel,
    cancelLabel: 'Cancel',
    showCancelButton: true
  };
}
