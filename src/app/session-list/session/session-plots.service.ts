import { Injectable } from '@angular/core';
import { Subject} from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SessionPlotsService {
  private sessionPsychPlot;

  private sessionPsychPlotLoaded = new Subject();

  constructor(private http: HttpClient) { }

  getSessionPsychPlot(sessionInfo) {
    this.http.post('http://localhost:3000/api/plot/session-psych-plotData', sessionInfo )
      .subscribe(
        (plotData) => {
          this.sessionPsychPlot = plotData;
          this.sessionPsychPlotLoaded.next(this.sessionPsychPlot);
        },
        (err: any) => {
          console.log('error in retrieving session psych plot');
          console.error(err);
        }
      );
  }

  getSessionPsychPlotLoadedListener() {
    return this.sessionPsychPlotLoaded.asObservable();
  }

}
