export interface DialogConfig {
  title: string;
  paragraphs: string[];
  confirmLabel: string;
  cancelLabel?: string;
  showCancelButton: boolean;
  type: DialogType;
}

export enum DialogType {
  SHOW_SOLUTION,
  RESET_BOARD,
  NEW_GAME,
  GAME_WON,
  ABOUT
}
