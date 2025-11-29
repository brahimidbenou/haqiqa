import { Component, Input, Output, EventEmitter, NgZone, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Videos } from '../services/videos';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-edit-title',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-title.html',
  styleUrl: './edit-title.css',
})
export class EditTitle implements OnInit {
  newTitle!: string;
  errorMessage!: string;

  @Input() videoTitle!: string;
  @Input() videoId!: string;

  @Output() close = new EventEmitter();
  @Output() loadVideos = new EventEmitter();

  constructor(
    private videoService: Videos,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }
  
  ngOnInit() {
    this.ngZone.run(() => {
      this.errorMessage = "";
      this.newTitle = this.videoTitle;
      this.cdr.detectChanges();
    })
  }

  onUpdate() {
    this.errorMessage = "";
    if (!this.newTitle.trim().length) {
      this.ngZone.run(() => {
        this.errorMessage = "Title cannot be empty";
        this.cdr.detectChanges();
      })
      return;
    }

    this.videoService.updateVideo(this.videoId, { title: this.newTitle }).pipe(
      finalize(() => {
        this.ngZone.run(() => {
          this.cdr.detectChanges();
        })
      })
    ).subscribe({
      next: () => {
        this.loadVideos.emit();
        this.close.emit();
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.errorMessage = "An error occurred while updating the video title";
          this.cdr.detectChanges();
        });
        console.error('updating video error: ', err);
      }
    })
  }
  
  onCloseClick(ev: MouseEvent) {
    ev.stopPropagation();
    ev.preventDefault();
    this.close.emit();
  }
}
