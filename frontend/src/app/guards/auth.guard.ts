import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard - Protects routes that require authentication
 * 
 * Checks if JWT token exists in localStorage:
 * - If token exists → allow navigation (unless fresh app load, then redirect to /login first)
 * - If token does NOT exist → redirect to /login
 * 
 * On fresh app load (no session flag), always redirect to /login first to ensure login page shows
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if this is a fresh app load (user hasn't logged in this session yet)
  // This ensures login page always shows first on fresh app load, even if token exists
  const hasLoggedInThisSession = sessionStorage.getItem('hasLoggedInThisSession') === 'true';
  
  // Check if JWT token exists in localStorage
  const token = authService.getToken();
  
  // If token exists AND user has logged in this session, allow navigation
  // This handles refresh scenarios - user stays on /deals if token exists
  if (token && token.trim().length > 0 && authService.isAuthenticated() && hasLoggedInThisSession) {
    return true;
  }

  // If token exists but no session flag (fresh app load), redirect to /login first
  // This ensures login page always shows first on fresh app load
  if (token && token.trim().length > 0 && !hasLoggedInThisSession) {
    // Fresh app load with token - redirect to /login first
    // User must go through login page, even if token exists
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  // Token does NOT exist or is invalid - redirect to login
  // Clear any invalid/stale token first
  if (token) {
    authService.logout();
  }
  
  // Redirect to login with return URL so user can return after login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
