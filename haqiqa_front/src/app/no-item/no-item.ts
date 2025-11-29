import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-no-item',
  imports: [],
  templateUrl: './no-item.html',
  styleUrl: './no-item.css',
})
export class NoItem {
  @Input() message: string = 'No Item';
}
