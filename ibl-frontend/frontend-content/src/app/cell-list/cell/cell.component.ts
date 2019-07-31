import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { CellListService } from '../cell-list.service';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.css']
})
export class CellComponent implements OnInit, OnDestroy {
  public mouse_id: string;
  public session_time: string;
  public cluster_id: string;
  cell: any;
  selectedEvent: string;

  private cellSubscription: Subscription;

  constructor(private route: ActivatedRoute, public cellListService: CellListService) { }

  ngOnInit() {
    this.mouse_id = this.route.snapshot.paramMap.get('mouseID');
    this.session_time = this.route.snapshot.paramMap.get('sessionTime');
    this.cluster_id = this.route.snapshot.paramMap.get('clusterID');

    this.cellListService.retrieveCellList({'subject_uuid': this.mouse_id,
                                           'session_start_time': this.session_time,
                                           'cluster_id': this.cluster_id});
    this.cellSubscription = this.cellListService.getCellListLoadedListener()
      .subscribe((cellData) => {
        if (Object.entries(cellData).length > 0) {
          // Double check with backend to make sure there is only 1 result with above request
          this.cell = cellData[0];
        }
      });
  }

  ngOnDestroy() {
    if (this.cellSubscription) {
      this.cellSubscription.unsubscribe();
    }
  }

  rasterEventSelected(event) {
    console.log('raster plot event selected!');
    console.log(event);
    this.selectedEvent = event;
  }

}
