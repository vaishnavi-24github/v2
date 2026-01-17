import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Ensure credentials are properly formatted
    const loginPayload = {
      username: credentials.username?.trim() || '',
      password: credentials.password || ''
    };

    // Log request for debugging (remove in production)
    console.log('Sending login request to:', `${environment.apiUrl}/auth/login`);
    console.log('Payload:', { username: loginPayload.username, password: '***' });

    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, loginPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap(response => {
        console.log('Full login response received:', response);
        
        // Handle nested response structure (response.data.token)
        const responseData = (response as any).data || response;
        
        // Try different possible token field names
        let token: string | null = null;
        
        if (responseData) {
          // Check for common token field names in data object or root
          token = responseData.token || 
                  responseData.accessToken || 
                  responseData.jwtToken || 
                  responseData.access_token ||
                  responseData.jwt_token ||
                  responseData.authToken ||
                  (response as any).token ||
                  (response as any).accessToken;
        }
        
        // If token is still null, log the entire response for debugging
        if (!token || typeof token !== 'string') {
          console.error('Token not found in response. Full response:', JSON.stringify(response, null, 2));
          throw new Error('Invalid token received from server. Token field not found in response.');
        }
        
        // Store the token
        this.setToken(token.trim());
        console.log('Token stored successfully');
        
        // Extract username and role - handle nested structure
        const username = responseData.username || 
                        responseData.userName || 
                        (response as any).username || 
                        '';
        
        // Handle roles array - convert to single role string
        let role: 'USER' | 'ADMIN' = 'USER';
        if (responseData.roles && Array.isArray(responseData.roles)) {
          // Check if ADMIN role exists in the roles array
          role = responseData.roles.includes('ADMIN') || 
                 responseData.roles.includes('ROLE_ADMIN') ? 'ADMIN' : 'USER';
        } else if (responseData.role) {
          role = responseData.role === 'ADMIN' || responseData.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER';
        } else if ((response as any).role) {
          role = (response as any).role === 'ADMIN' ? 'ADMIN' : 'USER';
        }
        
        const user: User = {
          id: 0,
          username: username,
          email: responseData.email || '',
          role: role,
          enabled: true
        };
        this.setUser(user);
        this.currentUserSubject.next(user);
        console.log('User data stored:', { username, role });
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem('hasLoggedInThisSession'); // Clear session flag on logout
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
}
