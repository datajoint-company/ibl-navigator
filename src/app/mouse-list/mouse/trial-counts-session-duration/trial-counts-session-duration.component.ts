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
  TCSDPlotIsAvailable: boolean;
  loading = true;
  plotConfig = {
    responsive: true,
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
          var toPngImageButtonOptions = gd._context.toImageButtonOptions;
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
    marker: [
      { size: '3', color: 'black' },
      { size: '3', color: 'red' },
    ],
    line: [
      { width: '1' },
      { width: '1' }
    ]
  };
  mediumScreenLayout = {
    font: { size: '10' },
    width: '460',
    height: '390'
  };

  mediumSmallScreenLayout = {
    font: { size: '10' },
    width: '400',
    height: '340'
  };

  mediumLargeScreenDataStyle = {
    marker: [
      { size: '4', color: 'black' },
      { size: '4', color: 'red' },
    ],
    line: [
      { width: '1.5' },
      { width: '1.5' }
    ]
  };
  mediumLargeScreenLayout = {
    font: { size: '11' },
    width: '500',
    height: '420'
  };

  defaultScreenDataStyle = {
    marker: [
      { size: '6', color: 'black' },
      { size: '6', color: 'red' }],
    line: [
      { width: '2' },
      { width: '2' }
    ]
  };
  defaultScreenLayout = {
    font: { size: '12' },
    width: '',
    height: ''
  };

  private TCSDPlotSubscription: Subscription;
  @Output() TCSDPlotAvailability: EventEmitter<any> = new EventEmitter();
  @Input() mouseInfo: Object;
  constructor(public mousePlotsService: MousePlotsService) { }

  @ViewChild('trialCountsSessionDurationPlot') el: ElementRef;
  @HostListener('window:resize', ['$event.target']) onresize(event) {
    this.newScreenWidth = event.innerWidth;

    const responsiveTCSDplot = this.d3.select(this.el.nativeElement).node();
    if (this.newScreenWidth < 768) {
      Plotly.update(responsiveTCSDplot, this.defaultScreenDataStyle, this.defaultScreenLayout);
    } else if (this.newScreenWidth < 876 && (this.newScreenWidth > 768 || this.newScreenWidth === 768)) {
      Plotly.update(responsiveTCSDplot, this.mediumScreenDataStyle, this.mediumSmallScreenLayout);
    } else if (this.newScreenWidth < 1024 && (this.newScreenWidth > 876 || this.newScreenWidth === 876)) {
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
          TCSDplot['layout']['height'] = '';
          TCSDplot['layout']['width'] = '';
          this.TCSDPlotIsAvailable = true;
          this.TCSDPlotAvailability.emit(this.TCSDPlotIsAvailable);
          this.loading = false;
          this.plotConfig['toImageButtonOptions']['filename'] = this.mouseInfo['subject_nickname'] + '_trial_counts_session_duration_plot';
          Plotly.newPlot(element, TCSDplot['data'], TCSDplot['layout'], this.plotConfig);
          if (screenSizeInitial < 768) {
            Plotly.update(element, this.defaultScreenDataStyle, this.defaultScreenLayout);
          } else if (screenSizeInitial < 876 && (screenSizeInitial > 768 || screenSizeInitial === 768)) {
            Plotly.update(element, this.mediumScreenDataStyle, this.mediumSmallScreenLayout);
          } else if (screenSizeInitial < 1024 && (screenSizeInitial > 876 || screenSizeInitial === 876)) {
            Plotly.update(element, this.mediumScreenDataStyle, this.mediumScreenLayout);
          } else if (screenSizeInitial < 1440 && (screenSizeInitial > 1024 || screenSizeInitial === 1024)) {
            Plotly.update(element, this.mediumLargeScreenDataStyle, this.mediumLargeScreenLayout);
          }
        } else {
          console.log('trial counts session duration plot unavailable for this mouse');
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
