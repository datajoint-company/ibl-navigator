import { Component, OnInit, OnDestroy, Input, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
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
  psychPlotIsAvailable: boolean;
  downloadIcon = {
    'width': 20,
    'path': 'M4.5 0c-1.21 0-2.27.86-2.5 2-1.1 0-2 .9-2 2 0 .37.11.71.28 1h2.72v-.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v.5h1.91c.06-.16.09-.32.09-.5 0-.65-.42-1.29-1-1.5v-.5c0-1.38-1.12-2.5-2.5-2.5zm-.16 4a.5.5 0 0 0-.34.5v1.5h-1.5l2 2 2-2h-1.5v-1.5a.5.5 0 0 0-.59-.5.5.5 0 0 0-.06 0z',
    // 'path': 'M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z',
    'ascent': 850,
    'descent': -150
  };
  plotConfig = {
      showLink: false,
      showSendToCloud: false,
      displaylogo: false,
      modeBarButtonsToRemove: ['toImage'],
      modeBarButtonsToAdd: [
        {
          name: 'toPngImage',
          title: 'download plot as png',
          // icon: this.downloadIcon,
          icon: Plotly.Icons.camera,
          click: function (gd) {
              var toPngImageButtonOptions = gd._context.toImageButtonOptions;
              toPngImageButtonOptions.format = 'png';
              Plotly.downloadImage(gd, toPngImageButtonOptions);
          }
        },
        {
          name: 'toSVGImage',
          title: 'download plot as svg',
          icon: Plotly.Icons.camera,
          format: 'svg',
          click: function (gd) {
            var toSvgImageButtonOptions = gd._context.toImageButtonOptions;
            toSvgImageButtonOptions.format = 'svg';
            Plotly.downloadImage(gd, toSvgImageButtonOptions);
          }
        }
      ],
      toImageButtonOptions: {
        filename: '',
        scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
      }
  };
  private sessionPsychPlotSubscription: Subscription;
  @Input('sessionData') sessionData: Object;
  @Output() psychPlotAvailability: EventEmitter<any> = new EventEmitter();
  constructor(public sessionPlotsService: SessionPlotsService) { }

  @ViewChild('session_psych_plot') el: ElementRef;
  ngOnInit() {
    const element = this.el.nativeElement;
    // const sessionInfo = { 'subject_uuid': '1a8fa9b4-399b-4175-8c32-e552aaa2541b', 'session_start_time': '2019-03-25T15:51:10'};
    const sessionInfo = { 'subject_uuid': this.sessionData['subject_uuid'], 'session_start_time': this.sessionData['session_start_time'] };
    
    this.sessionPlotsService.getSessionPsychPlot(sessionInfo);
    this.sessionPsychPlotSubscription = this.sessionPlotsService.getSessionPsychPlotLoadedListener()
      .subscribe((psychPlotData: any) => {
        console.log('retrieved session psych plot for...');
        console.log(psychPlotData);
        if (psychPlotData[0]) {
          console.log('subject_uuid: ', psychPlotData[0]['subject_uuid']);
          console.log('session_start_time: ', psychPlotData[0]['session_start_time']);
          this.plotInfo = psychPlotData[0]['plotting_data'];
          this.psychPlotIsAvailable = true;
          this.psychPlotAvailability.emit(this.psychPlotIsAvailable);
          console.log(this.psychPlotIsAvailable);
          this.plotConfig['toImageButtonOptions']['filename'] = psychPlotData[0]['session_start_time'].split('T').join('_') + '_' + this.sessionData['subject_nickname'] + '_session_psych_plot'
          Plotly.newPlot(element, this.plotInfo['data'], this.plotInfo['layout'], this.plotConfig);
        } else {
          console.log('psych plot not available for this session');
          this.psychPlotIsAvailable = false;
          this.psychPlotAvailability.emit(this.psychPlotIsAvailable);
          console.log(this.psychPlotIsAvailable);
        }
      });
  }

  ngOnDestroy() {
    if (this.sessionPsychPlotSubscription) {
      this.sessionPsychPlotSubscription.unsubscribe();
    }
  }

}
