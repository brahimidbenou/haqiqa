import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Videos } from '../services/videos';

@Component({
  selector: 'app-delete-video-confirmation',
  imports: [],
  templateUrl: './delete-video-confirmation.html',
  styleUrl: './delete-video-confirmation.css',
  standalone: true
})
export class DeleteVideoConfirmation {
  @Input() videoId!: string;
  @Input() key!: string;
  @Input() thumbnail!: string

  @Output() close = new EventEmitter();

  constructor(
    private videoService: Videos
  ) { }
  
  onDelete() {
    this.videoService.deleteVideo(this.videoId).subscribe({
      next: () => {
        this.onDeleteFile(this.key);
        this.onDeleteFile(this.thumbnail);
      },
      error: (err) => {
        console.error('deleting video error: ', err);
      }
    })
  }

  onDeleteFile(objectKey: string) {
    this.videoService.deleteVideoFile(objectKey).subscribe({
      error: (err) => {
        console.error('deleting video error: ', err);
      }
    })
  }

  onCloseClick(ev: MouseEvent) {
    ev.stopPropagation();
    ev.preventDefault();
    this.close.emit();
  }
}
