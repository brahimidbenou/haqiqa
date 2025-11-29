import { Component, OnInit, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { Chat } from "../chat/chat";
import { Videos, VideoUrl } from '../services/videos';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgForOf } from '@angular/common';
import { finalize, Subscription } from 'rxjs';
import { VideoStatus, VideoWebsocket } from '../services/video-websocket';

@Component({
  selector: 'app-video',
  imports: [Navbar, Chat, NgIf, NgForOf],
  templateUrl: './video.html',
  styleUrl: './video.css',
  standalone: true
})
export class Video implements OnInit, OnDestroy {
  videoUrl?: VideoUrl;
  id: string | null = "";
  status: VideoStatus = 'PROCESSING';
  private statusSub?: Subscription;
  isLoading: boolean = false;
  isAnlyzing: boolean = false;
  hasError: boolean = false;
  loaders = Array(8);

  constructor(
    private videoService: Videos,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private ws: VideoWebsocket
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.ws.connect(this.id);
      this.statusSub = this.ws.statusUpdates$.subscribe((status) => {
        this.ngZone.run(() => {
          this.status = status;
          this.cdr.detectChanges();
          if (status == 'COMPLETED') {
            this.onAnalyze(this.id!);
          }
        });
      })
      this.getVideo(this.id);
    }
  }

  ngOnDestroy() {
    this.ws.disconnect();
    this.statusSub?.unsubscribe();
  }

  getVideo(id: string) {
    const video$ = this.videoService.getVideo(id);
    if (!video$) return;

    this.isLoading = true;
    this.hasError = false;

    video$.pipe(
      finalize(() => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      })
    ).subscribe({
      next: (resp) => {
        this.ngZone.run(() => {
          this.videoUrl = resp;
          this.status = this.videoUrl.status;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.hasError = true;
          this.videoUrl = undefined;
          console.error('cannot find the video:', err);
          this.cdr.detectChanges();
        });
      }
    });
  }

  onAnalyze(id: string) {
    this.ngZone.run(() => {
      this.isAnlyzing = true;
      this.cdr.detectChanges();
    });
    this.videoService.analyze(id).pipe(
      finalize(() => {
        this.ngZone.run(() => {
          this.isAnlyzing = false;
          this.cdr.detectChanges();
        });
      })
    ).subscribe({
      next: (resp) => {
        this.ngZone.run(() => {
          if (this.videoUrl) {
            this.videoUrl.title = resp.title;
            this.videoUrl.summary = resp.summary;
          }
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error analyzing video:', err);
      }
    })
  }
}