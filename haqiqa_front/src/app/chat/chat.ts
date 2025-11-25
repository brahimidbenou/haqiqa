import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { Messages, Message } from '../services/messages';
import { finalize, forkJoin, timer } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  imports: [NgClass, NgFor, FormsModule, NgIf],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
  standalone: true
})
export class Chat implements OnInit {
  @Input() videoId!: string;
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  messages: Message[] = [];
  total = 0;
  page = 0;
  queryInput = "";
  isThinking = false;
  isLoadingOldMessages = false;
  private shouldScroll = false;
  
  constructor(
    private messageService: Messages,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) { }

  ngOnInit(): void {
    this.loadMsg();  
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }


  scrollToBottomSoon() {
    this.shouldScroll = true;
  }

  scrollToBottom() {
    try {
      const el = this.chatContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    } catch (err) {
      console.error("Auto-scrolling error:", err);
    }
  }

  onScroll() {
    const el = this.chatContainer.nativeElement;

    if (el.scrollTop === 0 && this.messages.length < this.total) {
      this.loadMsg();
    }
  }

  restoreScrollAfterLoad(prevHeight: number) {
    setTimeout(() => {
      try {
        const el = this.chatContainer.nativeElement;
        const newHeight = el.scrollHeight;

        el.scrollTop = newHeight - prevHeight - 20;
      } catch (e) {
        console.error("scroll restore error", e);
      }
    }, 0);
  }

  loadMsg() {
    this.isLoadingOldMessages = true;
    const container = this.chatContainer?.nativeElement;
    const oldHeight = container ? container.scrollHeight : 0;

    const apiCall$ = this.messageService.getMessages(this.videoId, this.page);
    const timer$ = timer(0);

    forkJoin([apiCall$, timer$]).pipe(
      finalize(() => {
        this.ngZone.run(() => {
          this.page++;
          this.isLoadingOldMessages = false;
          this.restoreScrollAfterLoad(oldHeight);
          this.cdr.markForCheck();
        });
      })
    ).subscribe({
      next: ([resp, _]) => {
        this.messages = [...resp.content.reverse(), ...this.messages];
        this.total = resp.totalElements;
      }
    })
  }

  sendMsg(query: string) {
    if (!query.trim().length) {
      return;
    }
    const userMessage: Message = {
      text: query,
      sender: 'USER',
      videoId: this.videoId
    };

    this.messageService.sendMessage(userMessage).pipe(
      finalize(() => {
        this.ngZone.run(() => {
          this.sendQuery(query);
          this.scrollToBottomSoon();
          this.cdr.detectChanges();
        });
      })
    ).subscribe({
      next: (_resp) => {
        this.messages.push(userMessage);
      },
      error: (err) => {
        console.error('error while sending', err);
      }
    })
  }

  sendQuery(query: string) {
    if (!query.trim().length) {
      return;
    }
    
    this.isThinking = true;
    
    const botMessage: Message = {
      text: '',
      sender: 'BOT',
      videoId: this.videoId
    };

    const apiCall$ = this.messageService.askAbout(this.videoId, query);
    const timer$ = timer(3000);

    forkJoin([apiCall$, timer$]).pipe(
      finalize(() => {
        this.ngZone.run(() => {
          this.messages.push(botMessage);
          this.isThinking = false;
          this.scrollToBottomSoon();
          this.cdr.markForCheck();
        });
      })
    ).subscribe({
      next: ([resp, _]) => { 
        botMessage.text = resp.answer;
      },
      error: (err) => {
        botMessage.text = "Error while sending a message, please retry.";
        console.error("Error while asking about the video: ", err);
      }
    });
  }
}
