import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Task, TaskService } from '../../services/task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-task-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-overview.component.html',
  styleUrl: './task-overview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskOverviewComponent implements OnInit {
  task$!: Observable<Task>;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit(): void {
    this.task$ = this.route.paramMap.pipe(
      switchMap(params => {
        const taskId = Number(params.get('id'));
        return this.taskService.getTaskById(taskId);
      })
    );

    this.task$.subscribe({
      next: (task) => {
        if (task) {
          this.titleService.setTitle(`Task Overview: ${task.title}`);
          this.metaService.updateTag({ name: 'description', content: `Viewing details for task: ${task.title}.` });
          this.metaService.updateTag({ name: 'keywords', content: 'task management, overview, Angular, tasks' });
        } else {
          this.router.navigate(['/tasks']);
        }
      },
      error: (err) => {
        console.error('Error fetching task:', err);
        this.router.navigate(['/tasks']); // Navigate back to the task list on error
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }
}