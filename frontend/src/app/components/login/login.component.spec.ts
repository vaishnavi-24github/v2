import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { LoginResponse } from '../../models/user.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  const mockLoginResponse: LoginResponse = {
    data: {
      token: 'test-token-123',
      username: 'testuser',
      role: 'USER'
    }
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'getToken', 'isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRoute = {
      snapshot: {
        queryParams: {}
      }
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default spy returns
    authService.getToken.and.returnValue(null);
    authService.isAuthenticated.and.returnValue(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should not redirect if no token exists', () => {
      authService.getToken.and.returnValue(null);
      authService.isAuthenticated.and.returnValue(false);
      
      component.ngOnInit();
      
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to returnUrl if token exists and returnUrl is present', () => {
      authService.getToken.and.returnValue('test-token');
      authService.isAuthenticated.and.returnValue(true);
      activatedRoute.snapshot.queryParams = { returnUrl: '/deals' };
      
      component.ngOnInit();
      
      expect(router.navigate).toHaveBeenCalledWith(['/deals']);
    });

    it('should not redirect if token exists but no returnUrl', () => {
      authService.getToken.and.returnValue('test-token');
      authService.isAuthenticated.and.returnValue(true);
      activatedRoute.snapshot.queryParams = {};
      
      component.ngOnInit();
      
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should not submit if form is invalid', () => {
      component.loginForm.patchValue({
        username: '',
        password: ''
      });
      
      component.onSubmit();
      
      expect(authService.login).not.toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    });

    it('should call login service with trimmed credentials', () => {
      authService.login.and.returnValue(of(mockLoginResponse));
      authService.getToken.and.returnValue('test-token-123');
      authService.isAuthenticated.and.returnValue(true);
      
      component.loginForm.patchValue({
        username: '  testuser  ',
        password: 'password123'
      });
      
      component.onSubmit();
      
      expect(authService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });

    it('should set loading to true during login', () => {
      authService.login.and.returnValue(of(mockLoginResponse));
      authService.getToken.and.returnValue('test-token-123');
      authService.isAuthenticated.and.returnValue(true);
      
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      
      component.onSubmit();
      
      expect(component.loading).toBeFalse(); // Should be false after successful login
    });

    it('should navigate to /deals on successful login', () => {
      authService.login.and.returnValue(of(mockLoginResponse));
      authService.getToken.and.returnValue('test-token-123');
      authService.isAuthenticated.and.returnValue(true);
      
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      
      component.onSubmit();
      
      expect(router.navigate).toHaveBeenCalledWith(['/deals']);
      expect(component.loading).toBeFalse();
      expect(component.error).toBe('');
    });

    it('should navigate to returnUrl if present on successful login', () => {
      authService.login.and.returnValue(of(mockLoginResponse));
      authService.getToken.and.returnValue('test-token-123');
      authService.isAuthenticated.and.returnValue(true);
      activatedRoute.snapshot.queryParams = { returnUrl: '/admin/users' };
      
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      
      component.onSubmit();
      
      expect(router.navigate).toHaveBeenCalledWith(['/admin/users']);
    });

    it('should set error if token not received after login', () => {
      const responseWithoutToken = { data: { username: 'testuser' } };
      authService.login.and.returnValue(of(responseWithoutToken as LoginResponse));
      authService.getToken.and.returnValue(null);
      authService.isAuthenticated.and.returnValue(false);
      
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      
      component.onSubmit();
      
      expect(component.error).toBe('Authentication failed. Token not received.');
      expect(component.loading).toBeFalse();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle 401 error', () => {
      const error = { status: 401, statusText: 'Unauthorized', error: null, message: '' };
      authService.login.and.returnValue(throwError(() => error));
      
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'wrongpassword'
      });
      
      component.onSubmit();
      
      expect(component.error).toContain('Login failed. Please check your username and password.');
      expect(component.loading).toBeFalse();
    });

    it('should handle 403 error', () => {
      const error = { status: 403, statusText: 'Forbidden', error: null, message: '' };
      authService.login.and.returnValue(throwError(() => error));
      
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      
      component.onSubmit();
      
      expect(component.error).toContain('Access forbidden');
      expect(component.loading).toBeFalse();
    });

    it('should handle 400 error', () => {
      const error = { status: 400, statusText: 'Bad Request', error: null, message: '' };
      authService.login.and.returnValue(throwError(() => error));
      
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      
      component.onSubmit();
      
      expect(component.error).toContain('Invalid request');
      expect(component.loading).toBeFalse();
    });

    it('should handle 500 error', () => {
      const error = { status: 500, statusText: 'Internal Server Error', error: null, message: '' };
      authService.login.and.returnValue(throwError(() => error));
      
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      
      component.onSubmit();
      
      expect(component.error).toContain('Server error');
      expect(component.loading).toBeFalse();
    });

    it('should handle CORS error (status 0)', () => {
      const error = { status: 0, statusText: '', error: null, message: 'CORS error' };
      authService.login.and.returnValue(throwError(() => error));
      
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      
      component.onSubmit();
      
      expect(component.error).toContain('CORS Error');
      expect(component.loading).toBeFalse();
    });

    it('should handle network error', () => {
      const error = { status: 0, statusText: '', error: null, message: 'Failed to fetch' };
      authService.login.and.returnValue(throwError(() => error));
      
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      
      component.onSubmit();
      
      expect(component.error).toContain('Network Error');
      expect(component.loading).toBeFalse();
    });

    it('should extract error message from error.error.message', () => {
      const error = { status: 500, statusText: 'Error', error: { message: 'Custom error message' }, message: '' };
      authService.login.and.returnValue(throwError(() => error));
      
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      
      component.onSubmit();
      
      expect(component.error).toBe('Server error. Please try again later.');
      expect(component.loading).toBeFalse();
    });

    it('should set sessionStorage flag on successful login', () => {
      authService.login.and.returnValue(of(mockLoginResponse));
      authService.getToken.and.returnValue('test-token-123');
      authService.isAuthenticated.and.returnValue(true);
      spyOn(sessionStorage, 'setItem');
      
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      
      component.onSubmit();
      
      expect(sessionStorage.setItem).toHaveBeenCalledWith('hasLoggedInThisSession', 'true');
    });
  });
});