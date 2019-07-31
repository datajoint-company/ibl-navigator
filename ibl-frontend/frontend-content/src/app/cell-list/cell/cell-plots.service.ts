import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

const BACKEND_API_URL = environment.api_url;

@Injectable({
  providedIn: 'root'
})
export class CellPlotsService {
  private allRasters;
  private rasterEventFeedback;
  private rasterEventResponse;
  private rasterEventStimOn;
  private allPsthPlots;

  private allRastersLoaded = new Subject();
  private rasterEventFeedbackLoaded = new Subject();
  private rasterEventResponseLoaded = new Subject();
  private rasterEventStimOnLoaded = new Subject();
  private allPsthPlotsLoaded = new Subject();

  constructor(private http: HttpClient) { }

  getAllRasters(clusterInfo) {
    const query = {
      'subject_uuid': clusterInfo['subject_uuid'],
      'session_start_time': clusterInfo['session_start_time'],
      'cluster_id': clusterInfo['cluster_id'],
      'probe_idx': clusterInfo['probe_idx'],
      'cluster_revision': clusterInfo['cluster_revision']
    }
    // let timeA = new Date()
    console.log('fetching ALL raster plots..');
    this.http.post(BACKEND_API_URL + `/plot/raster`, query)
      .subscribe(
        (plotData) => {
          console.log('received ALL raster plots');
          // console.log('duration: ', new Date() - timeA, ' ms');
          console.log('length of data: ', Object.entries(plotData).length);
          this.allRasters = plotData;

          this.allRastersLoaded.next(this.allRasters);
        },
        (err: any) => {
          console.log('error in retrieving all raster plots');
          console.error(err);
        }
      );
  }

  getRasterEventFeedback(clusterInfo) {
    const query = {
      'subject_uuid': clusterInfo['subject_uuid'],
      'session_start_time': clusterInfo['session_start_time'],
      'cluster_id': clusterInfo['cluster_id'],
      'probe_idx': clusterInfo['probe_idx'],
      'cluster_revision': clusterInfo['cluster_revision'],
      'event': 'feedback'
    };
    // let timeX = new Date()
    console.log('fetching event feedback raster plots..');
    this.http.post(BACKEND_API_URL + `/plot/raster`, query)
      .subscribe(
        (plotData) => {
          console.log('received feedback event raster plots');
          // console.log('duration: ', new Date() - timeX, ' ms');
          console.log('length of data: ', Object.entries(plotData).length);
          this.rasterEventFeedback = plotData;

          this.rasterEventFeedbackLoaded.next(this.rasterEventFeedback);
        },
        (err: any) => {
          console.log('error in retrieving raster - feedback event plots');
          console.error(err);
        }
      );
  }

  getRasterEventResponse(clusterInfo) {
    const query = {
      'subject_uuid': clusterInfo['subject_uuid'],
      'session_start_time': clusterInfo['session_start_time'],
      'cluster_id': clusterInfo['cluster_id'],
      'probe_idx': clusterInfo['probe_idx'],
      'cluster_revision': clusterInfo['cluster_revision'],
      'event': 'response'
    }
    // let timeY = new Date()
    console.log('fetching event response raster plots..');
    this.http.post(BACKEND_API_URL + `/plot/raster`, query)
      .subscribe(
        (plotData) => {
          console.log('received response event raster plots');
          // console.log('duration: ', new Date() - timeY, ' ms');
          console.log('length of data: ', Object.entries(plotData).length);
          this.rasterEventResponse = plotData;

          this.rasterEventResponseLoaded.next(this.rasterEventResponse);
        },
        (err: any) => {
          console.log('error in retrieving raster - response event plots');
          console.error(err);
        }
      );
  }

  getRasterEventStimOn(clusterInfo) {
    const query = {
      'subject_uuid': clusterInfo['subject_uuid'],
      'session_start_time': clusterInfo['session_start_time'],
      'cluster_id': clusterInfo['cluster_id'],
      'probe_idx': clusterInfo['probe_idx'],
      'cluster_revision': clusterInfo['cluster_revision'],
      'event': 'stim on'
    }
    // let timeZ = new Date()
    console.log('fetching event stim-on raster plots..');
    this.http.post(BACKEND_API_URL + `/plot/raster`, query)
      .subscribe(
        (plotData) => {
          console.log('received stim-on event raster plots');
          // console.log('duration: ', new Date() - timeZ, ' ms');
          console.log('length of data: ', Object.entries(plotData).length);
          this.rasterEventStimOn = plotData;

          this.rasterEventStimOnLoaded.next(this.rasterEventStimOn);
        },
        (err: any) => {
          console.log('error in retrieving raster - stim on event plots');
          console.error(err);
        }
      );
  }

  getAllPSTH(clusterInfo) {
    const query = {
      'subject_uuid': clusterInfo['subject_uuid'],
      'session_start_time': clusterInfo['session_start_time'],
      'cluster_id': clusterInfo['cluster_id'],
      'probe_idx': clusterInfo['probe_idx'],
      'cluster_revision': clusterInfo['cluster_revision']
    }
    // let timeA = new Date()
    console.log('fetching all 3 psth plots..');
    this.http.post(BACKEND_API_URL + `/plot/psth`, query)
      .subscribe(
        (plotData) => {
          console.log('received all 3 psth plots');
          // console.log('duration: ', new Date() - timeA, ' ms');
          console.log('length of data: ', Object.entries(plotData).length);
          this.allPsthPlots = plotData;

          this.allPsthPlotsLoaded.next(this.allPsthPlots);
        },
        (err: any) => {
          console.log('error in retrieving psth plots');
          console.error(err);
        }
      );
  }

  getAllRastersLoadedListener() {
    return this.allRastersLoaded.asObservable();
  }

  getRasterEventFeedbackLoadedListener() {
    return this.rasterEventFeedbackLoaded.asObservable();
  }

  getRasterEventResponseLoadedListener() {
    return this.rasterEventResponseLoaded.asObservable();
  }

  getRasterEventStimOnLoadedListener() {
    return this.rasterEventStimOnLoaded.asObservable();
  }
  getAllPsthPlotsLoadedListener() {
    return this.allPsthPlotsLoaded.asObservable();
  }
}
