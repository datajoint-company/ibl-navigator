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

  constructor(private http: HttpClient) { }

  getAllMice() {
    this.http.get(`http://localhost:3000/api/mice`)
      .subscribe((allMiceData) => {
        this.allMice = allMiceData;
        console.log(this.allMice);
        this.miceLoaded.next(this.allMice);
      });
  }

  retrieveMice(miceFilter) {
    console.log('POSTing for:', miceFilter);
    this.http.post(`http://localhost:3000/api/mice/`, miceFilter, { responseType: 'text' })
      .subscribe(
        (filteredMiceData) => {
          this.retrievedMice = filteredMiceData;
          console.log('plots (in service retrievePlot) are: ');
          console.log(this.retrievedMice);
          this.miceLoaded.next(this.retrievedMice);
        },
        (err: any) => {
          console.log('err in http.post subscription - sending back plot data anyways');
          console.log(err);
          this.miceLoaded.next(this.retrievedMice);
        }
      );
  }

  getMiceLoadedListener() {
    return this.miceLoaded.asObservable();
  }
}
