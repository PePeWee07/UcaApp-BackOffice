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
        console.log('You are not authenticated', 'warning');
      }
      if (e.status === 500) {
        console.log('An error occurred', 'We are working on it', 'warning');
        alert('An error occurred, we are working on it');
      }
      if (e.status === 403) {
        alert('Hello, you do not have access to this resource!')
        router.navigate(['/welcom']);
      }
      return throwError(e);
    })
  );
};
