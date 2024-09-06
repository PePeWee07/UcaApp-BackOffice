import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authRoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si no está autenticado, redirigir al login
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Comprobar si tiene permisos de administrador
  if (authService.hasRole('ROLE_ADMIN')) {
    return true;
  } else {
    console.log('No Access', 'Not Available to Users', 'error');
    router.navigate(['/notAccess']);
    return false;
  }
};
