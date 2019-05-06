import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
  isLoggedIn = false;
  userIsAuthenticated;
  authListenerSubscription = new Subscription();

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.authListenerSubscription = this.authService.getAuthStatusListener()
      .subscribe(loginStatus => {
        this.userIsAuthenticated = loginStatus;
      });
  }

}
