import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AllSessionsService } from '../all-sessions.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit {
  public session_uuid: string;
  private sessionSubscription: Subscription;
  session: Object;

  constructor(private route: ActivatedRoute, public allSessionsService: AllSessionsService) { }

  ngOnInit() {
    console.log('inside session component');
    this.session_uuid = this.route.snapshot.paramMap.get('sessionID');
    console.log('uuid: ' + this.session_uuid);
    this.allSessionsService.retrieveSessions({'session_uuid': this.session_uuid});
    this.sessionSubscription = this.allSessionsService.getNewSessionsLoadedListener()
    .subscribe((session: any) => {
      console.log(typeof session);
      this.session = session[0];
    });
  }


}
