import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

const BACKEND_API_URL = environment.api_url;
@Injectable({
  providedIn: 'root'
})
export class DailySummaryService {
  private dailySummary: Array<Object>;
  private dailySummaryLoaded = new Subject();

  private dailySummaryMenu: Array<Object>;
  private dailySummaryMenuLoaded = new Subject();

  private dailySummaryPlots;
  private dailySummaryPlotsLoaded = new Subject();

  constructor(private http: HttpClient) { }

  getSummary(summaryFilter) {
    // console.log('fetching for full summary');
    // console.log('POSTing for:', summaryFilter);
    this.http.post(BACKEND_API_URL + `/summary/`, summaryFilter, { responseType: 'json' })
      .subscribe(
        (filteredSummaryData: Array<Object>) => {
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

  getSummaryMenu(summaryFilter) {
    // console.log('fetching for menu');
    this.dailySummaryMenu = [];
    this.http.post(BACKEND_API_URL + `/summary/`, summaryFilter, { responseType: 'json' })
      .subscribe(
        (filteredSummaryData: Array<Object>) => {
          // console.log('length of menu: ', Object.entries(filteredSummaryData).length);

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


