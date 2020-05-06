import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';

const BACKEND_API_URL = environment.backend_url;
@Injectable({
  providedIn: 'root'
})
export class CellListService {
  private cellList;
  private rasterList;
  private psthList;

  private rasterList0;
  private rasterList1;
  private rasterList2;
  private rasterList3;
  private rasterList4;
  private rasterList5;
  private rasterList6;
  private rasterList7;
  private rasterList8;
  private rasterList9;
  private psthList0;
  private psthList1;
  private psthList2;
  private psthList3;

  private rasterTemplates;
  private psthTemplates;
  private gcCriteria;
  private goodClusters;
  private probeTrajectory;
  private depthRasterTrial;
  private depthRasterTemplates;
  private depthPethTemplate;
  private depthPeth;
  private spikeAmpTimeTemplate;
  private spikeAmpTime;
  private acgTemplate;
  private autocorrelogram;
  private waveformTemplate;
  private waveform;

  private cellListLoaded = new Subject();
  private rasterListLoaded = new Subject();
  private psthListLoaded = new Subject();

  private rasterListLoaded0 = new Subject();
  private rasterListLoaded1 = new Subject();
  private rasterListLoaded2 = new Subject();
  private rasterListLoaded3 = new Subject();
  private rasterListLoaded4 = new Subject();
  private rasterListLoaded5 = new Subject();
  private rasterListLoaded6 = new Subject();
  private rasterListLoaded7 = new Subject();
  private rasterListLoaded8 = new Subject();
  private rasterListLoaded9 = new Subject();
  private psthListLoaded0 = new Subject();
  private psthListLoaded1 = new Subject();
  private psthListLoaded2 = new Subject();
  private psthListLoaded3 = new Subject();

  private rasterTemplatesLoaded = new Subject();
  private psthTemplatesLoaded = new Subject();
  private gcCriteriaLoaded = new Subject();
  private goodClustersLoaded = new Subject();
  private probeTrajectoryLoaded = new Subject();
  private depthRasterTrialLoaded = new Subject();
  private depthRasterTemplatesLoaded = new Subject();
  private depthPethTemplateLoaded = new Subject();
  private depthPethLoaded = new Subject();
  private spikeAmpTimeTemplateLoaded = new Subject();
  private spikeAmpTimeLoaded = new Subject();
  private acgTemplateLoaded = new Subject();
  private autocorrelogramLoaded = new Subject();
  private waveformTemplateLoaded = new Subject();
  private waveformLoaded = new Subject();

  constructor(private http: HttpClient) { }

  retrieveCellList(sessionInfo) {
    const mouse_id = sessionInfo['subject_uuid'];
    const session_time = sessionInfo['session_start_time'];
    this.http.post(BACKEND_API_URL + `/plot/cluster`, {
      'subject_uuid': mouse_id,
      'session_start_time': session_time
    })
      .subscribe(
        (sessionCellData) => {
          this.cellList = sessionCellData;
          this.cellListLoaded.next(this.cellList);
        },
        (err: any) => {
          console.log('error in retrieving cell list for session');
          console.error(err);
        }
      );
  }

  // === // == // Rasters/PSTHs // == // == // == // == // == //
  retrieveRasterList(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList = sessionRasterData;
          this.rasterListLoaded.next(this.rasterList);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrievePSTHList(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/psthbatch`, queryInfo)
      .subscribe(
        (sessionPSTHData) => {
          this.psthList = sessionPSTHData;
          this.psthListLoaded.next(this.psthList);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrieveRasterTemplates() {
    this.http.get(BACKEND_API_URL + `/plot/rastertemplate`)
      .subscribe(
        (rasterTemplates) => {
          this.rasterTemplates = rasterTemplates;
          this.rasterTemplatesLoaded.next(this.rasterTemplates);
        },
        (err: any) => {
          console.log('error in retrieving raster templates');
          console.error(err);
        }
      );
  }

  retrievePsthTemplates() {
    this.http.get(BACKEND_API_URL + `/plot/psthtemplate`)
      .subscribe(
        (psthTemplates) => {
          this.psthTemplates = psthTemplates;
          this.psthTemplatesLoaded.next(this.psthTemplates);
        },
        (err: any) => {
          console.log('error in retrieving PSTH templates');
          console.error(err);
        }
      );
  }

  // === // == // Good Cluster Filters // == // == // == // == // == //
  retrieveGCFilterTypes() {
    this.http.get(BACKEND_API_URL + `/plot/gccriterion`)
      .subscribe(
        (criteria) => {
          this.gcCriteria = criteria;
          this.gcCriteriaLoaded.next(this.gcCriteria);
        },
        (err: any) => {
          console.log('error in retrieving good filter criteria');
          console.error(err);
        }
      )
  }

  retrieveGoodClusters(GCqueryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/goodcluster`, GCqueryInfo)
      .subscribe(
        (goodCellData) => {
          this.goodClusters = goodCellData;
          this.goodClustersLoaded.next(this.goodClusters);
        },
        (err: any) => {
          console.log('error in retrieving good clusters for: ', GCqueryInfo);
          console.error(err);
        }
      );
  }

