import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from './auth';

export interface Message {
  id?: string;
  text: string;
  sender: string;
  sentAt?: string;
  videoId: string;
} 

@Injectable({
  providedIn: 'root'
})
export class Messages {
  private apiUrl = "http://localhost:8080/messages";

  constructor(private http: HttpClient, private authService: Auth) { }

  sendMessage(message: Message) {
    return this.http.post<Message>(this.apiUrl, message, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    })
  }

  getMessages(videoId: string, page: number = 0, size: number = 10) {
    return this.http.get<any>(`${this.apiUrl}/page/${videoId}?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    })
  }

  askAbout(videoId: string, query: string) {
    return this.http.post<any>(`${this.apiUrl}/chat/${videoId}?query=${query}`, null, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    })
  }
}
