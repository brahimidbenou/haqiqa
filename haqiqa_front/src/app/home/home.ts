import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import '../services/videos';
import { Videos } from '../services/videos';
import { Auth } from '../services/auth';
import { Navbar } from "../navbar/navbar";
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { NgIf } from "@angular/common";

@Component({
  selector: 'app-upload',
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [Navbar, NgIf],
  standalone: true
})
export class Home {
  selectedFile: File | null = null;
  thumbnailFile: File | null = null;
  videoTitle: string = 'New video';
  videoSummary: string = 'Video summary.';
  userId: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  uploading: boolean = false;

  constructor(
    private authService: Auth,
    private videoService: Videos,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  onUpload() {
    this.errorMessage = '';
    this.successMessage = '';
    this.uploading = true;
    this.userId = this.authService.getUserInfo()?.id || '';
    const formData = new FormData();
    if (!this.selectedFile || !this.thumbnailFile) {
      this.errorMessage = 'No video is selected';
      this.ngZone.run(() => {
        this.uploading = false;
        this.cdr.markForCheck();
      });
      return;
    }
    formData.append('video', this.selectedFile);
    formData.append('thumbnail', this.thumbnailFile);
    formData.append('title', this.videoTitle);
    formData.append('summary', this.videoSummary);
    formData.append('userId', this.userId);

    this.videoService.uploadFile(formData).pipe(
      finalize(() => {
        this.ngZone.run(() => {
          this.uploading = false;
          this.cdr.markForCheck();
        });
      })
    ).subscribe({
      next: (video) => {
        this.errorMessage = '';
        this.successMessage = 'Video uploaded successfully!';
        this.selectedFile = null;
        this.thumbnailFile = null;
        this.onTranscribe(video.id, video.objectKey);
        setTimeout(() => {
          this.router.navigate([`/video/${video.id}`])
        }, 0);
      },
      error: (err) => {
        this.errorMessage = 'Error uploading video.';
        console.error('Error uploading video:', err);
      },
    });
  }

  onTranscribe(id: string, objectKey: string) {
    this.videoService.transcribe(id, objectKey).subscribe({
      error: (err) => {
        console.error('Error transcribing video:', err);
      }
    })
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.selectedFile = file;
    this.errorMessage = '';
    this.successMessage = '';

    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;

    video.addEventListener('loadeddata', () => {
      video.currentTime = Math.min(0.5, video.duration / 2);
    });

    video.addEventListener('seeked', async () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          this.thumbnailFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
        }
        URL.revokeObjectURL(video.src);
      }, 'image/jpeg', 0.8);
    });
  }
}