  // === // == // Probe Trajectory Information // == // == // == // == // == //
  retrieveProbeTrajectory(trajQueryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/trajectory`, trajQueryInfo)
      .subscribe(
        (probeTrajData) => {
          this.probeTrajectory = probeTrajData;
          this.probeTrajectoryLoaded.next(this.probeTrajectory);
        },
        (err: any) => {
          console.log('error in retrieving probe trajectory for: ', trajQueryInfo);
          console.error(err);
        }
      );
  }

  // === // == // Depth Raster Trials // == // == // == // == // == //
  retrieveDepthRasterTrialPlot(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/trialdepthraster`, queryInfo)
      .subscribe(
        (retrievedDepthRasterTrialData) => {
          this.depthRasterTrial = retrievedDepthRasterTrialData;
          this.depthRasterTrialLoaded.next(this.depthRasterTrial);
        },
        (err: any) => {
          console.log('err in fetching requested depth raster trial');
          console.error(err);
        }
      );
  }

  getDepthRasterTemplates() {
    this.http.get(BACKEND_API_URL + `/plot/driftmaptemplate`)
      .subscribe(
        (templateData) => {
          this.depthRasterTemplates = templateData;
          this.depthRasterTemplatesLoaded.next(this.depthRasterTemplates);
        },
        (err: any) => {
          console.log('err in fetching requested depth raster templates');
          console.error(err);
        }
      );
  }

  // === // == // Depth PETH // == // == // == // == // == //
  retrieveDepthPethPlot(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/depthpeth`, queryInfo)
      .subscribe(
        (retrievedDepthPethData) => {
          this.depthPeth = retrievedDepthPethData;
          this.depthPethLoaded.next(this.depthPeth);
        },
        (err: any) => {
          console.log('err in fetching requested depth PETH plots');
          console.error(err);
        }
      );
  }

  getDepthPethTemplate() {
    this.http.get(BACKEND_API_URL + `/plot/depthpethtemplate`)
      .subscribe(
        (templateData) => {
          this.depthPethTemplate = templateData;
          this.depthPethTemplateLoaded.next(this.depthPethTemplate);
        },
        (err: any) => {
          console.log('err in fetching requested depth PETH templates');
          console.error(err);
        }
      );
  }

  // === // == // Cluster Quality Control - Spike Amp Time // == // == // == // == // == //
  retrieveSpikeAmpTimePlot(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/spikeamptime`, queryInfo)
      .subscribe(
        (retrievedSATData) => {
          this.spikeAmpTime = retrievedSATData;
          this.spikeAmpTimeLoaded.next(this.spikeAmpTime);
        },
        (err: any) => {
          console.log('err in fetching requested spike amp time plots');
          console.error(err);
        }
      );
  }

  getSpikeAmpTimeTemplate() {
    this.http.get(BACKEND_API_URL + `/plot/spikeamptimetemplate`)
      .subscribe(
        (templateData) => {
          this.spikeAmpTimeTemplate = templateData;
          this.spikeAmpTimeTemplateLoaded.next(this.spikeAmpTimeTemplate);
        },
        (err: any) => {
          console.log('err in fetching requested spike amp time templates');
          console.error(err);
        }
      );
  }


  // === // == // Cluster Control - Autocorrelogram // == // == // == // == // == //
  retrieveAutocorrelogramPlot(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/autocorrelogram`, queryInfo)
      .subscribe(
        (retrievedACGData) => {
          this.autocorrelogram = retrievedACGData;
          this.autocorrelogramLoaded.next(this.autocorrelogram);
        },
        (err: any) => {
          console.log('err in fetching requested autocorrelogram plots');
          console.error(err);
        }
      );
  }

  getAutocorrelogramTemplate() {
    this.http.get(BACKEND_API_URL + `/plot/autocorrelogramtemplate`)
      .subscribe(
        (templateData) => {
          this.acgTemplate = templateData;
          this.acgTemplateLoaded.next(this.acgTemplate);
        },
        (err: any) => {
          console.log('err in fetching requested autocorrelogram templates');
          console.error(err);
        }
      );
  }


  // === // == // Cluster Control - Waveform // == // == // == // == // == //
  retrieveWaveformPlot(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/waveform`, queryInfo)
      .subscribe(
        (retrievedWaveformData) => {
          this.waveform= retrievedWaveformData;
          this.waveformLoaded.next(this.waveform);
        },
        (err: any) => {
          console.log('err in fetching requested waveform plots');
          console.error(err);
        }
      );
  }

  getWaveformTemplate() {
    this.http.get(BACKEND_API_URL + `/plot/waveformtemplate`)
      .subscribe(
        (templateData) => {
          this.waveformTemplate = templateData;
          this.waveformTemplateLoaded.next(this.waveformTemplate);
        },
        (err: any) => {
          console.log('err in fetching requested waveform templates');
          console.error(err);
        }
      );
  }



