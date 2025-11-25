import { ChangeDetectorRef, Component, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email: string = '';
  password: string = '';
  error: string = '';
  passwordOrEmailError = false;
  isConnecting = false;

  private router = inject(Router);
  
  constructor(
    private authService: Auth,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }
  
  onSubmit() {
    this.isConnecting = true;
    this.error = "";
    const credentials = { email: this.email, password: this.password };
    this.authService.login(credentials).pipe(
      finalize(() => {
        this.ngZone.run(() => {
          this.isConnecting = false;
          this.cdr.markForCheck();
        });
      })
    ).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token, response.expiresIn);
        this.authService.saveUserInfo(response.userInfo);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.error = 'Invalid credentials.';
        this.passwordOrEmailError = true;
        console.error("sign in error: ", err)
      }
    });
  }
}
