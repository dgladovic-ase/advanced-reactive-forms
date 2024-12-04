import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forbiddenTitleValidator } from '../../validators/forbidden-title.validator';
import { dateRangeValidator } from '../../validators/date-range.validator';
import { ValidationMessageComponent } from '../../shared/validation-message/validation-message.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { LOGGER_SERVICES } from '../../services/logger.tokens';
import { LoggerService } from '../../services/logger.service';
import { CanComponentDeactivate } from '../../guards/can-deactivate.guard';

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ValidationMessageComponent],
  templateUrl: './task-create.component.html',
  styleUrl: './task-create.component.css'
})
export class TaskCreateComponent implements OnInit, CanComponentDeactivate {
  taskForm: FormGroup;
  hasUnsavedChanges = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private taskService: TaskService,
    @Inject(LOGGER_SERVICES) private loggers: LoggerService[]
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), forbiddenTitleValidator(['Test', 'Forbidden'])]],
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      dueDate: ['', Validators.required],
      subtasks: this.fb.array([]),
      teamAssignment: this.fb.group({
        teamMemberName: ['', Validators.required],
        role: ['', Validators.required]
      })
    }, { validators: dateRangeValidator('startDate', 'dueDate') });
  }

  ngOnInit(): void {
    this.log('TaskCreateComponent initialized.');
    this.taskForm.get('startDate')?.valueChanges.subscribe((startDateValue) => {
      const dueDateControl = this.taskForm.get('dueDate');

      if (startDateValue && this.isValidDate(startDateValue)) {
        const startDate = new Date(startDateValue);
        const today = new Date();

        if (startDate.getTime() > today.getTime()) {
          // Disable Due Date if Start Date is in the future
          dueDateControl?.disable({ emitEvent: false });
        } else {
          // Enable Due Date if Start Date is today or in the past
          dueDateControl?.enable({ emitEvent: false });
        }
      } else {
        dueDateControl?.disable({ emitEvent: false }); // Disable Due Date if Start Date is not valid
      }
    });

    this.taskForm.valueChanges.subscribe(() => {
      this.hasUnsavedChanges = true;
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: Event): void {
    if (this.hasUnsavedChanges) {
      event.preventDefault(); // Required for modern browsers
      (event as BeforeUnloadEvent); // This triggers the browser's confirmation dialog
    }
  }

  isValidDate(date: any): boolean {
    return !isNaN(Date.parse(date)); // Checks if the date is valid
  }

  get subtasks(): FormArray {
    return this.taskForm.get('subtasks') as FormArray;
  }

  addSubtask(): void {
    if (this.subtasks.length < 3) {
      this.subtasks.push(this.fb.control('', Validators.required));
      this.log('New subtask added to the form.');
    }
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const subtasks = this.subtasks.controls.map(control => {
        return { title: control.value };
      });

      const newTask = {
        id: Math.floor(Math.random() * 10000), // Generate a temporary unique ID
        title: this.taskForm.value.title,
        description: this.taskForm.value.description,
        startDate: this.taskForm.value.startDate,
        dueDate: this.taskForm.value.dueDate,
        status: 'Pending',
        subtasks: subtasks,
        teamAssignment: {
          teamMemberName: this.taskForm.value.teamAssignment.teamMemberName,
          role: this.taskForm.value.teamAssignment.role
        }
      };

      this.taskService.addTask(newTask).subscribe({
        next: () => {
          console.log('New Task:', newTask);
          window.alert('Task created successfully!');
          this.taskForm.reset();
          this.hasUnsavedChanges = false;
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          console.error('Error creating task:', err);
          window.alert('An error occurred while creating the task. Please try again.');
        }
      });
    } else {
      this.log('Form submission failed due to validation errors.');
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  canDeactivate(): boolean {
    if (this.hasUnsavedChanges) {
      return confirm('You have unsaved changes. Do you really want to leave?');
    }
    return true;
  }

  private log(message: string): void {
    this.loggers.forEach(logger => logger.log(message));
  }
}
