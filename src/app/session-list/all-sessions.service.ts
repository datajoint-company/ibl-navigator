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
  private newSessionsLoaded = new Subject();

  constructor(private http: HttpClient) { }

  getAllSessions() {
    this.http.get(`http://localhost:3000/api/sessions`)
      .subscribe((allSessionsData) => {
        this.allSessions = allSessionsData;
        console.log(this.allSessions);
        this.sessionsLoaded.next(this.allSessions);
      });
  }

  retrieveSessions(sessionsFilter) {
    console.log('POSTing for:', sessionsFilter);
    this.http.post(`http://localhost:3000/api/sessions/`, sessionsFilter, { responseType: 'json' })
      .subscribe(
        (filteredSessionsData) => {
          this.retrievedSessions = filteredSessionsData;
          console.log('retrievedSessions data are: ');
          console.log(this.retrievedSessions);
          this.newSessionsLoaded.next(this.retrievedSessions);
        },
        (err: any) => {
          console.log('err in http.post subscription - sending back  data anyways');
          console.log(err);
          this.newSessionsLoaded.next(this.retrievedSessions);
        }
      );
  }

  getSessionsLoadedListener() {
    return this.sessionsLoaded.asObservable();
  }

  getNewSessionsLoadedListener() {
    return this.newSessionsLoaded.asObservable();
  }
}


