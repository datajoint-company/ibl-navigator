import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input } from '@angular/core';
import { MouseInfoService } from '../mouse-info.service';
import { Subscription } from 'rxjs';

declare var Plotly: any;

@Component({
  selector: 'app-water-weight-plot',
  templateUrl: './water-weight-plot.component.html',
  styleUrls: ['./water-weight-plot.component.css']
})
export class WaterWeightPlotComponent implements OnInit, OnDestroy {
  plotInfo = {};
  plotData = [];
  private mouseWeightSubscription: Subscription;
  private mouseWaterIntakeSubscription: Subscription;

  @Input('mouseInfo') mouseInfo: Object;
  constructor(public mouseInfoService: MouseInfoService) { }

  @ViewChild('waterIntake_weight_plot') el: ElementRef;

  ngOnInit() {
    const element = this.el.nativeElement;
    console.log('mouseINfo is');
    console.log(this.mouseInfo);
    const subjectInfo = { 'lab_name': this.mouseInfo['lab_name'], 'subject_nickname': this.mouseInfo['subject_nickname'] };
    this.mouseInfoService.getWeight(subjectInfo);
    this.mouseWeightSubscription = this.mouseInfoService.getWeightLoadedListener()
     .subscribe((weightInfo: any) => {
        const weightPlot = {x: [], y: [], type: 'scatter', name: 'Weight', yaxis: 'y2'};
        for (const perWeigh of weightInfo) {
          weightPlot.x.push(perWeigh.weighing_time);
          weightPlot.y.push(perWeigh.weight);
        }
        this.plotData.push(weightPlot);

       this.mouseInfoService.getWaterIntake(subjectInfo);
       this.mouseWaterIntakeSubscription = this.mouseInfoService.getWaterIntakeLoadedListener()
         .subscribe((waterIntakeInfo: any) => {
           const waterTypes = [];
           const waterIntakePlots = {};
           for (const perWI of waterIntakeInfo) {
             if (!waterTypes.includes(perWI.watertype_name)) {
               waterTypes.push(perWI.watertype_name);
             }
           }
           for (const waterType of waterTypes) {
             const wt = waterType.replace(/\s/g, '');
             waterIntakePlots[`${wt}Plot`] = { x: [], y: [], type: 'bar', name: waterType, yaxis: 'y1' };
             for (const perWaterIntake of waterIntakeInfo) {
               if (perWaterIntake.watertype_name === waterType) {
                 waterIntakePlots[`${wt}Plot`]['x'].push(perWaterIntake.administration_time);
                 waterIntakePlots[`${wt}Plot`]['y'].push(perWaterIntake.water_administered);
               }
             }
           }
           console.log('waterIntakePlots: ');
           console.log(waterIntakePlots);
           const WIplotList = Object.values(waterIntakePlots);
           for (const WIplot of WIplotList) {
             this.plotData.push(WIplot);
           }
           console.log('plotData after waterIntakeData is: ');
           console.log(this.plotData);

           this.plotInfo['data'] = this.plotData;
           this.plotInfo['layout'] = {
             'barmode': 'stack',
             'yaxis': {
               'title': 'Water intake (mL)'
             },
             'yaxis2': {
               'title': 'Weight (g)',
               'overlaying': 'y',
               'side': 'right'
             }
           };
           console.log(this.plotInfo);
           Plotly.newPlot(element, this.plotInfo['data'], this.plotInfo['layout']);
         });

     });
  }

  ngOnDestroy() {
    if (this.mouseWeightSubscription) {
      this.mouseWeightSubscription.unsubscribe();
    }
    if (this.mouseWaterIntakeSubscription) {
      this.mouseWaterIntakeSubscription.unsubscribe();
    }
  }

}
