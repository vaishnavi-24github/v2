import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Don't add token to auth endpoints
  const isAuthEndpoint = req.url.includes('/auth/');
  
  const token = authService.getToken();
  
  // Only add token if it exists, is a valid string, and not an auth endpoint
  if (token && typeof token === 'string' && token.trim().length > 0 && !isAuthEndpoint) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token.trim()}`
      }
    });
  } else if (!token && !isAuthEndpoint) {
    // Log warning if token is missing for non-auth endpoints
    console.warn('JWT Interceptor: No token available for request to', req.url);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't handle 401 for auth endpoints (login, etc.)
      if (error.status === 401 && !isAuthEndpoint) {
        // Only redirect if not already on login page to prevent loops
        const currentUrl = router.url;
        if (!currentUrl.includes('/login')) {
          authService.logout();
          router.navigate(['/login'], { 
            queryParams: { returnUrl: currentUrl } 
          });
        }
      } else if (error.status === 403) {
        router.navigate(['/deals']);
      }
      return throwError(() => error);
    })
  );
};
