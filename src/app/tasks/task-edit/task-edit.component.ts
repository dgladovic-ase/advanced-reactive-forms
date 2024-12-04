import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationMessageComponent } from '../../shared/validation-message/validation-message.component';
import { CanComponentDeactivate } from '../../guards/can-deactivate.guard';
import { ActivatedRoute, Router } from '@angular/router';
import { Task, TaskService } from '../../services/task.service';
import { LOGGER_SERVICES } from '../../services/logger.tokens';
import { LoggerService } from '../../services/logger.service';
import { forbiddenTitleValidator } from '../../validators/forbidden-title.validator';
import { dateRangeValidator } from '../../validators/date-range.validator';

@Component({
  selector: 'app-task-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ValidationMessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-edit.component.html',
  styleUrl: './task-edit.component.css'
})
export class TaskEditComponent implements OnInit, CanComponentDeactivate {
  taskForm: FormGroup;
  hasUnsavedChanges = false;
  taskId!: number;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef,
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
    this.route.params.subscribe(params => {
      this.taskId = +params['id'];
      if (this.taskId) {
        this.loadTask(this.taskId);
      }
    });

    this.handleStartDateChanges();

    this.taskForm.valueChanges.subscribe(() => {
      this.hasUnsavedChanges = true;
    });
  }

  private loadTask(taskId: number): void {
    // Use the task service to get the task by ID
    this.taskService.getTaskById(taskId).subscribe({
      next: (task: Task) => {
        if (task) {
          // Patch the form with the task data
          this.taskForm.patchValue({
            title: task.title,
            description: task.description,
            startDate: task.startDate,
            dueDate: task.dueDate,
            teamAssignment: {
              teamMemberName: task.teamAssignment?.teamMemberName,
              role: task.teamAssignment?.role
            }
          });

          // Populate subtasks array
          this.subtasks.clear();
          task.subtasks?.forEach(subtask => {
            this.subtasks.push(this.fb.control(subtask.title, Validators.required));
          });

          this.log('Task loaded for editing.');
          this.cdr.markForCheck(); // Manually trigger change detection to update view with loaded task
        }
      },
      error: (err) => {
        console.error('Error loading task:', err);
        window.alert('An error occurred while loading the task. Please try again.');
      }
    });
  }

  private handleStartDateChanges(): void {
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

      const updatedTask = {
        id: this.taskId, 
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

      // Call the updateTask method to update the task with the given ID
      this.taskService.updateTask(this.taskId, updatedTask).subscribe({
        next: (updatedTask) => {
          console.log('Updated Task:', updatedTask);
          window.alert('Task updated successfully!');
          this.taskForm.reset();
          this.hasUnsavedChanges = false;
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          console.error('Error updating task:', err);
          window.alert('An error occurred while updating the task. Please try again.');
        }
      });
    } else {
      this.log('Form submission failed due to validation errors.');
    }
  }


  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: Event): void {
    if (this.hasUnsavedChanges) {
      event.preventDefault(); // Required for modern browsers
      (event as BeforeUnloadEvent); // This triggers the browser's confirmation dialog
    }
  }

  canDeactivate(): boolean {
    if (this.hasUnsavedChanges) {
      return confirm('You have unsaved changes. Do you really want to leave?');
    }
    return true;
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  private log(message: string): void {
    this.loggers.forEach(logger => logger.log(message));
  }
}
