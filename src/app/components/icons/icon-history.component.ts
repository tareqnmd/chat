import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'icon-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [class]="class" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
  `,
})
export class IconHistoryComponent {
  @Input() class = '';
}
