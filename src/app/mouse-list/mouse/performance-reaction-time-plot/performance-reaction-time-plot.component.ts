import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { MousePlotsService } from '../mouse-plots.service';

declare var Plotly: any;

@Component({
  selector: 'app-performance-reaction-time-plot',
  templateUrl: './performance-reaction-time-plot.component.html',
  styleUrls: ['./performance-reaction-time-plot.component.css']
})
export class PerformanceReactionTimePlotComponent implements OnInit, OnDestroy {
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

  private PRTPlotSubscription: Subscription;
  @Input('mouseInfo') mouseInfo: Object;
  @Output() PRPPlotAvailability: EventEmitter<any> = new EventEmitter();
  constructor(public mousePlotsService: MousePlotsService) { }

  @ViewChild('performanceReactionTimePlot') el: ElementRef;
  ngOnInit() {
    const element = this.el.nativeElement;
    this.mousePlotsService.getPerformaceRTPlot({'subject_uuid': this.mouseInfo['subject_uuid']});
    this.PRTPlotSubscription = this.mousePlotsService.getPerformanceRTPlotLoadedListener()
      .subscribe((plotInfo) => {
        if (plotInfo && plotInfo[0]) {
          const toPlot = plotInfo[Object.entries(plotInfo).length - 1];
          const performanceRTplot = toPlot['performance_reaction_time'];
          performanceRTplot['layout']['height'] = '';
          performanceRTplot['layout']['width'] = '';
          this.PRTPlotIsAvailable = true;
          this.PRPPlotAvailability.emit(this.PRTPlotIsAvailable);
          this.plotConfig['toImageButtonOptions']['filename'] = this.mouseInfo['subject_nickname'] + '_performance_RT_plot';
          Plotly.newPlot(element, performanceRTplot['data'], performanceRTplot['layout'], this.plotConfig);
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
