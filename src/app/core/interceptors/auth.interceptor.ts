import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((e) => {
      if (e.status === 401) {
        if (authService.isAuthenticated()) {
          authService.logout();
          localStorage.clear();
        }
        router.navigate(['/login']); // USER NOT AUTHENTICATED
        console.log('No Access this resource', 'warning');
      }
      if (e.status === 200) {
        console.log('The request was successful', 'success');
      }
      if (e.status === 423) {
        //authService.logout();
      }
      if (e.status === 500) {
        console.log('An error occurred', 'We are working on it', 'warning');
      }
      if (e.status === 403) {
        console.log('Hello, you do not have access to this resource!')
        router.navigate(['/welcom']);
      }
      return throwError(e);
    })
  );
};
