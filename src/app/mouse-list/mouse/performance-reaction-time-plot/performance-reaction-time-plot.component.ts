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
          console.log('performance reaction time plot retrieved');
          const performanceRTplot = plotInfo[0]['plotting_data'];
          performanceRTplot['layout']['height'] = '';
          performanceRTplot['layout']['width'] = '650';
          this.PRTPlotIsAvailable = true;
          this.PRPPlotAvailability.emit(this.PRTPlotIsAvailable);
          Plotly.newPlot(element, performanceRTplot['data'], performanceRTplot['layout'], {responsive: true});
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
