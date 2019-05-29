import { Component, OnInit, OnDestroy, Input, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { SessionPlotsService } from '../session-plots.service';
import { Subscription } from 'rxjs';

declare var Plotly: any;

@Component({
  selector: 'app-session-rttn-plot',
  templateUrl: './session-rttn-plot.component.html',
  styleUrls: ['./session-rttn-plot.component.css']
})
export class SessionRTTNPlotComponent implements OnInit, OnDestroy {
  plotInfo = [];
  RTTNPlotIsAvailable: boolean;
  plotConfig = {
    showLink: false,
    showSendToCloud: false,
    displaylogo: false,
    modeBarButtonsToRemove: ['toImage'],
    modeBarButtonsToAdd: [
      {
        name: 'toPngImage',
        title: 'download plot as png',
        // icon: this.pngDownloadIcon,
        icon: Plotly.Icons.download_png,
        click: function (gd) {
          var toPngImageButtonOptions = gd._context.toImageButtonOptions;
          toPngImageButtonOptions.format = 'png';
          Plotly.downloadImage(gd, toPngImageButtonOptions);
        }
      },
      {
        name: 'toSVGImage',
        title: 'download plot as svg',
        icon: Plotly.Icons.download_svg,
        // icon: this.svgDownloadIcon,
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
  private sessionRTTNPlotSubscription: Subscription;
  @Input() sessionData: Object;
  @Output() RTTNPlotAvailability: EventEmitter<any> = new EventEmitter();
  constructor(public sessionPlotsService: SessionPlotsService) { }

  @ViewChild('session_RTTN_plot') el: ElementRef;
  ngOnInit() {
    const element = this.el.nativeElement;
    const sessionInfo = { 'subject_uuid': this.sessionData['subject_uuid'], 'session_start_time': this.sessionData['session_start_time'] };

    this.sessionPlotsService.getSessionRTTNPlot(sessionInfo);
    this.sessionRTTNPlotSubscription = this.sessionPlotsService.getSessionRTTNPlotLoadedListener()
      .subscribe((rttnPlotData: any) => {
        if (rttnPlotData[0]) {
          console.log('subject_uuid: ', rttnPlotData[0]['subject_uuid']);
          console.log('session_start_time: ', rttnPlotData[0]['session_start_time']);
          this.plotInfo = rttnPlotData[0]['plotting_data'];
          this.RTTNPlotIsAvailable = true;
          this.RTTNPlotAvailability.emit(this.RTTNPlotIsAvailable);
          this.plotConfig['toImageButtonOptions']['filename'] = rttnPlotData[0]['session_start_time'].split('T').join('_') + '_' + this.sessionData['subject_nickname'] + '_session_RTTN_plot'
          Plotly.newPlot(element, this.plotInfo['data'], this.plotInfo['layout'], this.plotConfig);
        } else {
          console.log('psych plot not available for this session');
          this.RTTNPlotIsAvailable = false;
          this.RTTNPlotAvailability.emit(this.RTTNPlotIsAvailable);
        }
      });
  }

  ngOnDestroy() {
    if (this.sessionRTTNPlotSubscription) {
      this.sessionRTTNPlotSubscription.unsubscribe();
    }
  }

}
