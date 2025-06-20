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
  // verificar si el usuario tiene un rol especificado
  function includesRole(roles: string[], userRoles: string): boolean {
    return roles.some(role => userRoles.includes(role));
  }

  // Comprobar si tiene roles necessarios
  let userRoles = authService.dataPayload.authorities
  if (includesRole(route.data['roles'], userRoles)) {
    return true;
  } else {
    console.log('No Access', 'Not Available to ', userRoles, 'error');
    router.navigate(['/notAccess']);
    return false;
  }
}