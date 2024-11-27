import { Component, OnInit } from '@angular/core';
import { Task, TaskService } from '../../services/task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { switchMap } from 'rxjs/operators';
import { GlobalSpinnerComponent } from "../../shared/global-spinner/global-spinner.component";

@Component({
  selector: 'app-task-overview',
  standalone: true,
  imports: [CommonModule, GlobalSpinnerComponent],
  templateUrl: './task-overview.component.html',
  styleUrl: './task-overview.component.css'
})
export class TaskOverviewComponent implements OnInit {
  task: Task | undefined;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const taskId = Number(params.get('id'));
          return this.taskService.getTaskById(taskId);
        })
      )
      .subscribe({
        next: (task) => {
          this.loading = false; 
          this.task = task;
          if (this.task) {
            // Set the page title dynamically
            this.titleService.setTitle(`Task Overview: ${this.task.title}`);

            // Set meta tags dynamically
            this.metaService.updateTag({ name: 'description', content: `Viewing details for task: ${this.task.title}.` });
            this.metaService.updateTag({ name: 'keywords', content: 'task management, overview, Angular, tasks' });
          } else {
            // Handle case where task is not found
            this.router.navigate(['/tasks']);
          }
        },
        error: (err) => {
          this.loading = false; 
          console.error('Error fetching task:', err);
          this.router.navigate(['/tasks']); // Navigate back to the task list on error
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }
}