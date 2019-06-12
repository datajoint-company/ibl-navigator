import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

const BACKEND_API_URL = environment.api_url;
@Injectable({
  providedIn: 'root'
})
export class AllMiceService {
  private miceMenu;
  private allMice;
  private retrievedMice;

  private miceMenuLoaded = new Subject();
  private miceLoaded = new Subject();
  private requestedMiceLoaded = new Subject();

  constructor(private http: HttpClient) { }

  getAllMice() {
    this.http.get(BACKEND_API_URL + `/mice`)
      .subscribe((allMiceData) => {
        this.allMice = allMiceData;
        this.miceLoaded.next(this.allMice);
      });
  }

  getMiceMenu(miceFilter) {
    // console.log('Requesting menu for:', miceFilter);
    this.http.post(BACKEND_API_URL + `/mice/`, miceFilter)
      .subscribe(
        (filteredMiceData) => {
          this.miceMenu = filteredMiceData;
          this.miceMenuLoaded.next(this.miceMenu);
        },
        (err: any) => {
          console.log('error in fetching mice menu');
          console.error(err);
        }
      );
  }
  retrieveMice(miceFilter) {
    // console.log('POSTing for:', miceFilter);
    this.http.post(BACKEND_API_URL + `/mice/`, miceFilter)
      .subscribe(
        (filteredMiceData) => {
          this.retrievedMice = filteredMiceData;
          this.requestedMiceLoaded.next(this.retrievedMice);
        },
        (err: any) => {
          console.log('err in fetching requested mice');
          console.error(err);
        }
      );
  }


  getMiceMenuLoadedListener() {
    return this.miceMenuLoaded.asObservable();
  }

  getMiceLoadedListener() {
    return this.miceLoaded.asObservable();
  }

  getRequestedMiceLoadedListener() {
    return this.requestedMiceLoaded.asObservable();
  }
}
