import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-global-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-spinner.component.html',
  styleUrl: './global-spinner.component.css'
})
export class GlobalSpinnerComponent {
  @Input() fullscreen: boolean = false;
  @Input() hasBackgroundOverlay: boolean = true;
}
