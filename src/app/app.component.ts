import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // title = 'pipeline-viewer';
  isLoggedIn = false;
  userIsAuthenticated;
  authListenerSubscription = new Subscription();
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authListenerSubscription = this.authService.getAuthStatusListener()
      .subscribe(loginStatus => {
        this.userIsAuthenticated = loginStatus;
      });
    this.isLoggedIn = this.authService.isAuthenticated();
    this.authService.autoLoginUser();
  }
}
