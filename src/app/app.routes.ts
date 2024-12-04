import { Routes } from '@angular/router';
import { tasksRoutes } from './tasks/tasks.routes';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () =>
            import('./home/home.component').then((m) => m.HomeComponent),
    },
    {
        path: 'login',
        loadComponent: () =>
            import('./login/login.component').then((m) => m.LoginComponent),
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
