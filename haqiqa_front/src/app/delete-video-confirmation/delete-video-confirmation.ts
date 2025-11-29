import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, Output } from '@angular/core';
import { Videos } from '../services/videos';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delete-video-confirmation',
  imports: [CommonModule, FormsModule],
  templateUrl: './delete-video-confirmation.html',
  styleUrl: './delete-video-confirmation.css',
  standalone: true
})
export class DeleteVideoConfirmation {
  errorMessage!: string;

  @Input() videoId!: string;
  @Input() key!: string;
  @Input() thumbnail!: string

  @Output() close = new EventEmitter();
  @Output() loadVideos = new EventEmitter();

  constructor(
    private videoService: Videos,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  onDelete(ev?: MouseEvent) {
    this.errorMessage = "";
    this.videoService.deleteVideo(this.videoId).subscribe({
      next: () => {
        this.onDeleteFile(this.key);
        this.onDeleteFile(this.thumbnail);
        this.onDeleteCollection();
        this.onLoadVideos();
        if (ev) {
          this.onCloseClick(ev);
        } else {
          this.close.emit();
        }
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.errorMessage = "An error occurred while deleting the video";
          this.cdr.detectChanges();
        });
        console.error('deleting video   error: ', err);
      }
    })
  }

  onDeleteFile(objectKey: string) {
    this.videoService.deleteVideoFile(objectKey).subscribe({
      error: (err) => {
        this.ngZone.run(() => {
          this.errorMessage = "An error occurred while deleting the video";
          this.cdr.detectChanges();
        });
        console.error('deleting video error: ', err);
      }
    })
  }

  onDeleteCollection() {
    this.videoService.deleteVideoCollection(this.videoId).subscribe({
      error: (err) => {
        this.ngZone.run(() => {
          this.errorMessage = "An error occurred while deleting the video";
          this.cdr.detectChanges();
        });
        console.error('deleting video collection error: ', err);
      }
    })
  }

  onLoadVideos() {
    this.loadVideos.emit();
  }

  onCloseClick(ev: MouseEvent) {
    ev.stopPropagation();
    ev.preventDefault();
    this.close.emit();
  }

  onDeleteClick(ev: MouseEvent) {
    this.onDelete(ev);
  }
}
