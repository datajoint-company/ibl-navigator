import { Component, OnInit, OnDestroy, Input, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { SessionPlotsService } from '../session-plots.service';
import { Subscription } from 'rxjs';

declare var Plotly: any;

@Component({
  selector: 'app-session-rtc-plot',
  templateUrl: './session-rtc-plot.component.html',
  styleUrls: ['./session-rtc-plot.component.css']
})
export class SessionRTCPlotComponent implements OnInit, OnDestroy {
  d3 = Plotly.d3;
  plotInfo = [];
  RTCPlotIsAvailable: boolean;
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
  private sessionRTCPlotSubscription: Subscription;
  @Input() sessionData: Object;
  @Input() dialogClosed: boolean;
  @Output() RTCPlotAvailability: EventEmitter<any> = new EventEmitter();
  @Output() openSRTCplot: EventEmitter<any> = new EventEmitter();
  constructor(public sessionPlotsService: SessionPlotsService) { }

  @ViewChild('session_RTC_plot') el: ElementRef;
  ngOnInit() {
    const element = this.el.nativeElement;
    const img_png = this.d3.select('#SRTCpngExport');
    const sessionInfo = { 'subject_uuid': this.sessionData['subject_uuid'], 'session_start_time': this.sessionData['session_start_time'] };

    this.sessionPlotsService.getSessionRTCPlot(sessionInfo);
    this.sessionRTCPlotSubscription = this.sessionPlotsService.getSessionRTCPlotLoadedListener()
      .subscribe((rtcPlotData: any) => {
        if (rtcPlotData[0]) {
          // console.log('subject_uuid: ', rtcPlotData[0]['subject_uuid']);
          // console.log('session_start_time: ', rtcPlotData[0]['session_start_time']);
          this.plotInfo = rtcPlotData[0]['plotting_data'];
          this.RTCPlotIsAvailable = true;
          this.RTCPlotAvailability.emit(this.RTCPlotIsAvailable);
          this.plotConfig['toImageButtonOptions']['filename'] = rtcPlotData[0]['session_start_time'].split('T').join('_') + '_' + this.sessionData['subject_nickname'] + '_session_RTC_plot'
          Plotly.newPlot(element, this.plotInfo['data'], this.plotInfo['layout'], this.plotConfig)
            .then(
              function (gd) {
                return Plotly.toImage(gd, { height: 400, width: 600 })
                  .then(
                    function (url) {
                      img_png.attr('src', url);                    }
                  );
              });
        } else {
          console.log('psych plot not available for this session');
          this.RTCPlotIsAvailable = false;
          this.RTCPlotAvailability.emit(this.RTCPlotIsAvailable);
        }
      });
  }

  ngOnDestroy() {
    if (this.sessionRTCPlotSubscription) {
      this.sessionRTCPlotSubscription.unsubscribe();
    }
  }

  plotClicked(event) {
    console.log('session RTC plot clicked');
    this.openSRTCplot.emit({ showSRTCplot: true });
  }

}
