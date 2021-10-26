import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GithubApi } from './GithubApiInterface';
import { GithubIssue } from './GithubIssueInterface';

import { environment } from '../../environments/environment';


const BACKEND_API_URL = environment.backend_url;

@Injectable({
  providedIn: 'root'
})
export class AllSessionsService {
  private allSessions;
  private allSessionMenu;
  private sessionMenu;
  private retrievedSessions;
  private sessionMenuLoaded = new Subject();
  private allSessionMenuLoaded = new Subject();
  private sessionsLoaded = new Subject();
  private newSessionsLoaded = new Subject();

  private retrievedSessions2;
  private newSessionsLoaded2 = new Subject();

  private brainRegionTreeLoaded = new Subject();

  constructor(private http: HttpClient) { }

  /**
   * Function to fetch 
   * @param sessionFilters Object of filters
   * @returns Observable from http.post
   */
  fetchSessions(sessionFilters: any) {
    return this.http.post(BACKEND_API_URL + '/sessions/', sessionFilters, { responseType: 'json'})
  }

  getRepoIssues(body: Object): Observable<GithubApi> {
    const requestUrl = 'https://fakeservices.datajoint.io/api/sessions';
    

    return this.http.post<GithubApi>(requestUrl, body, { responseType: 'json' });
  }

  getAllSessions() {
    let start = new Date();
    this.http.get(BACKEND_API_URL + `/sessions`)
      .subscribe((allSessionsData) => {
        this.allSessions = allSessionsData;
        // console.log(this.allSessions);
        this.sessionsLoaded.next(this.allSessions);
      });
  }

  getAllSessionMenu(sessionsFilter) {
    // console.log('POSTing for:', sessionsFilter);
    this.http.post(BACKEND_API_URL + `/sessions/`, sessionsFilter, { responseType: 'json' })
      .subscribe(
        (filteredSessionsData) => {
          this.allSessionMenu = filteredSessionsData;
          // console.log('retrieved session menu data are: ');
          // console.log(this.sessionMenu);
          this.allSessionMenuLoaded.next(this.allSessionMenu);
        },
        (err: any) => {
          console.log('err in fetching requested menu');
          console.error(err);
        }
      );
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
    let start = new Date()
    this.http.post(BACKEND_API_URL + `/sessions/`, sessionsFilter, { responseType: 'json' })
      .subscribe(
        (filteredSessionsData) => {
          let end = new Date();
          // console.log(`It took ${Number(end) - Number(start)}ms to retrieve the session list information`)
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

  retrieveSessions2(sessionsFilter) {
    // console.log('POSTing for:', sessionsFilter);
    let start = new Date()
    this.http.post(BACKEND_API_URL + `/sessions/`, sessionsFilter, { responseType: 'json' })
      .subscribe(
        (filteredSessionsData) => {
          let end = new Date();
          // console.log(`It took ${Number(end) - Number(start)}ms to retrieve the session list information`)
          // console.log(filteredSessionsData);
          this.retrievedSessions2 = filteredSessionsData;
          // console.log('retrievedSessions data are: ');
          // console.log(this.retrievedSessions2);
          this.newSessionsLoaded2.next(this.retrievedSessions2);
        },
        (err: any) => {
          console.log('err in fetching requested sessions');
          console.error(err);
        }
      );
  }

  getBrainRegionTree() {
    this.http.get(BACKEND_API_URL + `/brainRegionTree`, { responseType: 'json' })
      .subscribe(
        (brainregions) => {
          // console.log('retrieved brain tree');
          // console.log(brainregions);
          // somehow there's a VOID region included in the tree but it's never going to be used so removing it here
          let brainTree = Object.values(brainregions).filter(function(value, index, arr) {return value.acronym != 'void';}) 

          // console.log('brainTree: ', brainTree)

          this.brainRegionTreeLoaded.next(brainTree);
        },
        (err: any) => {
          console.log('err in fetching brain region tree');
          console.error(err);
        }
      );
  }

  getSessionsLoadedListener() {
    return this.sessionsLoaded.asObservable();
  }

  getAllSessionMenuLoadedListener() {
    return this.allSessionMenuLoaded.asObservable();
  }

  getSessionMenuLoadedListener() {
    return this.sessionMenuLoaded.asObservable();
  }

  getNewSessionsLoadedListener() {
    return this.newSessionsLoaded.asObservable();
  }
  getNewSessionsLoadedListener2() {
    return this.newSessionsLoaded2.asObservable();
  }

  getBrainRegionTreeLoadedListener() {
    return this.brainRegionTreeLoaded.asObservable();
  }
}


