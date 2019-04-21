import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input } from '@angular/core';
import { MousePlotsService } from '../mouse-plots.service';
import { Subscription } from 'rxjs';

declare var Plotly: any;

@Component({
  selector: 'app-water-weight-plot',
  templateUrl: './water-weight-plot.component.html',
  styleUrls: ['./water-weight-plot.component.css']
})
export class WaterWeightPlotComponent implements OnInit, OnDestroy {
  private mouseWaterWeightSubscription: Subscription;

  @Input('mouseInfo') mouseInfo: Object;
  constructor(public mousePlotsService: MousePlotsService) { }

  @ViewChild('waterIntake_weight_plot') el: ElementRef;

  ngOnInit() {
    const element = this.el.nativeElement;
    console.log('mouseINfo is');
    console.log(this.mouseInfo);
    const subjectInfo = { 'subject_uuid': this.mouseInfo['subject_uuid'] };
    console.log(subjectInfo);
    this.mousePlotsService.getWaterWeightPlot(subjectInfo);
    this.mouseWaterWeightSubscription = this.mousePlotsService.getWaterWeightPlotLoadedListener()
      .subscribe((plotsInfo: any) => {
        if (plotsInfo && plotsInfo[0]) {
          console.log('water weight plot retrieved');
          console.log(plotsInfo);
          const WIWplot = plotsInfo[0]['plotting_data'];
          WIWplot['layout']['height'] = '';
          WIWplot['layout']['width'] = '';
          for (const item of WIWplot['data']) {
            if (item['type'] === 'bar') {
              console.log('inside WIWplot bar - logging item');
              console.log(item);
              // item['width'] = 1;
              // item['marker'] = { line: {width: 0.9}};
            } else {
              console.log('inside WIWplot not a bar plot- logging item');
              console.log(item);
            }
          }
          Plotly.newPlot(element, WIWplot['data'], WIWplot['layout'], {responsive: true});
        } else {
          console.log('plot data missing...?');
        }
      });

  }

  ngOnDestroy() {
    if (this.mouseWaterWeightSubscription) {
      this.mouseWaterWeightSubscription.unsubscribe();
    }
  }

}
