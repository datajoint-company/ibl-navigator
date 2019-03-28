import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AllSessionsService {
  private allSessions;
  private retrievedSessions;
  private sessionsLoaded = new Subject();

  constructor(private http: HttpClient) { }

  getAllSessions() {
    this.http.get(`http://localhost:3000/api/sessions`)
      .subscribe((allSessionsData) => {
        this.allSessions = allSessionsData;
        console.log('plots (in service getPlots) are: ');
        console.log(this.allSessions);
        this.sessionsLoaded.next(this.allSessions);
      });
  }

  retrieveSessions(sessionsFilter) {
    console.log('POSTing for:', sessionsFilter);
    this.http.post(`http://localhost:3000/api/sessions/`, sessionsFilter, { responseType: 'text' })
      .subscribe(
        (filteredSessionsData) => {
          this.retrievedSessions = filteredSessionsData;
          console.log('plots (in service retrievePlot) are: ');
          console.log(this.retrievedSessions);
          this.sessionsLoaded.next(this.retrievedSessions);
        },
        (err: any) => {
          console.log('err in http.post subscription - sending back plot data anyways');
          console.log(err);
          this.sessionsLoaded.next(this.retrievedSessions);
        }
      );
  }

  getSessionsLoadedListener() {
    return this.sessionsLoaded.asObservable();
  }
}
