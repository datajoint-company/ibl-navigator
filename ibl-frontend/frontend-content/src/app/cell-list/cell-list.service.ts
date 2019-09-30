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
  private rasterTemplates;
  private psthTemplates;

  private cellListLoaded = new Subject();
  private rasterListLoaded = new Subject();
  private psthListLoaded = new Subject();
  private rasterTemplatesLoaded = new Subject();
  private psthTemplatesLoaded = new Subject();

  constructor(private http: HttpClient) { }

  retrieveCellList(sessionInfo) {
    const mouse_id = sessionInfo['subject_uuid'];
    const session_time = sessionInfo['session_start_time'];
    console.log('retrieving for..');
    console.log('mouse_id: ', mouse_id);
    console.log('session_time: ', session_time);
    this.http.post(BACKEND_API_URL + `/plot/cluster`, {
      'subject_uuid': mouse_id,
      'session_start_time': session_time
    })
      .subscribe(
        (sessionCellData) => {
          console.log('retrieved cell Data!: ', Object.entries(sessionCellData).length)
          this.cellList = sessionCellData;
          this.cellListLoaded.next(this.cellList);
        },
        (err: any) => {
          console.log('error in retrieving cell list for session');
          console.error(err);
        }
      );
  }

  retrieveRasterList(queryInfo) {
    console.log('printing queryInfo')
    console.log(queryInfo);
    this.http.post(BACKEND_API_URL + `/plot/rasterbatch`, queryInfo)
    // this.http.post(BACKEND_API_URL + `/plot/raster`, queryInfo)
      .subscribe(
        (sessionRasterData) => {
          // console.log('retrieved session\'s raster data!: ', Object.entries(sessionRasterData).length);
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
    console.log('printing psth queryInfo');
    console.log(queryInfo);
    this.http.post(BACKEND_API_URL + `/plot/psthbatch`, queryInfo)
      .subscribe(
        (sessionPSTHData) => {
          console.log('psth data retrieved - ', sessionPSTHData);
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
          console.log('just fetched templates from backend');
          console.log(rasterTemplates);
          // console.log('retrieved session\'s raster data!: ', Object.entries(sessionRasterData).length);
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
          console.log('just fetched PSTH template from backend');
          console.log(psthTemplates);
          this.psthTemplates = psthTemplates;
          this.psthTemplatesLoaded.next(this.psthTemplates);
        },
        (err: any) => {
          console.log('error in retrieving PSTH templates');
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
}
