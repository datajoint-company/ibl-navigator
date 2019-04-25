import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { MousePlotsService } from '../mouse-plots.service';

declare var Plotly: any;
@Component({
  selector: 'app-contrast-heatmap-plot',
  templateUrl: './contrast-heatmap-plot.component.html',
  styleUrls: ['./contrast-heatmap-plot.component.css']
})
export class ContrastHeatmapPlotComponent implements OnInit, OnDestroy {
  contrastHeatmapPlotIsAvailable: boolean;
  private contrastHeatmapPlotSubscription: Subscription;

  @Output() contrastHeatmapPlotAvailability: EventEmitter<any> = new EventEmitter();
  @Input('mouseInfo') mouseInfo: Object;
  @ViewChild('contrastHeatmapPlot') elem: ElementRef;
  constructor(public mousePlotsService: MousePlotsService) { }

  ngOnInit() {
    const element = this.elem.nativeElement;
    this.mousePlotsService.getContrastHeatMapPlot({'subject_uuid': this.mouseInfo['subject_uuid']});
    this.contrastHeatmapPlotSubscription = this.mousePlotsService.getContrastHeatmapPlotLoadedListener()
      .subscribe((plotInfo) => {
        if (plotInfo && plotInfo[0]) {
          const contrastHeatmapPlot = plotInfo[0]['plotting_data'];
          contrastHeatmapPlot['layout']['height'] = '';
          contrastHeatmapPlot['layout']['width'] = '';
          this.contrastHeatmapPlotIsAvailable = true;
          this.contrastHeatmapPlotAvailability.emit(this.contrastHeatmapPlotIsAvailable);
          Plotly.newPlot(element, contrastHeatmapPlot['data'], contrastHeatmapPlot['layout'], { responsive: true });
        } else {
          console.log('contrast heatmap plot unavailable');
          this.contrastHeatmapPlotIsAvailable = false;
          this.contrastHeatmapPlotAvailability.emit(this.contrastHeatmapPlotIsAvailable);
        }
      });
  }

  ngOnDestroy() {
    if (this.contrastHeatmapPlotSubscription) {
      this.contrastHeatmapPlotSubscription.unsubscribe();
    }
  }

}
