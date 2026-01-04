import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'icon-bot',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [class]="class" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      ></path>
    </svg>
  `,
})
export class IconBotComponent {
  @Input() class = '';
}
