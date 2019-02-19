import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class PlotsService {
    private plots;
    private plotsUpdated = new Subject();

    constructor(private http: HttpClient) {}

    getPlots() {
        this.http.get('http://localhost:3000/api/plots/scatter/1')
        .subscribe((plotData) => {
            this.plots = plotData;
            // console.log('plots (in service) are: ');
            // console.log(this.plots);
            this.plotsUpdated.next(this.plots);
            // return this.plots;
        });
    }

    getPlotUpdateListener() {
        return this.plotsUpdated.asObservable();
    }
}
