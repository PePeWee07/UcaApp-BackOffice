import { Routes } from '@angular/router';
import { LoginComponent } from './acount/login/login.component';
import { WelcomComponent } from './pages/welcom/welcom.component';
import { authRoleGuard } from './core/guards/auth-role.guard';
import { authGuard } from './core/guards/auth.guard';
import { NotAccessComponent } from './pages/not-access/not-access.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'welcom',
    component: WelcomComponent,
    canActivate: [authRoleGuard, authGuard]
  },
  { path: 'notAccess', component: NotAccessComponent },
];
