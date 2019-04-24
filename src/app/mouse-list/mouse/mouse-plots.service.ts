import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MousePlotsService {
  private weightWaterIntake;
  private TCSessionDuration;
  private performanceRT;
  private contrastHeatmap;

  private waterWeightPlotLoaded = new Subject();
  private TCSessionDurationPlotLoaded = new Subject();
  private performanceRTPlotLoaded = new Subject();
  private contrastHeatmapPlotLoaded = new Subject();

  constructor(private http: HttpClient) { }

  getWaterWeightPlot(subjectInfo) {
    this.http.post(`http://localhost:3000/api/plot/waterWeightPlot`, subjectInfo)
      .subscribe(
        (plotData) => {
          this.weightWaterIntake = plotData;

          this.waterWeightPlotLoaded.next(this.weightWaterIntake);
        },
        (err: any) => {
          console.log('error in retrieving weight & waterIntake plot data');
          console.error(err);
        }
      );
  }
  getTCSessionDurationPlot(subjectInfo) {
    this.http.post(`http://localhost:3000/api/plot/trialCountsSessionDurationPlot`, subjectInfo)
      .subscribe(
        (plotData) => {
          this.TCSessionDuration = plotData;

          this.TCSessionDurationPlotLoaded.next(this.TCSessionDuration);
        },
        (err: any) => {
          console.log('error in retrieving trial counts session duration plot data');
          console.error(err);
        }
      );
  }
  getPerformaceRTPlot(subjectInfo) {
    this.http.post(`http://localhost:3000/api/plot/performanceReactionTimePlot`, subjectInfo)
      .subscribe(
        (plotData) => {
          this.performanceRT = plotData;

          this.performanceRTPlotLoaded.next(this.performanceRT);
        },
        (err: any) => {
          console.log('error in retrieving performance reaction time plot data');
          console.error(err);
        }
      );
  }
  getContrastHeatMapPlot(subjectInfo) {
    this.http.post(`http://localhost:3000/api/plot/contrastHeatmapPlot`, subjectInfo)
      .subscribe(
        (plotData) => {
          this.contrastHeatmap = plotData;

          this.contrastHeatmapPlotLoaded.next(this.contrastHeatmap);
        },
        (err: any) => {
          console.log('error in retrieving contrast heatmap plot data');
          console.error(err);
        }
      );
  }

  getWaterWeightPlotLoadedListener() {
    return this.waterWeightPlotLoaded.asObservable();
  }
  getTCSessionDurationPlotLoadedListener() {
    return this.TCSessionDurationPlotLoaded.asObservable();
  }
  getPerformanceRTPlotLoadedListener() {
    return this.performanceRTPlotLoaded.asObservable();
  }
  getContrastHeatmapPlotLoadedListener() {
    return this.contrastHeatmapPlotLoaded.asObservable();
  }
}
