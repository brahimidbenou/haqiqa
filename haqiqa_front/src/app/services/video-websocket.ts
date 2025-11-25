import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { Auth } from './auth';

export type VideoStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

@Injectable({
  providedIn: 'root'
})
export class VideoWebsocket {
  apiUrl: string = 'http://localhost:8080';
  private stompClient!: Client;
  private statusSubject = new Subject<VideoStatus>();

  public statusUpdates$ = this.statusSubject.asObservable();

  constructor(private authService: Auth) { }

  connect(videoId: string) {
    const token = this.authService.getToken();

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${this.apiUrl}/ws?token=${token}`),
      reconnectDelay: 5000,              
      heartbeatIncoming: 4000,          
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('✅ Connected to WebSocket');
        this.stompClient.subscribe(`/topic/videos/${videoId}`, (message: IMessage) => {
          console.log("msss;", message)
          if (message.body) {
            const newStatus = message.body as VideoStatus;
            console.log(`📩 New status for video ${videoId}:`, newStatus);
            this.statusSubject.next(newStatus);
          }
        });
      },
      onStompError: (frame) => {
        console.error('❌ Broker error: ', frame.headers['message']);
        console.error('Details: ', frame.body);
      }
    });

    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate()
        .then(() => console.log('🔌 Disconnected from WebSocket'))
        .catch(err => console.error('Error during disconnect:', err));
    }
  }
}
