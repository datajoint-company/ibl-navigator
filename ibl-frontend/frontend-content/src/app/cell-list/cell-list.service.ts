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

  private cellListLoaded = new Subject();

  constructor(private http: HttpClient) { }

  retrieveCellList(clusterInfo) {
    const mouse_id = clusterInfo['subject_uuid'];
    const session_time = clusterInfo['session_start_time'];
    const cluster_id = clusterInfo['cluster_id']
    console.log('retrieving for..');
    console.log('mouse_id: ', mouse_id);
    console.log('session_time: ', session_time);
    // console.log('cluster_id: ', cluster_id);
    this.http.post(BACKEND_API_URL + `/plot/cluster`, {
      'subject_uuid': mouse_id,
      'session_start_time': session_time
    })
    // this.http.post(BACKEND_API_URL + `/plot/cluster`, { 'subject_uuid': mouse_id,
    //                                                     'session_start_time': session_time,
    //                                                     'cluster_id': cluster_id})
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

  getCellListLoadedListener() {
    return this.cellListLoaded.asObservable();
  }

}
