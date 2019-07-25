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
  private rasterEventFeedback
  private rasterEventResponse
  private rasterEventStimOn

  private allRastersLoaded = new Subject();
  private rasterEventFeedbackLoaded = new Subject();
  private rasterEventResponseLoaded = new Subject();
  private rasterEventStimOnLoaded = new Subject();

  constructor(private http: HttpClient) { }

  getAllRasters(clusterInfo) {
    const query = {
      'subject_uuid': clusterInfo['subject_uuid'],
      'session_start_time': clusterInfo['session_start_time'],
      'cluster_id': clusterInfo['cluster_id'],
      'probe_idx': clusterInfo['probe_idx'],
      'cluster_revision': clusterInfo['cluster_revision']
    }
    this.http.post(BACKEND_API_URL + `/plot/raster`, query)
      .subscribe(
        (plotData) => {
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
    console.log('fetching event feedback raster plots..');
    this.http.post(BACKEND_API_URL + `/plot/raster`, query)
      .subscribe(
        (plotData) => {
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
    this.http.post(BACKEND_API_URL + `/plot/raster`, query)
      .subscribe(
        (plotData) => {
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
    this.http.post(BACKEND_API_URL + `/plot/raster`, query)
      .subscribe(
        (plotData) => {
          this.rasterEventStimOn = plotData;

          this.rasterEventStimOnLoaded.next(this.rasterEventStimOn);
        },
        (err: any) => {
          console.log('error in retrieving raster - stim on event plots');
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
}
