import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

const BACKEND_API_URL = environment.api_url;

@Injectable({
  providedIn: 'root'
})
export class AllSessionsService {
  private allSessions;
  private sessionMenu;
  private retrievedSessions;
  private sessionMenuLoaded = new Subject();
  private sessionsLoaded = new Subject();
  private newSessionsLoaded = new Subject();

  constructor(private http: HttpClient) { }

  getAllSessions() {
    this.http.get(BACKEND_API_URL + `/sessions`)
      .subscribe((allSessionsData) => {
        this.allSessions = allSessionsData;
        // console.log(this.allSessions);
        this.sessionsLoaded.next(this.allSessions);
      });
  }

  getSessionMenu(sessionsFilter) {
    // console.log('POSTing for:', sessionsFilter);
    this.http.post(BACKEND_API_URL + `/sessions/`, sessionsFilter, { responseType: 'json' })
      .subscribe(
        (filteredSessionsData) => {
          this.sessionMenu = filteredSessionsData;
          // console.log('retrieved session menu data are: ');
          // console.log(this.sessionMenu);
          this.sessionMenuLoaded.next(this.sessionMenu);
        },
        (err: any) => {
          console.log('err in fetching requested menu');
          console.error(err);
        }
      );
  }

  retrieveSessions(sessionsFilter) {
    // console.log('POSTing for:', sessionsFilter);
    this.http.post(BACKEND_API_URL + `/sessions/`, sessionsFilter, { responseType: 'json' })
      .subscribe(
        (filteredSessionsData) => {
          this.retrievedSessions = filteredSessionsData;
          // console.log('retrievedSessions data are: ');
          // console.log(this.retrievedSessions);
          this.newSessionsLoaded.next(this.retrievedSessions);
        },
        (err: any) => {
          console.log('err in fetching requested sessions');
          console.error(err);
        }
      );
  }

  getSessionsLoadedListener() {
    return this.sessionsLoaded.asObservable();
  }

  getSessionMenuLoadedListener() {
    return this.sessionMenuLoaded.asObservable();
  }

  getNewSessionsLoadedListener() {
    return this.newSessionsLoaded.asObservable();
  }
}


