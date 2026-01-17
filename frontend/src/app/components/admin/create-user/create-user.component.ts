import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { NavigationComponent } from '../../shared/navigation/navigation.component';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NavigationComponent
  ],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent implements OnInit {
  userForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER', [Validators.required]]
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;
      const formValue = this.userForm.getRawValue();
      
      const createPayload = {
        username: formValue.username.trim(),
        email: formValue.email.trim(),
        password: formValue.password,
        role: formValue.role
      };

      this.userService.createUser(createPayload).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/users']);
        },
        error: (err) => {
          this.loading = false;
          const errorMessage = this.extractErrorMessage(err);
          this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 7000 });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/users']);
  }

  private extractErrorMessage(err: any): string {
    if (!err) return 'An unexpected error occurred';
    if (err.error) {
      if (typeof err.error === 'string') return err.error;
      if (typeof err.error === 'object') {
        if (err.error.errors && Array.isArray(err.error.errors)) {
          return err.error.errors.map((e: any) => e.defaultMessage || e.message).join(', ');
        }
        if (err.error.message) return err.error.message;
        if (err.error.error) return err.error.error;
      }
    }
    if (err.status === 400) return 'Bad Request: Invalid data provided.';
    if (err.status === 401) return 'Unauthorized. Please log in again.';
    if (err.status === 403) return 'Forbidden. You do not have permission.';
    if (err.status === 500) return err.error?.message || 'Server Error: An unexpected error occurred.';
    return err.message || 'An unexpected error occurred.';
  }
}
