import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

const BACKEND_API_URL = environment.backend_url;
@Injectable({
  providedIn: 'root'
})
export class DailySummaryService {
  private dailySummary: Array<Object>;
  private dailySummaryLoaded = new Subject();

  private dailySummary2: Array<Object>;
  private dailySummary2Loaded = new Subject();

  private dailySummaryAllMenu: Array<Object>;
  private dailySummaryAllMenuLoaded = new Subject();

  private dailySummaryMenu: Array<Object>;
  private dailySummaryMenuLoaded = new Subject();

  private dailySummaryPlots;
  private dailySummaryPlotsLoaded = new Subject();

  constructor(private http: HttpClient) { }

  getSummary(summaryFilter) {
    // console.log('fetching for full summary');
    // console.log('POSTing for:', summaryFilter);
    let start = new Date();
    this.http.post(BACKEND_API_URL + `/summary/`, summaryFilter, { responseType: 'json' })
      .subscribe(
        (filteredSummaryData: Array<Object>) => {
          let end = new Date();
          // console.log(`It took ${Number(end) - Number(start)}ms to retrieve the daily summary information`)
          // console.log('length of SummaryData: ', Object.entries(filteredSummaryData).length);
          this.dailySummary = filteredSummaryData;
          // console.log('dailySummary data are: ');
          // console.log(this.dailySummary);
          this.dailySummaryLoaded.next(this.dailySummary);
        },
        (err: any) => {
          console.log('err in http.post subscription');
          console.log(err);
        }
      );
  }

  getSummaryLoadedListener() {
    return this.dailySummaryLoaded.asObservable();
  }

  getSummary2(summaryFilter) {
    console.log('POSTing for:', summaryFilter);
    let start = new Date();
    this.http.post(BACKEND_API_URL + `/summary/`, summaryFilter, { responseType: 'json' })
      .subscribe(
        (filteredSummaryData: Array<Object>) => {
          let end = new Date();
          console.log(`It took ${Number(end) - Number(start)}ms to retrieve the filtered daily summary information`)
          this.dailySummary2 = filteredSummaryData;
          this.dailySummary2Loaded.next(this.dailySummary2);
        },
        (err: any) => {
          console.log('err in http.post subscription');
          console.log(err);
        }
      );
  }

  getSummary2LoadedListener() {
    return this.dailySummary2Loaded.asObservable();
  }

  getSummaryMenu(summaryFilter) {
    // console.log('fetching for menu');
    this.dailySummaryMenu = [];
    this.http.post(BACKEND_API_URL + `/summary/`, summaryFilter, { responseType: 'json' })
      .subscribe(
        (filteredSummaryData: Array<Object>) => {
          // console.log('subscribing to requested menu - length of menu: ', Object.entries(filteredSummaryData).length);

          this.dailySummaryMenu = filteredSummaryData;

          this.dailySummaryMenuLoaded.next(this.dailySummaryMenu);
        },
        (err: any) => {
          console.log('err in http.post subscription');
          console.log(err);
        }
      );
  }

  getSummaryMenuLoadedListener() {
    return this.dailySummaryMenuLoaded.asObservable();
  }


  getSummaryAllMenu(summaryFilter) {
    // console.log('fetching for menu');
    this.dailySummaryAllMenu = [];
    this.http.post(BACKEND_API_URL + `/summary/`, summaryFilter, { responseType: 'json' })
      .subscribe(
        (filteredSummaryData: Array<Object>) => {
          // console.log('subscribing to all summary: length of menu: ', Object.entries(filteredSummaryData).length);

          this.dailySummaryAllMenu = filteredSummaryData;

          this.dailySummaryAllMenuLoaded.next(this.dailySummaryAllMenu);
        },
        (err: any) => {
          console.log('err in http.post subscription');
          console.log(err);
        }
      );
  }

  getSummaryAllMenuLoadedListener() {
    return this.dailySummaryAllMenuLoaded.asObservable();
  }


  getSummaryPlots(summaryFilter) {
    // console.log('fetching for summary plots');
    this.http.post(BACKEND_API_URL + `/summary/`, summaryFilter, { responseType: 'json' })
      .subscribe(
        (filteredSummaryData) => {
          this.dailySummaryPlots = filteredSummaryData;
          // console.log('dailySummary data are: ');
          // console.log(this.dailySummaryPlots);
          this.dailySummaryPlotsLoaded.next(this.dailySummaryPlots);
        },
        (err: any) => {
          console.log('err in http.post subscription');
          console.log(err);
        }
      );
  }

  getSummaryPlotsLoadedListener() {
    return this.dailySummaryPlotsLoaded.asObservable();
  }
}


