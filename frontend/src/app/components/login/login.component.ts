import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // DON'T auto-redirect from login page if token exists
    // This ensures login page is always shown first on fresh app load
    // 
    // Only exception: If user came from a protected route (has returnUrl)
    // AND has a token, then redirect back (this handles refresh scenarios)
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    const token = this.authService.getToken();
    
    // Only redirect if user has token AND came from a protected route (returnUrl exists)
    // This means: User was on /deals, lost session, got redirected to /login?returnUrl=/deals
    // In this case, if they somehow have a token again, redirect back
    if (token && token.trim().length > 0 && this.authService.isAuthenticated() && returnUrl) {
      this.router.navigate([returnUrl]);
      return;
    }
    
    // Otherwise, always show login page first
    // Even if token exists, show login page on fresh app load
    // User must click login button to proceed (this verifies token is still valid)
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';

      // Get form values and trim whitespace
      const credentials = {
        username: this.loginForm.value.username?.trim() || '',
        password: this.loginForm.value.password || ''
      };

      // Log for debugging (remove password in production)
      console.log('Attempting login with username:', credentials.username);

      this.authService.login(credentials).subscribe({
        next: (response) => {
          // Verify token was stored successfully
          const token = this.authService.getToken();
          if (!token || !this.authService.isAuthenticated()) {
            this.loading = false;
            this.error = 'Authentication failed. Token not received.';
            return;
          }
          
          // Set session flag to indicate user has logged in this session
          // This allows AuthGuard to permit access to /deals after login
          sessionStorage.setItem('hasLoggedInThisSession', 'true');
          
          // Login successful - redirect to deals or returnUrl
          this.loading = false;
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/deals';
          this.router.navigate([returnUrl]);
        },
        error: (err) => {
          this.loading = false;
          console.error('Login error:', err);
          console.error('Error details:', {
            status: err.status,
            statusText: err.statusText,
            error: err.error,
            message: err.message
          });
          
          // Check for CORS or network errors first
          let errorMessage = '';
          
          // Status 0 typically means CORS error or network failure
          if (err.status === 0 || err.status === null) {
            if (err.message && err.message.includes('CORS')) {
              errorMessage = 'CORS Error: Backend not configured. Please check backend CORS settings.';
            } else if (err.message && err.message.includes('Failed to fetch')) {
              errorMessage = 'Network Error: Cannot reach backend server. Is it running on port 8081?';
            } else {
              errorMessage = 'Connection Error: Cannot connect to backend. Check if backend is running and CORS is configured.';
            }
          }
          // Status 401 = Unauthorized (wrong credentials)
          else if (err.status === 401) {
            errorMessage = 'Login failed. Please check your username and password.';
          }
          // Status 403 = Forbidden
          else if (err.status === 403) {
            errorMessage = 'Access forbidden. Your account may not have permission.';
          }
          // Status 400 = Bad Request (validation error)
          else if (err.status === 400) {
            errorMessage = 'Invalid request. Please check your input.';
          }
          // Status 500 = Server Error
          else if (err.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
          // Other status codes
          else if (err.status) {
            errorMessage = `Error ${err.status}: ${err.statusText || 'Request failed'}`;
          }
          // Try to extract message from error response
          else if (err.error) {
            if (typeof err.error === 'string') {
              errorMessage = err.error;
            } else if (err.error.message) {
              errorMessage = err.error.message;
            } else if (err.error.error) {
              errorMessage = err.error.error;
            }
          }
          // Fallback to error message
          else if (err.message) {
            if (err.message.includes('CORS') || err.message.includes('cors')) {
              errorMessage = 'CORS Error: Backend CORS configuration is missing or incorrect.';
            } else {
              errorMessage = err.message;
            }
          }
          // Final fallback
          if (!errorMessage) {
            errorMessage = 'Login failed. Please check your credentials and ensure backend is running.';
          }
          
          this.error = errorMessage;
        }
      });
    }
  }
}
