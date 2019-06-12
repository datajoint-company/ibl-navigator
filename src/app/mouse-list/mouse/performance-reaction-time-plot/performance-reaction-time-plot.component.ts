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
  dataLen: number;
  PRTPlotIsAvailable: boolean;
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
    'margin.l': '48',
    width: '418',
    height: '300'
  };

  mediumSmallScreenLayout = {
    font: { size: '10' },
    'margin.l': '82',
    height: '340',
    width: '600'
  };

  mediumScreenDataStyle = {
    'marker.size': '3',
    'marker.line.width': '0.5',
    // 'line.width': ['1', '1'].concat(Array(this.dataLen - 4).fill(0.275), ['1', '1'])

  };
  mediumScreenLayout = {
    font: { size: '10.5' },
    'margin.l': '84',
    width: '781',
    height: '400'
  };

  mediumLargeScreenDataStyle = {
    'marker.size': '4',
    'marker.line.width': '0.75',
  };
  mediumLargeScreenLayout = {
    font: { size: '11' },
    'margin.l': '70',
    width: '530',
    height: '380'
  };

  defaultScreenDataStyle = {
    'marker.size': '6',
    'marker.line.width': '1',
  };
  defaultScreenLayout = {
    font: { size: '12' },
    'margin.l': '70',
    width: '612',
    height: '400'
  };

  private PRTPlotSubscription: Subscription;
  @Input() mouseInfo: Object;
  @Output() PRPPlotAvailability: EventEmitter<any> = new EventEmitter();
  constructor(public mousePlotsService: MousePlotsService) { }

  @ViewChild('performanceReactionTimePlot') el: ElementRef;
  @HostListener('window:resize', ['$event.target']) onresize(event) {
    this.newScreenWidth = event.innerWidth;
    const responsivePRTplot = this.d3.select(this.el.nativeElement).node();
    if (this.dataLen > 4) {
      this.mediumScreenDataStyle['line.width'] = ['1', '1'].concat(Array(this.dataLen - 4).fill('0.25'), ['1', '1']);
      this.mediumLargeScreenDataStyle['line.width'] = ['1.5', '1.5'].concat(Array(this.dataLen - 4).fill('0.35'), ['1.5', '1.5']);
      this.defaultScreenDataStyle['line.width'] = ['2', '2'].concat(Array(this.dataLen - 4).fill('0.5'), ['2', '2']);
    }
    if (this.newScreenWidth < 420) {
      Plotly.update(responsivePRTplot, this.mediumScreenDataStyle, this.smallScreenLayout);
    } else if (this.newScreenWidth < 768 && (this.newScreenWidth > 420 || this.newScreenWidth === 420)) {
      Plotly.update(responsivePRTplot, this.mediumScreenDataStyle, this.mediumSmallScreenLayout);
    } else if (this.newScreenWidth < 1024 && (this.newScreenWidth > 768 || this.newScreenWidth === 768)) {
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
          this.dataLen = performanceRTplot['data'].length;
          performanceRTplot['layout']['legend'] = {
            orientation: 'h',
            x: '0',
            y: '-0.09',
            font: { size: '10.5' }
          };
          performanceRTplot['layout']['plot_bgcolor'] = 'rgba(0, 0, 0, 0)';
          performanceRTplot['layout']['paper_bgcolor'] = 'rgba(0, 0, 0, 0)';
          performanceRTplot['layout']['modebar'] = { bgcolor: 'rgba(255, 255, 255, 0)' };
          if (this.dataLen > 4) {
            this.mediumScreenDataStyle['line.width'] = ['1', '1'].concat(Array(this.dataLen - 4).fill('0.25'), ['1', '1']);
            this.mediumLargeScreenDataStyle['line.width'] = ['1.5', '1.5'].concat(Array(this.dataLen - 4).fill('0.35'), ['1.5', '1.5']);
            this.defaultScreenDataStyle['line.width'] = ['2', '2'].concat(Array(this.dataLen - 4).fill('0.5'), ['2', '2']);

          }
          this.PRTPlotIsAvailable = true;
          this.PRPPlotAvailability.emit(this.PRTPlotIsAvailable);
          this.plotConfig['toImageButtonOptions']['filename'] = this.mouseInfo['subject_nickname'] + '_performance_RT_plot';
          Plotly.newPlot(element, performanceRTplot['data'], performanceRTplot['layout'], this.plotConfig);
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
