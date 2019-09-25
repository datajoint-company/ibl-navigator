import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { MousePlotsService } from '../mouse-plots.service';

declare var Plotly: any;

@Component({
  selector: 'app-trial-counts-session-duration',
  templateUrl: './trial-counts-session-duration.component.html',
  styleUrls: ['./trial-counts-session-duration.component.css']
})
export class TrialCountsSessionDurationComponent implements OnInit, OnDestroy {
  d3 = Plotly.d3;
  newScreenWidth;
  dataLen: number;
  TCSDPlotIsAvailable: boolean;
  loading = true;
  plotConfig = {
    responsive: false,
    showLink: false,
    showSendToCloud: false,
    displaylogo: false,
    modeBarButtonsToRemove: ['toImage'],
    modeBarButtonsToAdd: [
      {
        name: 'toPngImage',
        title: 'download plot as png',
        icon: Plotly.Icons.download_png,
        click: function (gd) {
          const toPngImageButtonOptions = gd._context.toImageButtonOptions;
          toPngImageButtonOptions.format = 'png';
          Plotly.downloadImage(gd, toPngImageButtonOptions);
        }
      },
      {
        name: 'toSVGImage',
        title: 'download plot as svg',
        icon: Plotly.Icons.download_svg,
        format: 'svg',
        click: function (gd) {
          const toSvgImageButtonOptions = gd._context.toImageButtonOptions;
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

  smallScreenLayout = {
    font: { size: '10' },
    'margin.l': '46',
    width: '409',
    height: '300'
  };

  mediumSmallScreenLayout = {
    font: { size: '10' },
    'margin.l': '79.5',
    width: '590',
    height: '340'
  };

  mediumScreenDataStyle = {
    'marker.size': '3',
    'marker.line.width': '0.5',
  };
  mediumScreenLayout = {
    font: { size: '10.5' },
    'margin.l': '79',
    width: '768',
    height: '400'
  };

  mediumLargeScreenDataStyle = {
    'marker.size': '4',
    'marker.line.width': '0.75',
  };
  mediumLargeScreenLayout = {
    font: { size: '11' },
    'margin.l': '65',
    width: '519',
    height: '380'
  };

  defaultScreenDataStyle = {
    'marker.size': '6',
    'marker.line.width': '1',
  };
  defaultScreenLayout = {
    font: { size: '12' },
    'margin.l': '65',
    width: '601',
    height: '400',
  };


  private TCSDPlotSubscription: Subscription;
  @Output() TCSDPlotAvailability: EventEmitter<any> = new EventEmitter();
  @Input() mouseInfo: Object;
  constructor(public mousePlotsService: MousePlotsService) { }

  @ViewChild('trialCountsSessionDurationPlot') el: ElementRef;
  @HostListener('window:resize', ['$event.target']) onresize(event) {
    this.newScreenWidth = event.innerWidth;

    const responsiveTCSDplot = this.d3.select(this.el.nativeElement).node();
    if (this.newScreenWidth < 420) { // 768 original breakpoint
      Plotly.update(responsiveTCSDplot, this.mediumScreenDataStyle, this.smallScreenLayout);
    } else if (this.newScreenWidth < 768 && (this.newScreenWidth > 420 || this.newScreenWidth === 420)) {
      Plotly.update(responsiveTCSDplot, this.mediumScreenDataStyle, this.mediumSmallScreenLayout);
    } else if (this.newScreenWidth < 1024 && (this.newScreenWidth > 768 || this.newScreenWidth === 768)) {
      Plotly.update(responsiveTCSDplot, this.mediumScreenDataStyle, this.mediumScreenLayout);
    } else if (this.newScreenWidth < 1440 && (this.newScreenWidth > 1024 || this.newScreenWidth === 1024)) {
      Plotly.update(responsiveTCSDplot, this.mediumLargeScreenDataStyle, this.mediumLargeScreenLayout);
    } else {
      Plotly.update(responsiveTCSDplot, this.defaultScreenDataStyle, this.defaultScreenLayout);
    }
  }
  ngOnInit() {
    const screenSizeInitial = window.innerWidth;
    const element = this.el.nativeElement;
    this.mousePlotsService.getTCSessionDurationPlot({'subject_uuid': this.mouseInfo['subject_uuid']});
    this.TCSDPlotSubscription = this.mousePlotsService.getTCSessionDurationPlotLoadedListener()
      .subscribe((plotInfo: any) => {
        // getting the newest plot entry
        if (plotInfo && plotInfo[0]) {
          const toPlot = plotInfo[Object.entries(plotInfo).length - 1];
          const TCSDplot = toPlot['trial_counts_session_duration'];
          this.dataLen = TCSDplot['data'].length;
          TCSDplot['layout']['legend'] = {
            orientation: 'h',
            x: '0.00',
            y: '-0.09',
            font: {size: '10.5'}
          };
          TCSDplot['layout']['plot_bgcolor'] = 'rgba(0, 0, 0, 0)';
          TCSDplot['layout']['paper_bgcolor'] = 'rgba(0, 0, 0, 0)';
          TCSDplot['layout']['modebar'] = { bgcolor: 'rgba(255, 255, 255, 0)' };
          this.mediumScreenDataStyle['line.width'] = [];
          this.mediumLargeScreenDataStyle['line.width'] = [];
          this.defaultScreenDataStyle['line.width'] = [];
          for (const datum of TCSDplot['data']) {
            if (datum['name'] === 'Mondays') {
              // setting different line width but only affecting the Monday lines in the middle
              // hiding tooltip hover text for Monday lines, as well as the y value for the date(x) reference lines
              datum['hoverinfo'] = 'skip';
              this.mediumScreenDataStyle['line.width'].push('0.25');
              this.mediumLargeScreenDataStyle['line.width'].push('0.35');
              this.defaultScreenDataStyle['line.width'].push('0.5');
            } else if (datum['name'] === 'first day got trained' || datum['name'] === 'first day got biased') {
              datum['hoverinfo'] = 'x';
              this.mediumScreenDataStyle['line.width'].push('1');
              this.mediumLargeScreenDataStyle['line.width'].push('1.5');
              this.defaultScreenDataStyle['line.width'].push('2');
            } else {
              this.mediumScreenDataStyle['line.width'].push('1');
              this.mediumLargeScreenDataStyle['line.width'].push('1.5');
              this.defaultScreenDataStyle['line.width'].push('2');
            }
          }

          this.TCSDPlotIsAvailable = true;
          this.TCSDPlotAvailability.emit(this.TCSDPlotIsAvailable);
          this.loading = false;
          this.plotConfig['toImageButtonOptions']['filename'] = this.mouseInfo['subject_nickname'] + '_trial_counts_session_duration_plot';
          Plotly.newPlot(element, TCSDplot['data'], TCSDplot['layout'], this.plotConfig);
          if (screenSizeInitial < 420) {
            Plotly.update(element, this.mediumScreenDataStyle, this.smallScreenLayout);
          } else if (screenSizeInitial < 768 && (screenSizeInitial > 420 || screenSizeInitial === 420)) {
            Plotly.update(element, this.mediumScreenDataStyle, this.mediumSmallScreenLayout);
          } else if (screenSizeInitial < 1024 && (screenSizeInitial > 768 || screenSizeInitial === 768)) {
            Plotly.update(element, this.mediumScreenDataStyle, this.mediumScreenLayout);
          } else if (screenSizeInitial < 1440 && (screenSizeInitial > 1024 || screenSizeInitial === 1024)) {
            Plotly.update(element, this.mediumLargeScreenDataStyle, this.mediumLargeScreenLayout);
          } else {
            Plotly.update(element, this.defaultScreenDataStyle, this.defaultScreenLayout);
          }
        } else {
          // console.log('trial counts session duration plot unavailable for this mouse');
          this.TCSDPlotIsAvailable = false;
          this.loading = false;
          this.TCSDPlotAvailability.emit(this.TCSDPlotIsAvailable);
        }
      });
  }
  ngOnDestroy() {
    if (this.TCSDPlotSubscription) {
      this.TCSDPlotSubscription.unsubscribe();
    }
  }
}
