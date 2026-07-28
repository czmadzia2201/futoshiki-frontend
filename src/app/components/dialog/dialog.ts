import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dialog',
  standalone: true,
  templateUrl: './dialog.html',
  styleUrl: './dialog.css'
})
export class Dialog {

  @Input() title = '';
  @Input() paragraphs: string[] = [];

  @Input() confirmLabel = 'OK';
  @Input() cancelLabel = 'Cancel';

  @Input() showCancelButton = true;

  @Output() readonly confirmed = new EventEmitter<void>();
  @Output() readonly cancelled = new EventEmitter<void>();
}
