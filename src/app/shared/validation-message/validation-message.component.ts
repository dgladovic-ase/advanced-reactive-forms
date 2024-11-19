import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validation-message.component.html',
  styleUrls: ['./validation-message.component.css']
})
export class ValidationMessageComponent {
  @Input() control: AbstractControl | null = null;
  @Input() label: string = '';

  get errorMessage(): string {
    if (this.control?.errors) {
      if (this.control.hasError('required')) {
        return `${this.label} is required.`;
      } else if (this.control.hasError('minlength')) {
        const requiredLength = this.control.getError('minlength').requiredLength;
        return `${this.label} must be at least ${requiredLength} characters long.`;
      } else if (this.control.hasError('forbiddenTitle')) {
        return `${this.label} contains forbidden words.`;
      } else if (this.control.hasError('dateRangeInvalid')) {
        return `Due Date must be after Start Date.`;
      }
    }
    return '';
  }
}
