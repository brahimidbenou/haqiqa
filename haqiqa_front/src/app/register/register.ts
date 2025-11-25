import { CommonModule, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, NgIf],
  templateUrl: './register.html',
  styleUrl: './register.css',
  standalone: true
})
export class Register {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  error: string = '';
  isRegistering = false;

  private router = inject(Router);

  constructor(
    private authService: Auth,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  register() {
    this.error = "";
    this.isRegistering = true;
    if (this.password !== this.confirmPassword) {
      this.ngZone.run(() => {
        this.error = 'Passwords do not match.';
        this.isRegistering = false;
        this.cdr.markForCheck();
      })
      return;
    }

    const registrationData = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    };

    this.authService.register(registrationData).pipe(
      finalize(() => {
        this.ngZone.run(() => {
          this.isRegistering = false;
          this.cdr.markForCheck();
        })
      })
    ).subscribe({
      next: (_response) => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = 'Registration failed. Please try again.';
        console.error('Register error: ', err);
      }
    });
  }
}