///////////////////// needs fix /////////////////////
  retrieveRasterList0(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList0 = sessionRasterData;
          this.rasterListLoaded0.next(this.rasterList0);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrieveRasterList1(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList1 = sessionRasterData;
          this.rasterListLoaded1.next(this.rasterList1);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrieveRasterList2(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList2 = sessionRasterData;
          this.rasterListLoaded2.next(this.rasterList2);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrieveRasterList3(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList3 = sessionRasterData;
          this.rasterListLoaded3.next(this.rasterList3);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrieveRasterList4(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList4 = sessionRasterData;
          this.rasterListLoaded4.next(this.rasterList4);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrieveRasterList5(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList5 = sessionRasterData;
          this.rasterListLoaded5.next(this.rasterList5);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrieveRasterList6(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList6 = sessionRasterData;
          this.rasterListLoaded6.next(this.rasterList6);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrieveRasterList7(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList7 = sessionRasterData;
          this.rasterListLoaded7.next(this.rasterList7);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrieveRasterList8(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList8 = sessionRasterData;
          this.rasterListLoaded8.next(this.rasterList8);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrieveRasterList9(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList9 = sessionRasterData;
          this.rasterListLoaded9.next(this.rasterList9);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrievePSTHList0(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/psthbatch`, queryInfo)
      .subscribe(
        (sessionPSTHData) => {
          this.psthList0 = sessionPSTHData;
          this.psthListLoaded0.next(this.psthList0);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrievePSTHList1(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/psthbatch`, queryInfo)
      .subscribe(
        (sessionPSTHData) => {
          this.psthList1 = sessionPSTHData;
          this.psthListLoaded1.next(this.psthList1);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrievePSTHList2(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/psthbatch`, queryInfo)
      .subscribe(
        (sessionPSTHData) => {
          this.psthList2 = sessionPSTHData;
          this.psthListLoaded2.next(this.psthList2);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrievePSTHList3(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/psthbatch`, queryInfo)
      .subscribe(
        (sessionPSTHData) => {
          this.psthList3 = sessionPSTHData;
          this.psthListLoaded3.next(this.psthList3);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }


  getCellListLoadedListener() {
    return this.cellListLoaded.asObservable();
  }
  getRasterListLoadedListener() {
    return this.rasterListLoaded.asObservable();
  }
  getPSTHListLoadedListener() {
    return this.psthListLoaded.asObservable();
  }
  getRasterTemplatesLoadedListener() {
    return this.rasterTemplatesLoaded.asObservable();
  }
  getPsthTemplatesLoadedListener() {
    return this.psthTemplatesLoaded.asObservable();
  }
  getGCCriteriaLoadedListener() {
    return this.gcCriteriaLoaded.asObservable();
  }
  getGoodClustersLoadedListener() {
    return this.goodClustersLoaded.asObservable();
  }
  getProbeTrajectoryLoadedListener() {
    return this.probeTrajectoryLoaded.asObservable();
  }
  getDepthRasterTrialLoadedListener() {
    return this.depthRasterTrialLoaded.asObservable();
  }

  getDepthRasterTemplatesLoadedListener() {
    return this.depthRasterTemplatesLoaded.asObservable();
  }

  getDepthPethLoadedListener() {
    return this.depthPethLoaded.asObservable();
  }

  getDepthPethTemplateLoadedListener() {
    return this.depthPethTemplateLoaded.asObservable();
  }

  getSpikeAmpTimeLoadedListener() {
    return this.spikeAmpTimeLoaded.asObservable();
  }

  getSpikeAmpTimeTemplateLoadedListener() {
    return this.spikeAmpTimeTemplateLoaded.asObservable();
  }

  getACGLoadedListener() {
    return this.autocorrelogramLoaded.asObservable();
  }

  getACGTemplateLoadedListener() {
    return this.acgTemplateLoaded.asObservable();
  }

  getWaveformLoadedListener() {
    return this.waveformLoaded.asObservable();
  }

  getWaveformTemplateLoadedListener() {
    return this.waveformTemplateLoaded.asObservable();
  }




  getRasterListLoadedListener0() {
    return this.rasterListLoaded0.asObservable();
  }
  getRasterListLoadedListener1() {
    return this.rasterListLoaded1.asObservable();
  }
  getRasterListLoadedListener2() {
    return this.rasterListLoaded2.asObservable();
  }
  getRasterListLoadedListener3() {
    return this.rasterListLoaded3.asObservable();
  }
  getRasterListLoadedListener4() {
    return this.rasterListLoaded4.asObservable();
  }
  getRasterListLoadedListener5() {
    return this.rasterListLoaded5.asObservable();
  }
  getRasterListLoadedListener6() {
    return this.rasterListLoaded6.asObservable();
  }
  getRasterListLoadedListener7() {
    return this.rasterListLoaded7.asObservable();
  }
  getRasterListLoadedListener8() {
    return this.rasterListLoaded8.asObservable();
  }
  getRasterListLoadedListener9() {
    return this.rasterListLoaded9.asObservable();
  }

  getPSTHListLoadedListener0() {
    return this.psthListLoaded0.asObservable();
  }
  getPSTHListLoadedListener1() {
    return this.psthListLoaded1.asObservable();
  }
  getPSTHListLoadedListener2() {
    return this.psthListLoaded2.asObservable();
  }
  getPSTHListLoadedListener3() {
    return this.psthListLoaded3.asObservable();
  }
}
