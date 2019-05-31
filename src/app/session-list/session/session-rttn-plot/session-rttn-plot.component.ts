import { Component, OnInit, OnDestroy, Input, ElementRef, ViewChild, Output, EventEmitter, HostListener } from '@angular/core';
import { SessionPlotsService } from '../session-plots.service';
import { Subscription } from 'rxjs';

declare var Plotly: any;

@Component({
  selector: 'app-session-rttn-plot',
  templateUrl: './session-rttn-plot.component.html',
  styleUrls: ['./session-rttn-plot.component.css']
})
export class SessionRTTNPlotComponent implements OnInit, OnDestroy {
  d3 = Plotly.d3;
  newScreenWidth;
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

  mediumScreenDataStyle = {
    'marker.size': ['4'],
    'line.width': ['1.5']
  };

  mediumScreenLayout = {
    'font.size': '11',
    'width': '580',
    'height': '386',
    'legend.font.size': '9.5'
  };

  smallScreenDataStyle = {
    'marker.size': ['3.5'],
    'line.width': ['1']
  };

  smallScreenLayout = {
    'font.size': '10.5',
    'width': '400',
    'height': '286',
    'legend.font.size': '9'
  };

  defaultScreenDataStyle = {
    'marker.size': ['5'],
    'line.width': ['1.75']
  };

  defaultScreenLayout = {
    'font.size': '',
    'legend.font.size': '12',
    'width': '600',
    'height': '400'
  };
  private sessionRTTNPlotSubscription: Subscription;
  @Input() sessionData: Object;
  @Input() dialogClosed: boolean;
  @Output() RTTNPlotAvailability: EventEmitter<any> = new EventEmitter();
  @Output() openSRTTNplot: EventEmitter<any> = new EventEmitter();
  constructor(public sessionPlotsService: SessionPlotsService) { }

  @ViewChild('session_RTTN_plot') el: ElementRef;
  @HostListener('window:resize', ['$event.target']) onresize(event) {
    this.newScreenWidth = event.innerWidth;
    // console.log('screensize change: ', this.newScreenWidth);
    const responsiveSRTTNplot = this.d3.select(this.el.nativeElement).node();
    if (this.newScreenWidth < 1024 && (this.newScreenWidth > 768 || this.newScreenWidth === 768)) {
      Plotly.update(responsiveSRTTNplot, this.mediumScreenDataStyle, this.mediumScreenLayout);
    } else if (this.newScreenWidth < 768) {
      Plotly.update(responsiveSRTTNplot, this.smallScreenDataStyle, this.smallScreenLayout);
    } else {
      Plotly.update(responsiveSRTTNplot, this.defaultScreenDataStyle, this.defaultScreenLayout);
    }
  }
  ngOnInit() {
    const element = this.el.nativeElement;
    const initialScreenSize = window.innerWidth;
    const img_png = this.d3.select('#SRTTNpngExport');
    const sessionInfo = { 'subject_uuid': this.sessionData['subject_uuid'], 'session_start_time': this.sessionData['session_start_time'] };

    this.sessionPlotsService.getSessionRTTNPlot(sessionInfo);
    this.sessionRTTNPlotSubscription = this.sessionPlotsService.getSessionRTTNPlotLoadedListener()
      .subscribe((rttnPlotData: any) => {
        if (rttnPlotData[0]) {
          // console.log('subject_uuid: ', rttnPlotData[0]['subject_uuid']);
          // console.log('session_start_time: ', rttnPlotData[0]['session_start_time']);
          this.plotInfo = rttnPlotData[0]['plotting_data'];
          this.RTTNPlotIsAvailable = true;
          this.RTTNPlotAvailability.emit(this.RTTNPlotIsAvailable);
          this.plotConfig['toImageButtonOptions']['filename'] = rttnPlotData[0]['session_start_time'].split('T').join('_') + '_' + this.sessionData['subject_nickname'] + '_session_RTTN_plot'
          this.plotInfo['layout']['plot_bgcolor'] = 'rgba(0, 0, 0, 0)';
          this.plotInfo['layout']['paper_bgcolor'] = 'rgba(0, 0, 0, 0)';
          this.plotInfo['layout']['modebar'] = { bgcolor: 'rgba(255, 255, 255, 0)' };
          Plotly.newPlot(element, this.plotInfo['data'], this.plotInfo['layout'], this.plotConfig)
            .then(
              function (gd) {
                return Plotly.toImage(gd, { height: 400, width: 600 })
                  .then(
                    function (url) {
                      img_png.attr('src', url);
                    }
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

  plotClicked(event) {
    console.log('session RTTN plot clicked');
    this.openSRTTNplot.emit({ showSRTTNplot: true });
  }

}
