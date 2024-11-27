import { Routes } from '@angular/router';
import { tasksRoutes } from './tasks/tasks-routing.module';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () =>
            import('./home/home.component').then((m) => m.HomeComponent),
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
    {
        path: 'tasks',
        children: tasksRoutes,
    },
    {
        path: '**',
        redirectTo: 'home',
    }
];
