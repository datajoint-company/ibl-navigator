import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

const BACKEND_API_URL = environment.backend_url;

@Injectable({
  providedIn: 'root'
})
export class QualityControlService {
  private driftmaps;
  private driftmapTemplates;
  private probeInsertions;

  private driftmapsLoaded = new Subject();
  private driftmapTemplatesLoaded = new Subject();
  private probeInsertionsLoaded = new Subject();

  constructor(private http: HttpClient) { }

  retrieveProbeInsertions(sessionInfo) {
    console.log('about to fetch probe insertions: ', sessionInfo)
    this.http.post(BACKEND_API_URL + `/plot/probeinsertion`, sessionInfo)
      .subscribe(
        (retrievedProbeInsertionData) => {
          this.probeInsertions = retrievedProbeInsertionData;
          this.probeInsertionsLoaded.next(this.probeInsertions);
        },
        (err: any) => {
          console.log('err in fetching probe insertions');
          console.error(err);
        }
      );
  }

  retrieveDriftmapPlots(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/driftmap`, queryInfo)
      .subscribe(
        (retrievedDriftmapData) => {
          this.driftmaps = retrievedDriftmapData;
          this.driftmapsLoaded.next(this.driftmaps);
        },
        (err: any) => {
          console.log('err in fetching requested depth rasters');
          console.error(err);
        }
      );
  }

  getDriftmapTemplates() {
    this.http.get(BACKEND_API_URL + `/plot/driftmaptemplate`)
      .subscribe(
        (templateData) => {
          this.driftmapTemplates = templateData;
          this.driftmapTemplatesLoaded.next(this.driftmapTemplates);
        },
        (err: any) => {
          console.log('err in fetching requested depth raster templates');
          console.error(err);
        }
      );
  }

  getDriftmapsLoadedListener() {
    return this.driftmapsLoaded.asObservable();
  }

  getDriftmapTemplatesLoadedListener() {
    return this.driftmapTemplatesLoaded.asObservable();
  }

  getProbeInsertionsLoadedListener() {
    return this.probeInsertionsLoaded.asObservable();
  }
}
