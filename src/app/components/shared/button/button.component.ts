import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconSpinnerComponent } from '../../icons';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, IconSpinnerComponent],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="getClasses()"
      (click)="handleClick($event)"
    >
      @if (loading) {
        <icon-spinner class="animate-spin -ml-1 mr-2 h-4 w-4"></icon-spinner>
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth = false;
  @Input() className = '';

  @Output() onClick = new EventEmitter<Event>();

  handleClick(event: Event) {
    if (!this.disabled && !this.loading) {
      this.onClick.emit(event);
    }
  }

  getClasses(): string {
    const baseClasses =
      'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
      icon: 'p-2', // For icon-only buttons
    };

    const variantClasses = {
      primary:
        'border border-transparent text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 focus:ring-slate-500',
      secondary:
        'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-500',
      danger: 'border border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
      ghost:
        'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-500',
      icon: 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full',
    };

    // Specific rounded classes based on variant/size
    const roundedClass =
      this.size === 'icon' || this.variant === 'icon' ? 'rounded-full' : 'rounded-lg';

    return `${baseClasses} ${sizeClasses[this.size]} ${variantClasses[this.variant]} ${roundedClass} ${
      this.fullWidth ? 'w-full' : ''
    } ${this.className}`;
  }
}
