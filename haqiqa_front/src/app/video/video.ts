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
  status: VideoStatus = 'COMPLETED';
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
    this.ngZone.run(() => {
      this.id = this.route.snapshot.paramMap.get('id');
      if (this.id) {
        this.ws.connect(this.id);
        this.statusSub = this.ws.statusUpdates$.subscribe((status) => {
          this.status = status;
          this.cdr.markForCheck();
          if (status == 'COMPLETED') {
            this.onAnalyze(this.id!);
          }
        })
        if (this.status == 'COMPLETED') {
          this.getVideo(this.id);
        }
      }
    });
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
          this.cdr.markForCheck();
        });
      })
    ).subscribe({
      next: (resp) => {
        this.videoUrl = resp;
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.hasError = true;
          this.videoUrl = undefined;
          console.error('cannot find the video:', err);
        });
      }
    });
  }

  onAnalyze(id: string) {
    this.isAnlyzing = true;
    this.videoService.analyze(id).pipe(
      finalize(() => {
        this.ngZone.run(() => {
          this.isAnlyzing = false;
          this.cdr.markForCheck();
        });
      })
    ).subscribe({
      next: (resp) => {
        this.videoUrl!.title = resp.title;
        this.videoUrl!.summary = resp.summary;
      },
      error: (err) => {
        console.error('Error analyzing video:', err);
      }
    })
  }
}