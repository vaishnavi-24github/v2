import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    console.log('Fetching users from:', `${environment.apiUrl}/admin/users`);
    return this.http.get<any>(`${environment.apiUrl}/admin/users`).pipe(
      map(response => {
        console.log('Raw users response from API:', response);
        
        // Handle nested response structure (response.data or response.content)
        let users: any[] = [];
        
        if (Array.isArray(response)) {
          users = response;
        } else if (response.data && Array.isArray(response.data)) {
          users = response.data;
        } else if (response.content && Array.isArray(response.content)) {
          users = response.content;
        } else if (response.users && Array.isArray(response.users)) {
          users = response.users;
        } else {
          console.warn('Unexpected response structure:', response);
          return [];
        }
        
        // Normalize user data
        const normalizedUsers: User[] = users.map(user => {
          // Handle role detection - check multiple possible formats
          let role: 'USER' | 'ADMIN' = 'USER';
          
          // Check if role is an array (Spring Security format)
          if (Array.isArray(user.roles)) {
            role = user.roles.some((r: string) => r === 'ADMIN' || r === 'ROLE_ADMIN') ? 'ADMIN' : 'USER';
          } else if (user.roles && typeof user.roles === 'string') {
            role = (user.roles === 'ADMIN' || user.roles === 'ROLE_ADMIN') ? 'ADMIN' : 'USER';
          } else if (user.role) {
            // Handle string role
            const roleStr = String(user.role).toUpperCase();
            role = (roleStr === 'ADMIN' || roleStr === 'ROLE_ADMIN') ? 'ADMIN' : 'USER';
          } else if (user.authorities && Array.isArray(user.authorities)) {
            // Check authorities array
            role = user.authorities.some((a: any) => {
              const authStr = String(a.authority || a || '').toUpperCase();
              return authStr === 'ADMIN' || authStr === 'ROLE_ADMIN';
            }) ? 'ADMIN' : 'USER';
          }
          
          console.log(`User ${user.username}: role=${user.role}, roles=${user.roles}, normalized=${role}`);
          
          return {
            id: user.id || user._id || 0,
            username: user.username || '',
            email: user.email || '',
            role: role,
            enabled: user.enabled !== undefined ? !!user.enabled : (user.active !== undefined ? !!user.active : true)
          };
        });
        
        console.log('Normalized users:', normalizedUsers);
        return normalizedUsers;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching users:', error);
        console.error('Error status:', error.status);
        console.error('Error statusText:', error.statusText);
        if (error.error) {
          console.error('Error body:', JSON.stringify(error.error, null, 2));
        }
        return throwError(() => error);
      })
    );
  }

  createUser(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/admin/users`, user);
  }

  updateUserStatus(id: number, enabled: boolean): Observable<User> {
    console.log('Updating user status - ID:', id, 'Enabled:', enabled);
    
    // Backend expects 'active' field (not 'enabled')
    // The backend validation error says "Active status is required"
    const payload: any = { active: enabled };
    
    console.log('Update user status payload:', JSON.stringify(payload, null, 2));
    console.log('Sending PUT request to:', `${environment.apiUrl}/admin/users/${id}/status`);
    
    return this.http.put<any>(`${environment.apiUrl}/admin/users/${id}/status`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      map(response => {
        console.log('Update user status response:', response);
        
        // Handle nested response structure
        const userData = response.data || response;
        
        // Normalize user data
        let role: 'USER' | 'ADMIN' = 'USER';
        if (Array.isArray(userData.roles)) {
          role = userData.roles.some((r: string) => r === 'ADMIN' || r === 'ROLE_ADMIN') ? 'ADMIN' : 'USER';
        } else if (userData.role) {
          const roleStr = String(userData.role).toUpperCase();
          role = (roleStr === 'ADMIN' || roleStr === 'ROLE_ADMIN') ? 'ADMIN' : 'USER';
        }
        
        return {
          id: userData.id || id,
          username: userData.username || '',
          email: userData.email || '',
          role: role,
          // Handle both 'enabled' and 'active' fields in response
          enabled: userData.enabled !== undefined ? !!userData.enabled : 
                   (userData.active !== undefined ? !!userData.active : enabled)
        };
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error updating user status:', error);
        console.error('Error status:', error.status);
        console.error('Error statusText:', error.statusText);
        if (error.error) {
          console.error('Error body:', JSON.stringify(error.error, null, 2));
        }
        return throwError(() => error);
      })
    );
  }
}
