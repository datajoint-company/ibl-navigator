import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { MousePlotsService } from '../mouse-plots.service';

declare var Plotly: any;

@Component({
  selector: 'app-trial-counts-session-duration',
  templateUrl: './trial-counts-session-duration.component.html',
  styleUrls: ['./trial-counts-session-duration.component.css']
})
export class TrialCountsSessionDurationComponent implements OnInit, OnDestroy {
  TCSDPlotIsAvailable: boolean;
  loading = true;
  private TCSDPlotSubscription: Subscription;
  @Output() TCSDPlotAvailability: EventEmitter<any> = new EventEmitter();
  @Input('mouseInfo') mouseInfo: Object;
  constructor(public mousePlotsService: MousePlotsService) { }

  @ViewChild('trialCountsSessionDurationPlot') el: ElementRef;
  ngOnInit() {
    const element = this.el.nativeElement;
    this.mousePlotsService.getTCSessionDurationPlot({'subject_uuid': this.mouseInfo['subject_uuid']});
    this.TCSDPlotSubscription = this.mousePlotsService.getTCSessionDurationPlotLoadedListener()
      .subscribe((plotInfo: any) => {
        // one plot per subject with daily updated plot points
        if (plotInfo && plotInfo[0]) {
          console.log('trial counts session duration plot retrieved');
          const TCSDplot = plotInfo[0]['plotting_data'];
          TCSDplot['layout']['height'] = '';
          TCSDplot['layout']['width'] = '';
          this.TCSDPlotIsAvailable = true;
          this.TCSDPlotAvailability.emit(this.TCSDPlotIsAvailable);
          this.loading = false;
          Plotly.newPlot(element, TCSDplot['data'], TCSDplot['layout'], { responsive: true });
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
