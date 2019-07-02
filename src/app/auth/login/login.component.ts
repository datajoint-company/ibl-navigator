import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  loginFail;
  userIsAuthenticated;
  returnUrl: string;
  private authListenerSubscription: Subscription;

  constructor(private authService: AuthService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['rt'] || '/';
    this.isLoggedIn = this.authService.isAuthenticated();
    this.authListenerSubscription = this.authService.getAuthStatusListener()
      .subscribe(loginStatus => {
        // this.userIsAuthenticated = loginStatus;
        this.userIsAuthenticated = loginStatus[0];
        this.loginFail = loginStatus[1];
        // console.log('login failed? ', this.loginFail);
      });
  }

  ngOnDestroy() {
    if (this.authListenerSubscription) {
      this.authListenerSubscription.unsubscribe();
    }
  }

  onLogin(form: NgForm) {
    // console.log('logging in');
    const username = form.value.username;
    const password = form.value.password;

    this.authService.login(username, password, this.returnUrl);
  }

  logOut() {
    // console.log('logging out');
    this.authService.logout();
  }


}
