import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { MousePlotsService } from '../mouse-plots.service';

declare var Plotly: any;

@Component({
  selector: 'app-performance-reaction-time-plot',
  templateUrl: './performance-reaction-time-plot.component.html',
  styleUrls: ['./performance-reaction-time-plot.component.css']
})
export class PerformanceReactionTimePlotComponent implements OnInit, OnDestroy {
  d3 = Plotly.d3;
  newScreenWidth;
  PRTPlotIsAvailable: boolean;
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

  smallScreenLayout = {
    font: { size: '10.5' },
    width: '',
    height: '330'
  };

  private PRTPlotSubscription: Subscription;
  @Input() mouseInfo: Object;
  @Output() PRPPlotAvailability: EventEmitter<any> = new EventEmitter();
  constructor(public mousePlotsService: MousePlotsService) { }

  @ViewChild('performanceReactionTimePlot') el: ElementRef;
  @HostListener('window:resize', ['$event.target']) onresize(event) {
    this.newScreenWidth = event.innerWidth;
    const responsivePRTplot = this.d3.select(this.el.nativeElement).node();
    if (this.newScreenWidth < 420) {
      Plotly.update(responsivePRTplot, this.mediumScreenDataStyle, this.smallScreenLayout);
    } else if (this.newScreenWidth < 876 && (this.newScreenWidth > 420 || this.newScreenWidth === 420)) {
      Plotly.update(responsivePRTplot, this.mediumScreenDataStyle, this.mediumSmallScreenLayout);
    } else if (this.newScreenWidth < 1024 && (this.newScreenWidth > 876 || this.newScreenWidth === 876)) {
      Plotly.update(responsivePRTplot, this.mediumScreenDataStyle, this.mediumScreenLayout);
    } else if (this.newScreenWidth < 1440 && (this.newScreenWidth > 1024 || this.newScreenWidth === 1024)) {
      Plotly.update(responsivePRTplot, this.mediumLargeScreenDataStyle, this.mediumLargeScreenLayout);
    } else {
      Plotly.update(responsivePRTplot, this.defaultScreenDataStyle, this.defaultScreenLayout);
    }
  }
  ngOnInit() {
    const screenSizeInitial = window.innerWidth;
    const element = this.el.nativeElement;
    this.mousePlotsService.getPerformaceRTPlot({'subject_uuid': this.mouseInfo['subject_uuid']});
    this.PRTPlotSubscription = this.mousePlotsService.getPerformanceRTPlotLoadedListener()
      .subscribe((plotInfo) => {
        if (plotInfo && plotInfo[0]) {
          const toPlot = plotInfo[Object.entries(plotInfo).length - 1];
          const performanceRTplot = toPlot['performance_reaction_time'];
          performanceRTplot['layout']['height'] = '';
          performanceRTplot['layout']['width'] = '';
          performanceRTplot['layout']['plot_bgcolor'] = 'rgba(0, 0, 0, 0)';
          performanceRTplot['layout']['paper_bgcolor'] = 'rgba(0, 0, 0, 0)';
          this.PRTPlotIsAvailable = true;
          this.PRPPlotAvailability.emit(this.PRTPlotIsAvailable);
          this.plotConfig['toImageButtonOptions']['filename'] = this.mouseInfo['subject_nickname'] + '_performance_RT_plot';
          Plotly.newPlot(element, performanceRTplot['data'], performanceRTplot['layout'], this.plotConfig);
          if (screenSizeInitial < 420) { // originally 768
            Plotly.update(element, this.mediumScreenDataStyle, this.smallScreenLayout);
          } else if (screenSizeInitial < 876 && (screenSizeInitial > 420 || screenSizeInitial === 420)) {
            Plotly.update(element, this.mediumScreenDataStyle, this.mediumSmallScreenLayout);
          } else if (screenSizeInitial < 1024 && (screenSizeInitial > 876 || screenSizeInitial === 876)) {
            Plotly.update(element, this.mediumScreenDataStyle, this.mediumScreenLayout);
          } else if (screenSizeInitial < 1440 && (screenSizeInitial > 1024 || screenSizeInitial === 1024)) {
            Plotly.update(element, this.mediumLargeScreenDataStyle, this.mediumLargeScreenLayout);
          }
        } else {
          console.log('performance reaction time plot not available');
          this.PRTPlotIsAvailable = false;
          this.PRPPlotAvailability.emit(this.PRTPlotIsAvailable);
        }
      });
  }

  ngOnDestroy() {
    if (this.PRTPlotSubscription) {
      this.PRTPlotSubscription.unsubscribe();
    }
  }

}
