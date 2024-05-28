import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario está autenticado y el token no ha expirado, permite el acceso a la ruta devolviendo
  if (authService.isAuthenticated()) {
    if (isTokenExpirado(authService)) {
      authService.logout();
      router.navigate(['/login']);
      alert("Session expired, please login again.");
      return false;
    }
    return true;
  }
  router.navigate(['/login']);
  return false;
};

const isTokenExpirado = (authService: AuthService): boolean => {
  const token = authService.tokencito;
  if (!token) return true;

  const payload = authService.obtenerDatosToken(token);
  const now = new Date().getTime() / 1000;
  return payload.exp < now;
};
