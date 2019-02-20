import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class PlotsService {
    private plots;
    private plotsUpdated = new Subject();

    constructor(private http: HttpClient) {}

    getPlots(type, id) {
        this.http.get(`http://localhost:3000/api/plots/${ type }/${ id }`)
        .subscribe((plotData) => {
            this.plots = plotData;
            // console.log('plots (in service) are: ');
            // console.log(this.plots);
            this.plotsUpdated.next(this.plots);
        });
    }

    retrievePlot(plotInfo) {
        this.http.post(`http://localhost:3000/api/plot/`, plotInfo)
            .subscribe((plotData) => {
                this.plots = plotData;
                // console.log('plots (in service) are: ');
                // console.log(this.plots);
                this.plotsUpdated.next(this.plots);
            });
    }

    getPlotUpdateListener() {
        return this.plotsUpdated.asObservable();
    }
}
