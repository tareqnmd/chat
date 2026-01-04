import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'icon-close',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [class]="class" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M6 18L18 6M6 6l12 12"
      ></path>
    </svg>
  `,
})
export class IconCloseComponent {
  @Input() class = '';
}
