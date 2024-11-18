import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export class TaskFormComponent {
  taskForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // Initialize form with basic fields, we will expand on this later
    this.taskForm = this.fb.group({
      title: ['',[Validators.required, Validators.minLength(3)]], // Form control for task title
      description: ['',[Validators.required]], // Form control for task description
    });
  }

  // Basic submit method to log form values, we will add more advanced handling later
  onSubmit(): void {
    console.log('Form Submitted:', this.taskForm.value);
  }
}