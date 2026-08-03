export interface DialogConfig {
  title: string;
  paragraphs: string[];
  confirmLabel: string;
  cancelLabel?: string;
  showCancelButton: boolean;
  type: DialogType;
}

export enum DialogType {
  INFO,
  NEW_GAME,
  RESET_BOARD,
  SHOW_SOLUTION
}
