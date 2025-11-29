import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, NgZone, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { Router } from '@angular/router';
import { Videos, VideoUrl } from '../services/videos';
import { Auth } from '../services/auth';
import { finalize, Subscription } from 'rxjs';
import { MoreOptions } from '../more-options/more-options';
import { DeleteVideoConfirmation } from "../delete-video-confirmation/delete-video-confirmation";
import { EditTitle } from "../edit-title/edit-title";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Navbar, MoreOptions, DeleteVideoConfirmation, EditTitle],
  templateUrl: './myvideos.html',
  styleUrl: './myvideos.css',
})
export class Myvideos implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('infiniteScrollAnchor') scrollAnchor!: ElementRef;

  videosUrl: VideoUrl[] = [];
  total = 0;
  page = 0;
  isLoading = false;
  showDeleteConf = false;
  showEditTitle = false;
  videoTitleToEdit!: string;
  videoIdToEdit!: string;
  toDelete!: string;
  keyToDelete!: string;
  thumbnailToDelete!: string;

  private observer?: IntersectionObserver;
  private subscriptions = new Subscription();
  private platformId = inject(PLATFORM_ID);

  constructor(
    private videoService: Videos,
    private authService: Auth,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadVideos();
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    this.subscriptions.unsubscribe();
  }

  private setupIntersectionObserver() {   
    this.observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry.isIntersecting && !this.isLoading && this.videosUrl.length < this.total) {
        this.loadVideos();
      }
    }); 

    if (this.scrollAnchor?.nativeElement) {
      this.observer.observe(this.scrollAnchor.nativeElement);
    }
  }

  loadVideos() {
    const userId = this.authService.getUserInfo()?.id;
    if (!userId) return;

    const isFirstLoad = (this.observer === undefined);

    const videos = this.videoService.getVideos(userId, this.page)
    if (!videos) return;

    this.isLoading = true;
    this.page++;
    
    const sub = videos.pipe(
      finalize(() => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
          if (isFirstLoad) {
            this.setupIntersectionObserver();
          }
        });
      })
    )
    .subscribe({
      next: (resp) => {
        this.videosUrl = [...this.videosUrl, ...resp.content];
        this.total = resp.totalElements;
      },
      error: (err) => {
        console.error('Error loading videos:', err);
      }
    });

    this.subscriptions.add(sub);
  }

  clickOnVideo(id: string) {
    this.router.navigate([`/video/${id}`]);
  }

  formatUploadedDate(uploadedAt: string): string {
    const formattedDateStr = uploadedAt.replace(' ', 'T');
    const date = new Date(formattedDateStr);
    const now = new Date();

    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';

    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, value] of Object.entries(intervals)) {
      const count = Math.floor(seconds / value);
      if (count >= 1) {
        return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  }

  formatDuration(duration: string): string {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/;
    const matches = duration.match(regex);

    if (!matches) {
      return "00:00"; 
    }
    const hours = parseInt(matches[1] || "0", 10);
    const minutes = parseInt(matches[2] || "0", 10);
    const seconds = Math.floor(parseFloat(matches[3] || "0"));

    const pad = (num: number) => num.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    } else {
      return `${pad(minutes)}:${pad(seconds)}`;
    }
  }

  openDelete(videoId: string, key: string, thumbnail: string) {
    this.keyToDelete = key;
    this.thumbnailToDelete = thumbnail;
    this.toDelete = videoId;
    this.showDeleteConf = true;
  }

  closeConfPopup() {
    this.showDeleteConf = false;
  }

  reloadVideos() {
    this.ngZone.run(() => {
      this.videosUrl = [];
      this.total = 0;
      this.page = 0;
      this.observer?.disconnect();
      this.observer = undefined;
      this.loadVideos();
      this.cdr.detectChanges();
    });
  }

  closeEditTitlePopup() {
    this.showEditTitle = false;
  }

  openEditTitle(videoId: string, title: string) {
    this.videoIdToEdit = videoId;
    this.videoTitleToEdit = title;
    this.showEditTitle = true;
  }
}