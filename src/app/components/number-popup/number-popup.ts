import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-number-popup',
  imports: [],
  templateUrl: './number-popup.html',
  styleUrl: './number-popup.css',
})
export class NumberPopup {

  @Input({ required: true })
  allNumbers!: readonly number[];

  @Input({ required: true })
  boardSize!: number;

  @Output()
  readonly numberSelected = new EventEmitter<number>();

  isNumberAvailable(value: number): boolean {
    return value <= this.boardSize;
  }

}
