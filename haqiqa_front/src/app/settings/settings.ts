import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core'; 
import { Navbar } from "../navbar/navbar";
import { Auth, UserInfo } from '../services/auth';
import { Router } from '@angular/router';
import { User, UserDto } from '../services/user';
import { FormsModule } from "@angular/forms"; 
import { Videos } from '../services/videos';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-settings',
  imports: [Navbar, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'], 
  standalone: true 
})
export class Settings implements OnInit {
  id: string = "";
  avatar!: File;
  avatarUrl!: string;
  firstName: string = "";
  lastName: string = "";
  email: string = "";
  password: string = ""; 
  confirmPassword: string = "";
  toDeleteAvatar: boolean = false;
  loading: boolean = false;
  successMsg: string = '';
  errorMsg: string = '';

  private originalUserInfo: UserInfo | null = null;

  constructor(
    private authService: Auth,
    private userService: User,
    private videosService: Videos,
    private router: Router,
    private ngZone: NgZone,           
    private cdr: ChangeDetectorRef   
  ) { }

  ngOnInit() {
    const userInfo = this.authService.getUserInfo();
    if (userInfo == null) return;
    
    this.originalUserInfo = userInfo; 
    this.id = userInfo.id;
    this.firstName = userInfo.firstName;
    this.lastName = userInfo.lastName;
    this.email = userInfo.email;
    if (userInfo.avatar?.trim()) {
      this.getAvatar(userInfo.avatar)
    }
  }

  getAvatar(key: string) {
    this.userService.getUserAvatar(key).subscribe({
      next: (resp) => {
        this.ngZone.run(() => {
          this.avatarUrl = resp.url;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        console.error('Failed to fetch avatar:', err);
      }
    });
  }

  onDeleteAvatar() {
    this.avatarUrl = '';
    this.toDeleteAvatar = true;
  }

  deleteAvatar() {
    if (!this.originalUserInfo) return;

    const avatar = this.originalUserInfo.avatar;
    if (!avatar) return;

    this.userService.deleteAvatar(avatar).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMsg = "The avatar will be deleted.";
          this.cdr.detectChanges();
        });
      },
      error: (_err) => {
        this.ngZone.run(() => {
          this.errorMsg = "An error occurred while deleting the avatar. Please try again.";
          this.cdr.detectChanges();
        });
      },
    });
  }

  passwordsMatchValidator() {
    return this.password === this.confirmPassword;
  }

  onSubmit() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim()) {
      this.errorMsg = "Please fill out the required fields.";
      return;
    }
    if (!this.passwordsMatchValidator()) {
      this.errorMsg = "Passwords do not match.";
      return;
    }

    let updatedAvatar = this.originalUserInfo!.avatar;
    if (this.toDeleteAvatar) {
      this.deleteAvatar();
      updatedAvatar = '';
    }

    let user: UserDto = {
      avatar: updatedAvatar,
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      password: this.password.trim() || ''
    };

    this.userService.updateUser(this.id, this.avatar, user).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (this.originalUserInfo) {
            this.originalUserInfo.firstName = this.firstName;
            this.originalUserInfo.lastName = this.lastName;
            this.originalUserInfo.email = this.email;
            this.originalUserInfo.avatar = response.avatar;
            this.authService.saveUserInfo(this.originalUserInfo);
          }
          this.password = this.confirmPassword = '';
          this.successMsg = "The user information has been updated.";
          this.cdr.markForCheck();
        });
      },
      error: (_err) => {
        this.ngZone.run(() => {
          this.errorMsg = "Update failed. Please try again.";
          this.cdr.markForCheck();
        });
      }
    });
  }

  cancel() {
    this.ngZone.run(() => {
      if (this.originalUserInfo) {
        this.firstName = this.originalUserInfo.firstName;
        this.lastName = this.originalUserInfo.lastName;
        this.email = this.originalUserInfo.email;
      }
      if (this.originalUserInfo?.avatar.trim()) {
        this.getAvatar(this.originalUserInfo?.avatar);
      }
      this.password = this.confirmPassword = '';
      this.errorMsg = '';
      this.successMsg = '';
      this.cdr.markForCheck();
    });
  }

  onDelete() {
    this.errorMsg = '';
    this.successMsg = '';

    this.videosService.deleteAllFiles(this.id).subscribe({
      next: () => {
        this.deleteCollections();
        this.deleteUser();
      },
      error: (_err) => {
        this.ngZone.run(() => {
          this.errorMsg = "An error occurred while deleting user files. Please try again.";
          this.cdr.detectChanges();
        });
      }
    });
  }

  deleteUser() {
    this.userService.deleteUser(this.id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMsg = "The user has been deleted.";
          this.authService.logout();
          this.router.navigate(['/']);
          this.cdr.detectChanges();
        });
      },
      error: (_err) => {
        this.ngZone.run(() => {
          this.errorMsg = "An error occurred while deleting the account. Please try again.";
          this.cdr.detectChanges();
        });
      }
    });
  }

  deleteCollections() {
    this.userService.deleteCollections(this.id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMsg = "The collections have been deleted.";
          this.cdr.detectChanges();
        });
      },
      error: (_err) => {
        this.ngZone.run(() => {
          this.errorMsg = "An error occurred while deleting the collections. Please try again.";
          this.cdr.detectChanges();
        });
      }
    })
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.avatar = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.ngZone.run(() => {
        this.avatarUrl = reader.result as string;
        this.cdr.markForCheck();
      });
    };
    reader.readAsDataURL(this.avatar);
  }
}
