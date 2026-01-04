import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';

@Directive({
  selector: 'textarea[appTextareaAutoresize]',
  standalone: true,
})
export class TextareaAutoresizeDirective implements OnInit {
  constructor(private elementRef: ElementRef<HTMLTextAreaElement>) {}

  ngOnInit(): void {
    this.adjust();
  }

  @HostListener('input')
  onInput(): void {
    this.adjust();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.adjust();
  }

  adjust(): void {
    const textarea = this.elementRef.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}
