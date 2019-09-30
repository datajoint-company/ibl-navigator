import { Injectable } from '@angular/core';
import { Subject} from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

const BACKEND_API_URL = environment.backend_url;

@Injectable({
  providedIn: 'root'
})
export class SessionPlotsService {
  private sessionPsychPlot;
  private sessionRTCPlot;
  private sessionRTTNPlot;

  private sessionPsychPlotLoaded = new Subject();
  private sessionRTCPlotLoaded = new Subject();
  private sessionRTTNPlotLoaded = new Subject();

  constructor(private http: HttpClient) { }

  getSessionPsychPlot(sessionInfo) {
    this.http.post(BACKEND_API_URL + '/plot/session-psych-plotData', sessionInfo )
      .subscribe(
        (plotData) => {
          this.sessionPsychPlot = plotData;
          this.sessionPsychPlotLoaded.next(this.sessionPsychPlot);
        },
        (err: any) => {
          // console.log('error in retrieving session psych plot');
          console.error(err);
        }
      );
  }

  getSessionRTCPlot(sessionInfo) {
    this.http.post(BACKEND_API_URL + '/plot/session-RTC-plotData', sessionInfo)
      .subscribe(
        (plotData) => {
          this.sessionRTCPlot = plotData;
          this.sessionRTCPlotLoaded.next(this.sessionRTCPlot);
        },
        (err: any) => {
          // console.log('error in retrieving session RTC plot');
          console.error(err);
        }
      );
  }

  getSessionRTTNPlot(sessionInfo) {
    this.http.post(BACKEND_API_URL + '/plot/session-RTTN-plotData', sessionInfo)
      .subscribe(
        (plotData) => {
          this.sessionRTTNPlot = plotData;
          this.sessionRTTNPlotLoaded.next(this.sessionRTTNPlot);
        },
        (err: any) => {
          // console.log('error in retrieving session RTTN plot');
          console.error(err);
        }
      );
  }

  getSessionPsychPlotLoadedListener() {
    return this.sessionPsychPlotLoaded.asObservable();
  }

  getSessionRTCPlotLoadedListener() {
    return this.sessionRTCPlotLoaded.asObservable();
  }

  getSessionRTTNPlotLoadedListener() {
    return this.sessionRTTNPlotLoaded.asObservable();
  }

}
