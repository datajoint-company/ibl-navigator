import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  // isLoggedIn = this.authService.isLoggedIn;
  isLoggedIn = false;
  userIsAuthenticated;
  private authListenerSubscription: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.authListenerSubscription = this.authService.getAuthStatusListener()
      .subscribe(loginStatus => {
        this.userIsAuthenticated = loginStatus;
      });
  }

  ngOnDestroy() {
    if (this.authListenerSubscription) {
      this.authListenerSubscription.unsubscribe();
    }
  }

  onLogin(form: NgForm) {
    console.log('logging in');
    const username = form.value.username;
    const password = form.value.password;

    this.authService.login(username, password);
  }

  logOut() {
    console.log('logging out');
    this.authService.logout();
  }


}
