export interface DialogConfig {
  title: string;
  paragraphs: string[];
  confirmLabel: string;
  cancelLabel?: string;
  showCancelButton: boolean;
  type: DialogType;
}

export enum DialogType {
  ABOUT,
  NEW_GAME,
  UNDO_UNAVAILABLE,
  RESET_BOARD,
  SHOW_SOLUTION,
  GAME_WON
}
