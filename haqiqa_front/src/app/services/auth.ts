import { HttpClient } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

interface LoginResponse  {
  token: string;
  expiresIn: number;
  userInfo: UserInfo;
}

export interface UserInfo {
  id: string;
  avatar: string;
  firstName: string;
  lastName: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = "http://localhost:8080/auth";
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) { }
  
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  saveToken(token: string, expiresIn?: number): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      if (expiresIn) {
        const expiresAt = new Date(Date.now() + expiresIn);
        localStorage.setItem('token_expires_at', expiresAt.toISOString());
      }
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  getExpiresAt(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token_expires_at');
    }
    return null;
  }

  saveUserInfo(userInfo: UserInfo): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user_info', JSON.stringify(userInfo));
    }
  }

  getUserInfo(): UserInfo | null {
    if (isPlatformBrowser(this.platformId)) {
      const userInfo = localStorage.getItem('user_info');
      return userInfo ? JSON.parse(userInfo) : null;
    }
    return null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('token_expires_at');
      localStorage.removeItem('user_info');
    }
  }

  register(userDetails: { firstName: string; lastName: string; email: string; password: string }) {
    return this.http.post(`${this.apiUrl}/signup`, userDetails);
  }
}
