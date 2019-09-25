import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

const BACKEND_API_URL = environment.backend_url;
@Injectable({
  providedIn: 'root'
})
export class MousePlotsService {
  private weightWaterIntake;
  private TCSessionDuration;
  private performanceRT;
  private contrastHeatmap;
  // private fitPars;

  private waterWeightPlotLoaded = new Subject();
  private TCSessionDurationPlotLoaded = new Subject();
  private performanceRTPlotLoaded = new Subject();
  private contrastHeatmapPlotLoaded = new Subject();
  private fitParPlotsLoaded = new Subject();
  private datePsychPlotLoaded = new Subject();
  private dateRTContrastPlotLoaded = new Subject();
  private dateRTTrialPlotLoaded = new Subject();
  private animationPCplotLoaded = new Subject();

  constructor(private http: HttpClient) { }

  getWaterWeightPlot(subjectInfo) {
    this.http.post(BACKEND_API_URL + `/plot/waterWeightPlot`, subjectInfo)
      .subscribe(
        (plotData) => {
          this.weightWaterIntake = plotData;

          this.waterWeightPlotLoaded.next(this.weightWaterIntake);
        },
        (err: any) => {
          // console.log('error in retrieving weight & waterIntake plot data');
          console.error(err);
        }
      );
  }
  getTCSessionDurationPlot(subjectInfo) {
    this.http.post(BACKEND_API_URL + `/plot/trialCountsSessionDurationPlot`, subjectInfo)
      .subscribe(
        (plotData) => {
          this.TCSessionDuration = plotData;

          this.TCSessionDurationPlotLoaded.next(this.TCSessionDuration);
        },
        (err: any) => {
          // console.log('error in retrieving trial counts session duration plot data');
          console.error(err);
        }
      );
  }
  getPerformaceRTPlot(subjectInfo) {
    this.http.post(BACKEND_API_URL + `/plot/performanceReactionTimePlot`, subjectInfo)
      .subscribe(
        (plotData) => {
          this.performanceRT = plotData;

          this.performanceRTPlotLoaded.next(this.performanceRT);
        },
        (err: any) => {
          // console.log('error in retrieving performance reaction time plot data');
          console.error(err);
        }
      );
  }
  getContrastHeatMapPlot(subjectInfo) {
    this.http.post(BACKEND_API_URL + `/plot/contrastHeatmapPlot`, subjectInfo)
      .subscribe(
        (plotData) => {
          this.contrastHeatmap = plotData;

          this.contrastHeatmapPlotLoaded.next(this.contrastHeatmap);
        },
        (err: any) => {
          // console.log('error in retrieving contrast heatmap plot data');
          console.error(err);
        }
      );
  }

  getFitParametersPlot(subjectInfo) {
    this.http.post(BACKEND_API_URL + `/plot/fitParametersPlot`, subjectInfo)
      .subscribe(
        (plotData) => {
          this.fitParPlotsLoaded.next(plotData);
        },
        (err: any) => {
          // console.log('error in retrieving fit parameters plot data');
          console.error(err);
        }
      );
  }

  getDatePsychPlot(subjectInfo) {
    this.http.post(BACKEND_API_URL + `/plot/datePsychCurvePlot`, subjectInfo)
      .subscribe(
        (plotData) => {
          this.datePsychPlotLoaded.next(plotData);
        },
        (err: any) => {
          // console.log('error in retrieving by date psychometric curve plot data');
          console.error(err);
        }
      );
  }

  getDateRTContrastPlot(subjectInfo) {
    this.http.post(BACKEND_API_URL + `/plot/dateReactionTimeContrastPlot`, subjectInfo)
      .subscribe(
        (plotData) => {
          this.dateRTContrastPlotLoaded.next(plotData);
        },
        (err: any) => {
          // console.log('error in retrieving by date reaction time contrast plot data');
          console.error(err);
        }
      );
  }

  getDateRTTrialNumPlot(subjectInfo) {
    this.http.post(BACKEND_API_URL + `/plot/dateReactionTimeTrialNumberPlot`, subjectInfo)
      .subscribe(
        (plotData) => {
          this.dateRTTrialPlotLoaded.next(plotData);
        },
        (err: any) => {
          // console.log('error in retrieving fit parameters plot data');
          console.error(err);
        }
      );
  }

  getAnimatedPCplot(subjectInfo) {
    this.http.post(BACKEND_API_URL + `/plot/session-psych-plotData`, subjectInfo)
      .subscribe(
        (plotData) => {
          this.animationPCplotLoaded.next(plotData);
        },
        (err: any) => {
          // console.log('error in retrieving psychometric curve plot data for animation');
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
  getFitParPlotsLoadedListener() {
    return this.fitParPlotsLoaded.asObservable();
  }
  getDatePsychPlotLoadedListener() {
    return this.datePsychPlotLoaded.asObservable();
  }
  getDateRTContrastPlotLoadedListener() {
    return this.dateRTContrastPlotLoaded.asObservable();
  }
  getDateRTTrialNumPlotLoadedListener() {
    return this.dateRTTrialPlotLoaded.asObservable();
  }
  getAnimatedPCplotLoadedListener() {
    return this.animationPCplotLoaded.asObservable();
  }
}
