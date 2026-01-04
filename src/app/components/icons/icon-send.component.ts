import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'icon-send',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [class]="class" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5 12h14M12 5l7 7-7 7"
        *ngIf="false"
      ></path>
      <!-- Example placeholder, actual path needed might be different based on 'Arrow Up' usually used for send -->
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5 10l7-7m0 0l7 7m-7-7v18"
      ></path>
    </svg>
  `,
})
export class IconSendComponent {
  @Input() class = '';
}
