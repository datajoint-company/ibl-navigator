import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { DailySummaryService } from '../daily-summary.service';

declare var Plotly: any;
@Component({
  selector: 'app-summary-plots',
  templateUrl: './summary-plots.component.html',
  styleUrls: ['./summary-plots.component.css']
})
export class SummaryPlotsComponent implements OnInit {
  @Input('mouseInfo') mouseInfo: Object;
  constructor(public dailySummaryService: DailySummaryService) { }

  @ViewChild('waterWeightPlot') WWIplot: ElementRef;
  @ViewChild('trialCountsSessionDurationPlot') TCSDplot: ElementRef;
  @ViewChild('performanceReactionTimePlot') PRTplot: ElementRef;
  @ViewChild('contrastHeatmapPlot') CHplot: ElementRef;
  ngOnInit() {
    const WWIplotElem = this.WWIplot.nativeElement;
    const TCSDplotElem = this.TCSDplot.nativeElement;
    const PRTplotElem = this.PRTplot.nativeElement;
    const CHplotElem = this.CHplot.nativeElement;
    this.dailySummaryService.getSummaryPlots({'subject_uuid': this.mouseInfo['subject_uuid']});
    this.dailySummaryService.getSummaryPlotsLoadedListener()
      .subscribe((plotsInfo: any) => {
        if (plotsInfo && plotsInfo[0]) {
          console.log('printing daily summary plotsInfo for', plotsInfo[0]['subject_uuid']);
          const WWIplotInfo = plotsInfo[0]['water_weight'];
          const TCSDplotInfo = plotsInfo[0]['trial_counts_session_duration'];
          const PRTplotInfo = plotsInfo[0]['performance_reaction_time'];
          const CHplotInfo = plotsInfo[0]['contrast_heatmap'];
          Plotly.newPlot(WWIplotElem, WWIplotInfo['data'], WWIplotInfo['layout']);
          Plotly.newPlot(TCSDplotElem, TCSDplotInfo['data'], TCSDplotInfo['layout']);
          Plotly.newPlot(PRTplotElem, PRTplotInfo['data'], PRTplotInfo['layout']);
          Plotly.newPlot(CHplotElem, CHplotInfo['data'], CHplotInfo['layout']);
        } else {
          console.log('trouble loading daily summary info for:', plotsInfo);
        }
      });
  }

}
