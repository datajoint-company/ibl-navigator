import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit() {
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
