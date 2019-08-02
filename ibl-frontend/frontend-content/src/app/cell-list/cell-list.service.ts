import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';

const BACKEND_API_URL = environment.api_url;
@Injectable({
  providedIn: 'root'
})
export class CellListService {
  private cellList;
  private rasterList;

  private cellListLoaded = new Subject();
  private rasterListLoaded = new Subject();

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
          console.log('just fetched from backend');
          console.log(sessionRasterData);
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

  getCellListLoadedListener() {
    return this.cellListLoaded.asObservable();
  }
  getRasterListLoadedListener() {
    return this.rasterListLoaded.asObservable();
  }
}
