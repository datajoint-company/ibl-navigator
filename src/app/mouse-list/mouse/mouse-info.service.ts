import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MouseInfoService {
  private waterIntake;
  private weight;

  private waterIntakeLoaded = new Subject();
  private weightLoaded = new Subject();

  constructor(private http: HttpClient) { }

  getWaterIntake(subjectInfo) {
    this.http.post(`http://localhost:3000/api/plot/mouse-waterIntake-plotData`, subjectInfo, { responseType: 'json' })
      .subscribe(
        (plotData) => {
          this.waterIntake = plotData;

          this.waterIntakeLoaded.next(this.waterIntake);
        },
        (err: any) => {
          console.log('error in retrieving waterIntake plot data');
          console.error(err);
          this.waterIntakeLoaded.next(this.waterIntake);
        }
      );
  }

  getWeight(subjectInfo) {
    this.http.post(`http://localhost:3000/api/plot/mouse-weight-plotData`, subjectInfo, { responseType: 'json' })
      .subscribe(
        (plotData) => {
          this.weight = plotData;
          this.weightLoaded.next(this.weight);
        },
        (err: any) => {
          console.log('error in retrieving mouse weight plot data');
          console.error(err);
          this.weightLoaded.next(this.weight);
        }
      );
  }

  getWaterIntakeLoadedListener() {
    return this.waterIntakeLoaded.asObservable();
  }

  getWeightLoadedListener() {
    return this.weightLoaded.asObservable();
  }

}
