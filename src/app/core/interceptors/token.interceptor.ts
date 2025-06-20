import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  if(req.url.startsWith('https://ia-sp-backoffice.ucatolica.cue.ec/ia/')){
    return(next(req))
  }

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
