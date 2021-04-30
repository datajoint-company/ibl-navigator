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
  smallScreen: boolean;
  // isLoggedIn = false;
  menuCollapsed: boolean;
  // userIsAuthenticated;
  // authListenerSubscription = new Subscription();
  // constructor(private authService: AuthService) {}

  ngOnInit() {
    if (window.innerWidth < 431) {
      this.menuCollapsed = true;
      this.smallScreen = true;
    } else {
      this.smallScreen = false;
      this.menuCollapsed = false;
    }
    // this.authListenerSubscription = this.authService.getAuthStatusListener()
    //   .subscribe(loginStatus => {
    //     this.userIsAuthenticated = loginStatus[0];
    //   });
    // this.isLoggedIn = this.authService.isAuthenticated();
    // this.authService.autoLoginUser();
  }
}
