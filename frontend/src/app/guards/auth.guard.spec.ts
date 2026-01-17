import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: typeof authGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'isAuthenticated', 'logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = authGuard;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    route = {} as ActivatedRouteSnapshot;
    state = { url: '/deals' } as RouterStateSnapshot;

    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should allow navigation if token exists and user has logged in this session', () => {
    authService.getToken.and.returnValue('valid-token');
    authService.isAuthenticated.and.returnValue(true);
    sessionStorage.setItem('hasLoggedInThisSession', 'true');

    const result = TestBed.runInInjectionContext(() => guard(route, state));

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login if token exists but user has not logged in this session', () => {
    authService.getToken.and.returnValue('valid-token');
    authService.isAuthenticated.and.returnValue(true);
    sessionStorage.removeItem('hasLoggedInThisSession');

    const result = TestBed.runInInjectionContext(() => guard(route, state));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('should redirect to login if token does not exist', () => {
    authService.getToken.and.returnValue(null);
    authService.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => guard(route, state));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], jasmine.objectContaining({
      queryParams: { returnUrl: '/deals' }
    }));
  });

  it('should redirect to login if token is empty string', () => {
    authService.getToken.and.returnValue('');
    authService.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => guard(route, state));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], jasmine.objectContaining({
      queryParams: { returnUrl: '/deals' }
    }));
  });

  it('should redirect to login if token is only whitespace', () => {
    authService.getToken.and.returnValue('   ');
    authService.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => guard(route, state));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], jasmine.objectContaining({
      queryParams: { returnUrl: '/deals' }
    }));
  });

  it('should call logout and redirect if token exists but isAuthenticated returns false', () => {
    authService.getToken.and.returnValue('invalid-token');
    authService.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => guard(route, state));

    expect(result).toBe(false);
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], jasmine.objectContaining({
      queryParams: { returnUrl: '/deals' }
    }));
  });

  it('should include returnUrl in query params when redirecting', () => {
    authService.getToken.and.returnValue(null);
    authService.isAuthenticated.and.returnValue(false);
    state.url = '/admin/users';

    const result = TestBed.runInInjectionContext(() => guard(route, state));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], jasmine.objectContaining({
      queryParams: { returnUrl: '/admin/users' }
    }));
  });

  it('should not call logout if token does not exist', () => {
    authService.getToken.and.returnValue(null);
    authService.isAuthenticated.and.returnValue(false);

    TestBed.runInInjectionContext(() => guard(route, state));

    expect(authService.logout).not.toHaveBeenCalled();
  });
});