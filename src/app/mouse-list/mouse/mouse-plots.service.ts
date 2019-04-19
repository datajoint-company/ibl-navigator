import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MousePlotsService {
  private weightWaterIntake;

  private waterWeightPlotLoaded = new Subject();

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
          this.waterWeightPlotLoaded.next(this.weightWaterIntake);
        }
      );
  }


  getWaterWeightPlotLoadedListener() {
    return this.waterWeightPlotLoaded.asObservable();
  }
}
