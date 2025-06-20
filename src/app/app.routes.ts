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
        canActivate: [authGuard],
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        data: { label: 'Profile', roles:['ROLE_ADMIN', 'ROLE_USER', 'ROLE_SUPERVISOR'] },
        canActivate: [authRoleGuard, authGuard],
      },
      {
        path: 'user-tables',
        loadComponent: () => import('./pages/user-tables/user-tables.component').then(m => m.UserTablesComponent),
        data: { label: 'User List', roles:['ROLE_ADMIN', 'ROLE_SUPERVISOR'] },
        canActivate: [authRoleGuard, authGuard],
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./pages/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent),
        data: { label: 'Audit Logs', roles:['ROLE_ADMIN']},
        canActivate: [authRoleGuard, authGuard],
      },
      {
        path: 'roles-permissions',
        loadComponent: () => import('./pages/roles-permissions/roles-permissions.component').then(m => m.RolesPermissionsComponent),
        data: { label: 'Roles & Permissions', roles:['ROLE_ADMIN']},
        canActivate: [authRoleGuard, authGuard],
      },
      {
        path: 'chatHistory',
        loadComponent: () => import('./pages/chatHistorial/chat-history.component').then(m => m.ChatHistoryComponent),
        data: { label: 'Chat History', roles:['ROLE_ADMIN']},
        canActivate: [authRoleGuard, authGuard], 
      },
      {
        path: 'wa-user-tables',
        loadComponent: () => import('./pages/whatsapp-user-tables/wa-user-tables.component').then(m => m.WhatsAppUserTablesComponent),
        data: { label: 'Chat User List', roles:['ROLE_ADMIN']},
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
