import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { CanDeactivateGuard } from '../guards/can-deactivate.guard';

export const tasksRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./task-list/task-list.component').then((m) => m.TaskListComponent),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./task-create/task-create.component').then((m) => m.TaskCreateComponent),
        canDeactivate: [CanDeactivateGuard]
      },
      {
        path: 'overview/:id',
        loadComponent: () =>
          import('./task-overview/task-overview.component').then((m) => m.TaskOverviewComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('./task-edit/task-edit.component').then((m) => m.TaskEditComponent)
      },
    ]
  }
];
