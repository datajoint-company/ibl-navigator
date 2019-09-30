import { Component, OnInit, OnDestroy, Input, ElementRef, ViewChild, Output, EventEmitter, HostListener } from '@angular/core';
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
  newScreenWidth;
  plotInfo = [];
  RTCPlotIsAvailable: boolean;
  plotConfig = {
    showLink: false,
    showSendToCloud: false,
    displaylogo: false,
    modeBarButtonsToRemove: ['toImage', 'select2d', 'lasso2d'],
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

  mediumScreenDataStyle = {
    'marker.size': ['4'],
    'error_y.width': ['3'],
    'error_y.thickness': ['1.5'],
    'line.width': ['1.5']
  };

  mediumScreenLayout = {
    'xaxis.range': [-35, 35],
    'font.size': '11',
    'width': '580',
    'height': '386',
    'legend.font.size': '9.5'
  };

  smallScreenDataStyle = {
    'marker.size': ['3.5'],
    'error_y.width': ['2.5'],
    'error_y.thickness': ['1'],
    'line.width': ['1']
  };

  smallScreenLayout = {
    'xaxis.range': [-35, 35],
    'font.size': '10.5',
    'width': '400',
    'height': '286',
    'legend.font.size': '9'
  };

  defaultScreenDataStyle = {
    'marker.size': ['5'],
    'error_y.width': ['3.5'],
    'error_y.thickness': ['1.75'],
    'line.width': ['1.75']
  };

  defaultScreenLayout = {
    'xaxis.range': [-35, 35],
    'font.size': '',
    'legend.font.size': '12',
    'width': '600',
    'height': '400'
  };
  private sessionRTCPlotSubscription: Subscription;
  @Input() sessionData: Object;
  @Input() dialogClosed: boolean;
  @Output() RTCPlotAvailability: EventEmitter<any> = new EventEmitter();
  @Output() openSRTCplot: EventEmitter<any> = new EventEmitter();
  constructor(public sessionPlotsService: SessionPlotsService) { }

  @ViewChild('session_RTC_plot') el: ElementRef;
  @HostListener('window:resize', ['$event.target']) onresize(event) {
    this.newScreenWidth = event.innerWidth;
    // console.log('screensize change: ', this.newScreenWidth);
    const responsiveSRTCplot = this.d3.select(this.el.nativeElement).node();
    if (this.newScreenWidth < 1024 && (this.newScreenWidth > 768 || this.newScreenWidth === 768)) {
      Plotly.update(responsiveSRTCplot, this.mediumScreenDataStyle, this.mediumScreenLayout);
    } else if (this.newScreenWidth < 768) {
      Plotly.update(responsiveSRTCplot, this.smallScreenDataStyle, this.smallScreenLayout);
    } else {
      Plotly.update(responsiveSRTCplot, this.defaultScreenDataStyle, this.defaultScreenLayout);
    }
  }
  ngOnInit() {
    const element = this.el.nativeElement;
    const img_png = this.d3.select('#SRTCpngExport');
    const initialScreenSize = window.innerWidth;
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
          this.plotInfo['layout']['plot_bgcolor'] = 'rgba(0, 0, 0, 0)';
          this.plotInfo['layout']['paper_bgcolor'] = 'rgba(0, 0, 0, 0)';
          this.plotInfo['layout']['modebar'] = { bgcolor: 'rgba(255, 255, 255, 0)' };
          Plotly.newPlot(element, this.plotInfo['data'], this.plotInfo['layout'], this.plotConfig)
            .then(
              function (gd) {
                return Plotly.toImage(gd, { height: 400, width: 600 })
                  .then(
                    function (url) {
                      img_png.attr('src', url);                    }
                  );
              });
          if (initialScreenSize < 1024 && (initialScreenSize > 768 || initialScreenSize === 768)) {
            Plotly.update(element, this.mediumScreenDataStyle, this.mediumScreenLayout);
          } else if (initialScreenSize < 768) {
            Plotly.update(element, this.smallScreenDataStyle, this.smallScreenLayout);
          } else {
            Plotly.update(element, this.defaultScreenDataStyle, this.defaultScreenLayout);
          }
        } else {
          // console.log('psych plot not available for this session');
          this.RTCPlotIsAvailable = false;
          this.RTCPlotAvailability.emit(this.RTCPlotIsAvailable);
          // Plotly.newPlot(element, [], this.mediumScreenLayout, { displayModeBar: false })
          //   .then(
          //     function (gd) {
          //       return Plotly.toImage(gd, { height: 400, width: 600 })
          //         .then(
          //           function (url) {
          //             img_png.attr('src', url);
          //             // return Plotly.toImage(gd, { format: 'png', height: 800, width: 1200 });
          //           }
          //         );
          //     });
        }
      });
  }

  ngOnDestroy() {
    if (this.sessionRTCPlotSubscription) {
      this.sessionRTCPlotSubscription.unsubscribe();
    }
  }

  plotClicked(event) {
    // console.log('session RTC plot clicked');
    this.openSRTCplot.emit({ showSRTCplot: true });
  }

}
