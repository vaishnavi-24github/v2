import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { NavigationComponent } from '../../shared/navigation/navigation.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NavigationComponent
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['username', 'email', 'role', 'enabled', 'actions'];
  loading = false;
  currentUsername: string = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    const currentUser = this.authService.getCurrentUser();
    this.currentUsername = currentUser?.username || '';
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Users loaded successfully:', users);
        this.users = Array.isArray(users) ? users : [];
        this.loading = false;
        if (this.users.length === 0) {
          console.warn('No users found in response');
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading users:', err);
        const errorMessage = err.error?.message || err.error?.error || err.message || 'Failed to load users';
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 5000 });
        this.users = [];
      }
    });
  }

  toggleUserStatus(user: User): void {
    if (!user.id || user.id === 0) {
      this.snackBar.open('Invalid user ID', 'Close', { duration: 3000 });
      return;
    }
    
    const newStatus = !user.enabled;
    console.log(`Toggling user ${user.username} status from ${user.enabled} to ${newStatus}`);
    
    this.loading = true;
    this.userService.updateUserStatus(user.id, newStatus).subscribe({
      next: (updatedUser) => {
        console.log('User status updated successfully:', updatedUser);
        // Update the user in the local array
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], enabled: updatedUser.enabled };
        }
        this.loading = false;
        this.snackBar.open(
          `User ${updatedUser.enabled ? 'activated' : 'deactivated'} successfully`,
          'Close',
          { duration: 3000 }
        );
      },
      error: (err) => {
        this.loading = false;
        console.error('Error updating user status:', err);
        console.error('Error status:', err.status);
        console.error('Error statusText:', err.statusText);
        if (err.error) {
          console.error('Error body:', JSON.stringify(err.error, null, 2));
          // Check for validation errors
          if (err.error.errors && Array.isArray(err.error.errors)) {
            const validationErrors = err.error.errors.map((e: any) => 
              e.defaultMessage || e.message || `${e.field}: ${e.rejectedValue || 'invalid'}`
            ).join(', ');
            this.snackBar.open(`Validation Error: ${validationErrors}`, 'Close', { duration: 7000 });
            return;
          }
          // Check for nested error structure
          if (err.error.data && typeof err.error.data === 'object') {
            const fieldErrors = Object.keys(err.error.data)
              .filter(key => typeof err.error.data[key] === 'string')
              .map(key => err.error.data[key]);
            if (fieldErrors.length > 0) {
              this.snackBar.open(`Validation Error: ${fieldErrors.join(', ')}`, 'Close', { duration: 7000 });
              return;
            }
          }
        }
        const errorMessage = err.error?.message || err.error?.error || err.message || 'Failed to update user status';
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 5000 });
      }
    });
  }
}
