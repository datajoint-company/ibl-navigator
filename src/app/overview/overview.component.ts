import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
  isLoggedIn = this.authService.isLoggedIn;

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

}
