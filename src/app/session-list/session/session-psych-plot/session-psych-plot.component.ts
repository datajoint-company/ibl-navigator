import { Component, OnInit, OnDestroy, Input, ElementRef, ViewChild } from '@angular/core';
import { SessionPlotsService } from '../session-plots.service';
import { Subscription } from 'rxjs';

declare var Plotly: any;

@Component({
  selector: 'app-session-psych-plot',
  templateUrl: './session-psych-plot.component.html',
  styleUrls: ['./session-psych-plot.component.css']
})
export class SessionPsychPlotComponent implements OnInit, OnDestroy {
  plotInfo = [];
  private sessionPsychPlotSubscription: Subscription;
  @Input('sessionData') sessionData: Object;
  constructor(public sessionPlotsService: SessionPlotsService) { }

  @ViewChild('session_psych_plot') el: ElementRef;
  ngOnInit() {
    const element = this.el.nativeElement;
    // const sessionInfo = { 'subject_uuid': '1a8fa9b4-399b-4175-8c32-e552aaa2541b', 'session_start_time': '2019-03-25T15:51:10'};
    const sessionInfo = { 'subject_uuid': this.sessionData['subject_uuid'], 'session_start_time': this.sessionData['session_start_time'] };
    console.log('sessionData is...');
    console.log(this.sessionData);
    this.sessionPlotsService.getSessionPsychPlot(sessionInfo);
    this.sessionPsychPlotSubscription = this.sessionPlotsService.getSessionPsychPlotLoadedListener()
      .subscribe((psychPlotData: any) => {
        console.log('retrieved session psych plot for...');
        console.log(psychPlotData);
        if (psychPlotData[0]) {
          console.log('subject_uuid: ', psychPlotData[0]['subject_uuid']);
          console.log('session_start_time: ', psychPlotData[0]['session_start_time']);
          this.plotInfo = psychPlotData[0]['plotting_data'];
          Plotly.newPlot(element, this.plotInfo['data'], this.plotInfo['layout']);
        } else {
          Plotly.newPlot(element);
        }
      });
  }

  ngOnDestroy() {
    if (this.sessionPsychPlotSubscription) {
      this.sessionPsychPlotSubscription.unsubscribe();
    }
  }

}
