import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  // Public route - Login page
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  
  // Protected routes - Require authentication via AuthGuard
  {
    path: 'deals',
    canActivate: [authGuard], // AuthGuard checks token and redirects to /login if missing
    children: [
      {
        path: '',
        loadComponent: () => import('./components/deals/deal-list/deal-list.component').then(m => m.DealListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./components/deals/deal-form/deal-form.component').then(m => m.DealFormComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./components/deals/deal-form/deal-form.component').then(m => m.DealFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/deals/deal-details/deal-details.component').then(m => m.DealDetailsComponent)
      }
    ]
  },
  
  // Admin routes - Requires authentication AND admin role
  {
    path: 'admin/users',
    canActivate: [authGuard, roleGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/admin/user-management/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./components/admin/create-user/create-user.component').then(m => m.CreateUserComponent)
      }
    ]
  },
  
  // Default route - Redirect to login (app startup)
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  
  // Wildcard route - Redirect unknown routes to login
  {
    path: '**',
    redirectTo: '/login'
  }
];
