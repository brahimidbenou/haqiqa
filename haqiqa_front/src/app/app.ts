import { Component, signal } from '@angular/core';
import { Auth } from './services/auth';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('haqiqa-ai');
  private logoutTimer: any = null; 

  constructor(private authService: Auth, private router: Router) {
    this.startAutoLogoutTimer();
  }

  startAutoLogoutTimer() {
    this.clearAutoLogoutTimer(); 

    const expiresAtString = this.authService.getExpiresAt();
    if (!expiresAtString) {
      return;
    }

    const expirationDate = new Date(expiresAtString);
    const now = new Date();

    const delay = expirationDate.getTime() - now.getTime();
    if (delay <= 0) {
      this.logout();
    } else {
      this.logoutTimer = setTimeout(() => {
        this.logout();
      }, delay);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.clearAutoLogoutTimer();
  }

  clearAutoLogoutTimer() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

}