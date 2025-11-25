import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Auth } from '../services/auth';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private platformId = inject(PLATFORM_ID);

  constructor(private authService: Auth, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (!isPlatformBrowser(this.platformId)) return true;
    const token = this.authService.getToken();
    return token ? true : this.router.createUrlTree(['/']);
  }

}
