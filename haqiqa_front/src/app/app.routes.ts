import { Routes } from '@angular/router';
import { LoginGuard } from './guards/login.guard';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./login/login').then(m => m.Login),
        canActivate: [LoginGuard]
    },
    {
        path: 'myvideos',
        loadComponent: () => import('./myvideos/myvideos').then(m => m.Myvideos),
        canActivate: [AuthGuard]
    },
    {
        path: 'register',
        loadComponent: () => import('./register/register').then(m => m.Register),
        canActivate: [LoginGuard]
    },
    {
        path: 'home',
        loadComponent: () => import('./home/home').then(m => m.Home),
        canActivate: [AuthGuard]
    },
    {
        path: 'video/:id',
        loadComponent: () => import('./video/video').then(m => m.Video),
        canActivate: [AuthGuard]
    },
    {
        path: 'settings',
        loadComponent: () => import('./settings/settings').then(m => m.Settings),
        canActivate: [AuthGuard]
    }
];
