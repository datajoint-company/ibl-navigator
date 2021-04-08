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
  private depthBrainRegions;
  private rasterList;
  private psthList;

  // I want this automated - there are 5 conditions for 2 probes currently for rasters; 2 conditions for 2 probes for PSTHs.
  // the 5 raster conditions -  ['feedback.trial_id', 'feedback.feedback type', 'stim on.trial_id', 'stim on.feedback - stim on', 'stim on.contrast']
  // the 2 PSTH conditions - ['feedback', 'stim on']
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
  private rasterList10;
  private rasterList11;
  private rasterList12;
  private rasterList13;
  private rasterList14;
  private rasterList15;
  private rasterList16;
  private rasterList17;
  private psthList0;
  private psthList1;
  private psthList2;
  private psthList3;
  private psthList4;
  private psthList5;
  private psthList6;
  private psthList7;

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
  private depthBrainRegionsLoaded = new Subject();
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
  private rasterListLoaded10 = new Subject();
  private rasterListLoaded11 = new Subject();
  private rasterListLoaded12 = new Subject();
  private rasterListLoaded13 = new Subject();
  private rasterListLoaded14 = new Subject();
  private rasterListLoaded15 = new Subject();
  private rasterListLoaded16 = new Subject();
  private rasterListLoaded17 = new Subject();
  private psthListLoaded0 = new Subject();
  private psthListLoaded1 = new Subject();
  private psthListLoaded2 = new Subject();
  private psthListLoaded3 = new Subject();
  private psthListLoaded4 = new Subject();
  private psthListLoaded5 = new Subject();
  private psthListLoaded6 = new Subject();
  private psthListLoaded7 = new Subject();

  private rasterListLoaded_edit = new Subject();
  private psthListLoaded_edit = new Subject();

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
  private coronalSectionsLoaded = new Subject();

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

  retrieveDepthBrainRegions(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/depthBrainRegions`, queryInfo)
    // this.http.post(BACKEND_API_URL + `/plot/DBR_dummy`, queryInfo)
      .subscribe(
        (sessionDBRData) => {
          this.depthBrainRegions = sessionDBRData;
          this.depthBrainRegionsLoaded.next(this.depthBrainRegions);
        },
        (err: any) => {
          console.log('error in retrieving brain regions for session');
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

  // === // == // Coronal Sections (for probe selection) // == // == // == // == // == //
  retrieveCoronalSections(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/coronalSections`, queryInfo)
      .subscribe(
        (coronalSectionData) => {
          this.coronalSectionsLoaded.next(coronalSectionData);
        },
        (err: any) => {
          console.log('error in retrieving coronal sections for session');
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
          console.log('error in retrieving raster list 0 for session');
          console.log('query: ', queryInfo)
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
          console.log('error in retrieving raster list 1 for session');
          console.log('query: ', queryInfo)
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
          console.log('error in retrieving raster list 2 for session');
          console.log('query: ', queryInfo)
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
          console.log('error in retrieving raster list 3 for session');
          console.log('query: ', queryInfo)
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
          console.log('error in retrieving raster list 4 for session');
          console.log('query: ', queryInfo)
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
          console.log('error in retrieving raster list 5 for session');
          console.log('query: ', queryInfo)
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
          console.log('error in retrieving raster list 6 for session');
          console.log('query: ', queryInfo)
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
          console.log('error in retrieving raster list 7 for session');
          console.log('query: ', queryInfo)
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
          console.log('error in retrieving raster list 8 for session');
          console.log('query: ', queryInfo)
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
          console.log('error in retrieving raster list 9 for session');
          console.log('query: ', queryInfo)
          console.error(err);
        }
      );
  }

  retrieveRasterList10(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList10 = sessionRasterData;
          this.rasterListLoaded10.next(this.rasterList10);
        },
        (err: any) => {
          console.log('error in retrieving raster list 10 for session');
          console.log('query: ', queryInfo)
          console.error(err);
        }
      );
  }
  retrieveRasterList11(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList11 = sessionRasterData;
          this.rasterListLoaded11.next(this.rasterList11);
        },
        (err: any) => {
          console.log('error in retrieving raster list 11 or session');
          console.log('query: ', queryInfo)
          console.error(err);
        }
      );
  }
  retrieveRasterList12(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList10 = sessionRasterData;
          this.rasterListLoaded12.next(this.rasterList12);
        },
        (err: any) => {
          console.log('error in retrieving raster list 12 for session');
          console.log('query: ', queryInfo)
          console.error(err);
        }
      );
  }
  retrieveRasterList13(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList13 = sessionRasterData;
          this.rasterListLoaded10.next(this.rasterList13);
        },
        (err: any) => {
          console.log('error in retrieving raster list 13 for session');
          console.log('query: ', queryInfo)
          console.error(err);
        }
      );
  }
  retrieveRasterList14(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList14 = sessionRasterData;
          this.rasterListLoaded14.next(this.rasterList14);
        },
        (err: any) => {
          console.log('error in retrieving raster list 14 for session');
          console.log('query: ', queryInfo)
          console.error(err);
        }
      );
  }
  retrieveRasterList15(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList15 = sessionRasterData;
          this.rasterListLoaded15.next(this.rasterList15);
        },
        (err: any) => {
          console.log('error in retrieving raster list 15 for session');
          console.log('query: ', queryInfo)
          console.error(err);
        }
      );
  }
  retrieveRasterList16(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList16 = sessionRasterData;
          this.rasterListLoaded16.next(this.rasterList16);
        },
        (err: any) => {
          console.log('error in retrieving raster list 16 for session');
          console.log('query: ', queryInfo)
          console.error(err);
        }
      );
  }
  retrieveRasterList17(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this.rasterList17 = sessionRasterData;
          this.rasterListLoaded17.next(this.rasterList17);
        },
        (err: any) => {
          console.log('error in retrieving raster list 17 for session');
          console.log('query: ', queryInfo)
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

  retrievePSTHList4(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/psthbatch`, queryInfo)
      .subscribe(
        (sessionPSTHData) => {
          this.psthList4 = sessionPSTHData;
          this.psthListLoaded4.next(this.psthList4);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrievePSTHList5(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/psthbatch`, queryInfo)
      .subscribe(
        (sessionPSTHData) => {
          this.psthList5 = sessionPSTHData;
          this.psthListLoaded5.next(this.psthList5);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrievePSTHList6(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/psthbatch`, queryInfo)
      .subscribe(
        (sessionPSTHData) => {
          this.psthList6 = sessionPSTHData;
          this.psthListLoaded6.next(this.psthList6);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  retrievePSTHList7(queryInfo) {
    this.http.post(BACKEND_API_URL + `/plot/psthbatch`, queryInfo)
      .subscribe(
        (sessionPSTHData) => {
          this.psthList7 = sessionPSTHData;
          this.psthListLoaded7.next(this.psthList7);
        },
        (err: any) => {
          console.log('error in retrieving raster list for session');
          console.error(err);
        }
      );
  }

  // Cleaning code above 
  retrieveRasterList_edit(queryInfo, count) {
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          this[`rasterListLoaded${count}`].next(sessionRasterData);
        },
        (err: any) => {
          console.log(`error in retrieving raster ${count} (edited) list for session`);
          console.log('query: ', queryInfo)
          console.error(err);
        }
      );
  }


  retrievePSTHList_edit(queryInfo, count) {
    this.http.post(BACKEND_API_URL + `/plot/psthbatch`, queryInfo)
      .subscribe(
        (sessionPSTHData) => {
          this[`psthListLoaded${count}`].next(sessionPSTHData);
        },
        (err: any) => {
          console.log(`error in retrieving PSTH ${count} (edited) list for session`);
          console.error(err);
        }
      );
  }
  // end code clean


  getCellListLoadedListener() {
    return this.cellListLoaded.asObservable();
  }
  getDepthBrainRegionsLoadedListener() {
    return this.depthBrainRegionsLoaded.asObservable();
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

  getCoronalSectionsLoadedListener() {
    return this.coronalSectionsLoaded.asObservable();
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
  getRasterListLoadedListener10() {
    return this.rasterListLoaded10.asObservable();
  }
  getRasterListLoadedListener11() {
    return this.rasterListLoaded11.asObservable();
  }
  getRasterListLoadedListener12() {
    return this.rasterListLoaded12.asObservable();
  }
  getRasterListLoadedListener13() {
    return this.rasterListLoaded13.asObservable();
  }
  getRasterListLoadedListener14() {
    return this.rasterListLoaded14.asObservable();
  }
  getRasterListLoadedListener15() {
    return this.rasterListLoaded15.asObservable();
  }
  getRasterListLoadedListener16() {
    return this.rasterListLoaded16.asObservable();
  }
  getRasterListLoadedListener17() {
    return this.rasterListLoaded17.asObservable();
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
  getPSTHListLoadedListener4() {
    return this.psthListLoaded4.asObservable();
  }
  getPSTHListLoadedListener5() {
    return this.psthListLoaded5.asObservable();
  }
  getPSTHListLoadedListener6() {
    return this.psthListLoaded6.asObservable();
  }
  getPSTHListLoadedListener7() {
    return this.psthListLoaded7.asObservable();
  }


  getRasterListLoadedListener_edit(count) {
    return this[`rasterListLoaded${count}`].asObservable();
  }

  getPSTHListLoadedListener_edit(count) {
    return this[`psthListLoaded${count}`].asObservable();
  }
}
