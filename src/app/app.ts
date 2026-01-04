import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
})
export class AppComponent {
  title = 'web-trading-app';

  constructor(private authService: AuthService) { }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
  }
}
