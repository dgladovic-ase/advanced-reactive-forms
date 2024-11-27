import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Task, TaskService } from '../../services/task.service';
import { LoggerService } from '../../services/logger.service';
import { GlobalSpinnerComponent } from '../../shared/global-spinner/global-spinner.component';
import { forkJoin, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, GlobalSpinnerComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  loading = true;
  private taskUpdateSubject = new Subject<Task>();

  constructor(
    private router: Router,
    private taskService: TaskService,
    private logger: LoggerService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void { // Using forkJoin to get tasks and user assignments simultaneously
    forkJoin({
      tasks: this.taskService.getTasks(),
      assignments: this.taskService.getUserAssignments()
    })
      .subscribe({
        next: ({ tasks, assignments }) => {
          // Enrich tasks with user assignments for display purposes only
          this.tasks = tasks.map(task => {
            const assignment = assignments.find(a => a.taskId === task.id);
            task.teamAssignment = assignment?.teamAssignment; // Set the teamAssignment directly if it exists
            return task;
          });
          this.loading = false;
          this.logger.log('Tasks and assignments loaded successfully.');
        },
        error: (err) => {
          this.loading = false;
          this.logger.log(`Error loading tasks and assignments: ${err.message}`);
        }
      });

    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
        this.logger.log('Tasks loaded successfully.');
      },
      error: (err) => {
        this.loading = false;
        this.logger.log(`Error loading tasks: ${err.message}`);
      }
    });

    this.taskUpdateSubject.pipe(
      switchMap((updatedTask) => {
        this.loading = true;
        return this.taskService.updateTask(updatedTask.id, updatedTask);
      })
    ).subscribe({
      next: (updatedTask) => {
        if (updatedTask) {
          const index = this.tasks.findIndex(task => task.id === updatedTask.id);
          if (index !== -1) {
            this.tasks[index] = updatedTask; // Update the local task list
          }
          this.logger.log('Task updated successfully.');
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.logger.log(`Error updating task: ${err.message}`);
      }
    });

    this.route.queryParams.subscribe(params => {
      const keyword = params['keyword'] ? params['keyword'].toLowerCase() : '';
      this.filterTasks(keyword);
    });
  }

  filterTasks(keyword: string): void {
    if (keyword) {
      this.tasks = this.tasks.filter(task => task.title.toLowerCase().includes(keyword));
      this.logger.log(`Tasks filtered with keyword: ${keyword}`);
    } else {
      // If no keyword, reload the original list of tasks
      this.taskService.getTasks().subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.logger.log('Tasks reloaded successfully.');
        },
        error: (err) => {
          this.logger.log(`Error loading tasks: ${err.message}`);
        }
      });
    }
  }

  navigateToEditTask(taskId: number): void {
    this.logger.log(`Navigating to edit task with ID: ${taskId}`);
    this.router.navigate(['/tasks/edit', taskId]);
  }

  navigateToCreateTask(): void {
    this.logger.log('Navigating to create a new task.');
    this.router.navigate(['/tasks/create']);
  }

  deleteTask(taskId: number, event: Event): void {
    // Stop the click event from propagating to the <li> element
    event.stopPropagation();

    // Show confirmation dialog before deleting the task
    if (window.confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: (updatedTasks) => {
          this.tasks = updatedTasks;
          this.logger.log(`Task with ID: ${taskId} has been deleted.`);
        },
        error: (err) => {
          this.logger.log(`Error deleting task: ${err.message}`);
        }
      });
    }
  }

  toggleTaskStatus(task: Task): void {
    const updatedTask = { ...task, status: task.status === 'Pending' ? 'Completed' : 'Pending' };
    this.taskUpdateSubject.next(updatedTask);
    this.logger.log(`Toggling status for task with ID: ${task.id}`);
  }
}
