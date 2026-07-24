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
  GAME_WON,
  ABOUT
}
