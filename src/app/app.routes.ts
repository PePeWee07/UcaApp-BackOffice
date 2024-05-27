import { Routes } from '@angular/router';
import { log } from 'console';
import { LoginComponent } from './login/login.component';
import { WelcomComponent } from './welcom/welcom.component';
import { authRoleGuard } from './guards/auth-role.guard';
import { NotAccessComponent } from './not-access/not-access.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'welcom',
    component: WelcomComponent,
    canActivate: [authRoleGuard]
  },
  { path: 'notAccess', component: NotAccessComponent },
];
