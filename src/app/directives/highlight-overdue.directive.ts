import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlightOverdue]',
  standalone: true
})
export class HighlightOverdueDirective implements OnInit {
  @Input('appHighlightOverdue') dueDate!: string;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit(): void {
    const now = new Date();
    const dueDate = new Date(this.dueDate);

    if (dueDate < now) {
      this.renderer.setStyle(this.el.nativeElement, 'border', '2px solid red');
      this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', '#ffe6e6');
    }
  }
}
