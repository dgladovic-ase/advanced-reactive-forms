import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Task, TaskService } from '../../services/task.service';
import { LoggerService } from '../../services/logger.service';
import { BehaviorSubject, forkJoin, map, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HighlightOverdueDirective } from '../../directives/highlight-overdue.directive';
import { TaskStatusPipe } from '../../pipes/task-status.pipe';
import { DaysUntilDuePipe } from '../../pipes/days-until-due.pipe';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    HighlightOverdueDirective,
    TaskStatusPipe,
    DaysUntilDuePipe
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks$!: Observable<Task[]>; // Observable for tasks list to bind using async pipe
  private filterSubject = new BehaviorSubject<string>(''); // Subject to manage the filter keyword

  totalTasks = 0;
  pageSize = 5;
  currentPage = 1;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private taskService: TaskService,
    private logger: LoggerService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.setupFilteredTasks();
    this.watchQueryParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Step 1: Set up the Observable for Tasks with Filtering
  private setupFilteredTasks(): void {
    this.tasks$ = this.filterSubject.pipe(
      switchMap((keyword) =>
        forkJoin({
          tasksResponse: this.taskService.getTasks(this.currentPage, this.pageSize),
          assignments: this.taskService.getUserAssignments(),
        }).pipe(
          map(({ tasksResponse, assignments }) => {
            let tasks = tasksResponse.tasks.map((task) => {
              const assignment = assignments.find((a) => a.taskId === task.id);
              task.teamAssignment = assignment?.teamAssignment;
              return task;
            });

            // Apply filter if keyword is provided
            if (keyword) {
              tasks = tasks.filter((task) =>
                task.title.toLowerCase().includes(keyword.toLowerCase())
              );
              this.logger.log(`Tasks filtered with keyword: ${keyword}`);
            }

            this.totalTasks = tasksResponse.totalCount;
            return tasks;
          })
        )
      )
    );
  }

  // Step 2: Set Up Query Parameter Watch for Filtering
  private watchQueryParams(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const keyword = params['keyword'] ? params['keyword'].toLowerCase() : '';
      this.filterTasks(keyword);
    });
  }

  // Update filter value to trigger the Observable pipeline
  filterTasks(keyword: string): void {
    this.filterSubject.next(keyword);
  }

  onPageChange(event: PageEvent | number): void {
    if (typeof event === 'number') {
      this.currentPage = event;
    } else {
      this.currentPage = event.pageIndex + 1;
      this.pageSize = event.pageSize;
    }

    this.filterTasks(this.filterSubject.getValue()); // Reload tasks with the current keyword and new pagination
  }

  navigateToTaskOverview(taskId: number): void {
    this.router.navigate(['/tasks/overview', taskId]);
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
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.filterTasks(this.filterSubject.getValue()); // Reload after deletion
          this.logger.log('Task deleted successfully.');
        },
        error: (err) => {
          this.logger.log(`Error deleting task: ${err.message}`);
        },
      });
    }
  }

  toggleTaskStatus(task: Task): void {
    const updatedTask = { ...task, status: task.status === 'Pending' ? 'Completed' : 'Pending' };
    this.taskService.updateTask(updatedTask.id!, updatedTask).pipe(takeUntil(this.destroy$)).subscribe({
      next: (task) => {
        this.logger.log(`Task with ID: ${task.id} updated.`);
        this.filterTasks(this.filterSubject.getValue()); // Refresh the list
      },
      error: (err) => {
        this.logger.log(`Error updating task: ${err.message}`);
      },
    });
  }
}
