import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Auth } from '../services/auth';
import { isPlatformBrowser } from '@angular/common';
import { VideoStatus } from './video-websocket';

export interface Video {
  id: string;
  title: string;
  summary: string;
  userId: string;
  objectKey:string;
  thumbnail: string;
  uploadedAt: string;
  duration: string;
  status: VideoStatus;
}

export interface VideoUrl {
  id: string;
  title: string;
  summary: string;
  url: string;
  key: string;
  uploadedAt: string;
  thumbnail: string;
  duration: string;
  userId: string;
  status: VideoStatus;
}

@Injectable({
  providedIn: 'root'
})
export class Videos {
  private apiUrl = "http://localhost:8080/videos";
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient, private authService: Auth) { }
  
  createVideo(video: Video) {
    return this.http.post<Video>(this.apiUrl, video, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }

  uploadFile(form: FormData) {
    return this.http.post<Video>(`${this.apiUrl}/upload`, form, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }

  getVideo(id: string) {
    if (!isPlatformBrowser(this.platformId)) return null;
    return this.http.get<VideoUrl>(`${this.apiUrl}/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }

  getVideos(userId: string, page: number = 0, size: number = 6) {
    if (!isPlatformBrowser(this.platformId)) return null;
    return this.http.get<any>(`${this.apiUrl}/page/${userId}?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }

  updateVideo(id: string, video: Partial<Video>) {
    return this.http.put<Video>(`${this.apiUrl}/update/${id}`, video, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }

  deleteVideo(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }
  
  deleteVideoFile(key: string) {
    return this.http.delete<any>(`${this.apiUrl}/delete-file?key=${key}`, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }

  transcribe(id: string, objectKey: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    const params = new HttpParams().set('objectKey', objectKey);

    return this.http.post<any>(
      `${this.apiUrl}/start-transcription/${id}`,
      {}, 
      { headers, params }
    );
  }

  analyze(id: string) {
    return this.http.post<any>(`${this.apiUrl}/analyze/${id}`, {}, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }

  deleteVideoCollection(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/delete-video-collection/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }
}
