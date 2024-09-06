import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);

  if (typeof localStorage !== 'undefined') {

    let token = authService.tokencito;

    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(cloned);
    }
  }

  return next(req);
};
