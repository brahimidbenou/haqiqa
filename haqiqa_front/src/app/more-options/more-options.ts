import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-more-options',
  imports: [FormsModule, NgIf],
  templateUrl: './more-options.html',
  styleUrl: './more-options.css',
  standalone: true
})
export class MoreOptions {
  showMenu = false;
  isHiding = false;
  
  @Output() editTitle = new EventEmitter<string>();
  @Output() deleteVideo = new EventEmitter();

  onMoreClick(ev: MouseEvent) {
    ev.stopPropagation();
    ev.preventDefault();
    if (this.showMenu) {
      this.isHiding = true;
      setTimeout(() => {
        this.showMenu = false;
        this.isHiding = false;
      }, 300);
    } else {
      this.showMenu = true;
    }
  }

  onEditClick(ev: MouseEvent) {
    ev.stopPropagation();
    ev.preventDefault();
    this.showMenu = false;
    this.editTitle.emit();
  }

  onDeleteClick(ev: MouseEvent) {
    ev.stopPropagation();
    this.showMenu = false;
    this.deleteVideo.emit();
  }
}
