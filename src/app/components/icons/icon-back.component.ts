import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'icon-back',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [class]="class" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      ></path>
    </svg>
  `,
})
export class IconBackComponent {
  @Input() class = '';
}
