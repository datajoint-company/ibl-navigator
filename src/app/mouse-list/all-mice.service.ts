import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AllMiceService {
  private allMice;
  private retrievedMice;
  private miceLoaded = new Subject();
  private requestedMiceLoaded = new Subject();

  constructor(private http: HttpClient) { }

  getAllMice() {
    this.http.get(`http://localhost:3000/api/mice`)
      .subscribe((allMiceData) => {
        this.allMice = allMiceData;
        console.log(this.allMice);
        this.miceLoaded.next(this.allMice);
      });
  }

  // getAllMice() {
  //   console.log('sending GET request directly to flask api');
  //   this.http.get(`http://localhost:5000/v0/subject/`)
  //     .subscribe((allMiceData) => {
  //       this.allMice = allMiceData;
  //       console.log(this.allMice);
  //       this.miceLoaded.next(this.allMice);
  //     });
  // }

  retrieveMice(miceFilter) {
    console.log('POSTing for:', miceFilter);
    this.http.post(`http://localhost:3000/api/mice/`, miceFilter)
      .subscribe(
        (filteredMiceData) => {
          this.retrievedMice = filteredMiceData;
          console.log(this.retrievedMice);
          this.requestedMiceLoaded.next(this.retrievedMice);
        },
        (err: any) => {
          console.log('err in http.post subscription - sending back data anyways');
          console.log(err);
          this.requestedMiceLoaded.next(this.retrievedMice);
        }
      );
  }

  // retrieveMice(miceFilter) {
  //   console.log('POSTing directly to Flask side for:', miceFilter);
  //   this.http.post(`http://localhost:5000/v0/subject/`, miceFilter, { headers: { 'Content-Type': 'application/json' }})
  //     .subscribe(
  //       (filteredMiceData) => {
  //         this.retrievedMice = filteredMiceData;
  //         console.log(this.retrievedMice);
  //         this.requestedMiceLoaded.next(this.retrievedMice);
  //       },
  //       (err: any) => {
  //         console.log('err in http.post subscription - sending back data anyways');
  //         console.log(err);
  //       }
  //     );
  // }

  getMiceLoadedListener() {
    return this.miceLoaded.asObservable();
  }

  getRequestedMiceLoadedListener() {
    return this.requestedMiceLoaded.asObservable();
  }
}