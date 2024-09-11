import { Routes } from '@angular/router';
import { LoginComponent } from './acount/login/login.component';
import { authRoleGuard } from './core/guards/auth-role.guard';
import { authGuard } from './core/guards/auth.guard';
import { NotAccessComponent } from './pages/not-access/not-access.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    loadComponent: () => import('./pages/layout/layout.component'),
    children: [
      { path: 'notAccess', component: NotAccessComponent },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component'),
        canActivate: [authRoleGuard, authGuard],
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authRoleGuard, authGuard],
      },
      {
        path: 'tables',
        loadComponent: () => import('./pages/tables/tables.component').then(m => m.TablesComponent),
        canActivate: [authRoleGuard, authGuard],
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  }
];
