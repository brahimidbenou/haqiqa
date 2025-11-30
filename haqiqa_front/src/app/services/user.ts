import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from './auth';

export interface UserDto {
  avatar: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class User {
  private apiUrl = "http://localhost:8080/users";

  constructor(private http: HttpClient, private authService: Auth) { }
  
  createUser(user: UserDto) {
    return this.http.post<UserDto>(`${this.apiUrl}`, user, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }

  getUser(id: string) {
    return this.http.get<UserDto>(`${this.apiUrl}/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }

  getUserAvatar(key: string) {
    return this.http.get<{ url: string }>(`${this.apiUrl}/avatar`, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      },
      params: {
        'key': key
      }
    });
  }

  updateUser(id: string, avatar: File | null, user: UserDto) {
    const formData = new FormData();

    if (avatar) {
      formData.append('avatar', avatar);
    }

    formData.append('user', new Blob([JSON.stringify(user)], { type: 'application/json' }));

    return this.http.put<UserDto>(`${this.apiUrl}/update/${id}`, formData, {
      headers: { 'Authorization': `Bearer ${this.authService.getToken()}` }
    });
  }
  
  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }

  deleteCollections(id: string) {
    return this.http.delete(`${this.apiUrl}/delete-collections/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }

}
