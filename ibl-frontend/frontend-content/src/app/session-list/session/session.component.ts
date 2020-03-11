import { Component, OnInit, OnDestroy, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AllSessionsService } from '../all-sessions.service';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionPsychPlotComponent } from './session-psych-plot/session-psych-plot.component';
import { SessionRTCPlotComponent } from './session-rtc-plot/session-rtc-plot.component';
import { SessionRTTNPlotComponent } from './session-rttn-plot/session-rttn-plot.component';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit, OnDestroy {
  public session_uuid: string;
  private sessionSubscription: Subscription;
  session: any;
  sessionPlotInfo: any;
  dialogClosedSPC = true;
  dialogClosedSRTC = true;
  dialogClosedSRTTN = true;
  PCplotFitParameter;

  constructor(private route: ActivatedRoute, public allSessionsService: AllSessionsService, public dialog: MatDialog) { }

  @ViewChild(SessionPsychPlotComponent) SPCplotComp: SessionPsychPlotComponent;
  @ViewChild(SessionRTCPlotComponent) SRTCplotComp: SessionPsychPlotComponent;
  @ViewChild(SessionRTTNPlotComponent) SRTTNplotComp: SessionPsychPlotComponent;

  ngOnInit() {
    // console.log('inside session component');
    this.session_uuid = this.route.snapshot.paramMap.get('sessionID');
    // console.log('uuid: ' + this.session_uuid);
    this.allSessionsService.retrieveSessions({'session_uuid': this.session_uuid});
    this.sessionSubscription = this.allSessionsService.getNewSessionsLoadedListener()
    .subscribe((session: any) => {
      this.session = session[0];
      console.log('session retrieved - ', session[0]);
      // console.log('logging session psych plot component stuff');
      // console.log(this.SPPComp.psychPlotAvailability);
    });
  }

  ngOnDestroy() {
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
  }

  fitParsReady(event) {
    this.PCplotFitParameter = event;
  }

  openDialog(x): void {
    // console.log('dialog opening...', x);
    // this.session['showPlot'] = true;
    // if (Object.keys(x)[0] === 'showSPCplot') {
    //   this.dialogClosedSPC = false;
    // } else if (Object.keys(x)[0] === 'showSRTCplot') {
    //   this.dialogClosedSRTC = false;
    // } else if (Object.keys(x)[0] === 'showSRTTNplot') {
    //   this.dialogClosedSRTTN = false;
    // }
    // this.dialogClosed = false;
    const dialogRef = this.dialog.open(SessionPlotDialog, {
      width: '750px',
      height: '580px',
      data: { session: this.session, plot: x }
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed: ', result);
    //   // this.dialogClosedSPC = true;
    //   if (Object.keys(x)[0] === 'showSPCplot') {
    //     this.dialogClosedSPC = true;
    //   } else if (Object.keys(x)[0] === 'showSRTCplot') {
    //     this.dialogClosedSRTC = true;
    //   } else if (Object.keys(x)[0] === 'showSRTTNplot') {
    //     this.dialogClosedSRTTN = true;
    //   }
    // });
  }
}

@Component({
  selector: 'app-session-plot-dialog',
  templateUrl: 'session-plot-dialog.html',
})
export class SessionPlotDialog {

  constructor(
    public dialogRef: MatDialogRef<SessionPlotDialog>,
    @Inject(MAT_DIALOG_DATA) public data
    ) { }

}
