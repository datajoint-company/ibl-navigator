import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class PlotsService {
    private plots;
    private psychPlot;
    private plotsUpdated = new Subject();
    private samplePlotUpdated = new Subject();

    private somePost;
    private somePostUpdated = new Subject();

    constructor(private http: HttpClient) {}

    getPlots(type, id) {
        this.http.get(`http://localhost:3000/api/plots/${ type }/${ id }`)
        .subscribe((plotData) => {
            this.plots = plotData;
            console.log('plots (in service getPlots) are: ');
            console.log(this.plots);
            this.plotsUpdated.next(this.plots);
        });
    }

    retrievePlot(plotInfo) {
        console.log('POSTing for:', plotInfo);
        this.http.post(`http://localhost:3000/api/plot/`, plotInfo, { responseType: 'text' })
            .subscribe(
                (plotData) => {
                    this.plots = plotData;
                    console.log('plots (in service retrievePlot) are: ');
                    console.log(this.plots);
                    this.plotsUpdated.next(this.plots);
                },
                (err: any) => {
                    console.log('err in http.post subscription - sending back plot data anyways');
                    console.log(err);
                    this.plotsUpdated.next(this.plots);
                }
            );
    }

    testPost(someData) {
        console.log('inside plots.service - in testPost()');
        console.log('posting: ', someData);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        this.http.post('http://localhost:3000/api/mice/', someData, httpOptions)
            .subscribe(
                (x) => {
                    this.somePost = x;
                    console.log('plots (in service retrievePlot) are: ');
                    console.log(this.somePost);
                    this.somePostUpdated.next(this.somePost);
                },
                (err: any) => {
                    console.log('err in posting to firebase');
                    console.log(err);
                    this.somePostUpdated.next(err);
                }
            );
    }
    getSomePostUpdateListener() {
        console.log('listening for random post response...');
        return this.somePostUpdated.asObservable();
    }

    getPlotUpdateListener() {
        return this.plotsUpdated.asObservable();
    }

    getSamplePlot() {
        this.http.get(`http://localhost:3000/api/plots/testPlot`)
        .subscribe((plotData) => {
            this.psychPlot = plotData;
            console.log('psych sample plots (in service getPlots) are: ');
            console.log(this.psychPlot);
            this.samplePlotUpdated.next(this.psychPlot);
        });
    }

    getSamplePlotUpdateListener() {
        console.log('listening for sample psych plot...');
        return this.samplePlotUpdated.asObservable();
    }
}
