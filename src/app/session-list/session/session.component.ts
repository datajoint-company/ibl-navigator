import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AllSessionsService } from '../all-sessions.service';
import { Subscription } from 'rxjs';
// import { SessionPsychPlotComponent } from './session-psych-plot/session-psych-plot.component';


@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit, OnDestroy {
  public session_uuid: string;
  private sessionSubscription: Subscription;
  session: Object;
  sessionPlotInfo: Object;

  constructor(private route: ActivatedRoute, public allSessionsService: AllSessionsService) { }

  // @ViewChild(SessionPsychPlotComponent) SPPComp: SessionPsychPlotComponent;
  ngOnInit() {
    console.log('inside session component');
    this.session_uuid = this.route.snapshot.paramMap.get('sessionID');
    console.log('uuid: ' + this.session_uuid);
    this.allSessionsService.retrieveSessions({'session_uuid': this.session_uuid});
    this.sessionSubscription = this.allSessionsService.getNewSessionsLoadedListener()
    .subscribe((session: any) => {
      this.session = session[0];
      // console.log('logging session psych plot component stuff');
      // console.log(this.SPPComp.psychPlotAvailability);
    });
  }

  ngOnDestroy() {
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
  }

}
