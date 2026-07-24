import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dialog',
  standalone: true,
  templateUrl: './dialog.html',
  styleUrl: './dialog.css'
})
export class DialogComponent {

  @Input() title = '';
  @Input() paragraphs: string[] = [];

  @Input() confirmLabel = 'OK';
  @Input() cancelLabel = 'Cancel';

  @Input() showCancelButton = true;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
