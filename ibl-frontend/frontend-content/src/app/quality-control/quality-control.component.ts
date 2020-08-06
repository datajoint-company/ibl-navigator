import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription, Observable } from 'rxjs';

import { QualityControlService } from './quality-control.service';

declare var Plotly: any;

@Component({
  selector: 'app-quality-control',
  templateUrl: './quality-control.component.html',
  styleUrls: ['./quality-control.component.css']
})
export class QualityControlComponent implements OnInit, OnDestroy {
  public subject_uuid: string;
  public session_start_time: string;
  public subject_nickname: string;
  public session_lab: string;
  public session_project: string;
  public protocol: string;
  probeChanged: boolean;

  probeIndex;
  driftmapInfo: Object;
  probeList = [];

  private probeInsertionSubscription: Subscription;

  probeSwitch: EventEmitter<any> = new EventEmitter();
  // probeSwitch2: Observable = new Observable((observer) => {
  //   if ("if change is detected in probeIndex value") {
  //     observer.next()
  //   }
  // });
  constructor(private route: ActivatedRoute, public QCService: QualityControlService) { }

  ngOnInit() {

    this.subject_uuid = this.route.snapshot.paramMap.get('subjectID');
    this.session_start_time = this.route.snapshot.paramMap.get('sessionStartTime');
    this.subject_nickname = this.route.snapshot.queryParamMap.get('nickname');
    this.session_lab = this.route.snapshot.queryParamMap.get('lab');
    this.session_project = this.route.snapshot.queryParamMap.get('project');
    this.protocol = this.route.snapshot.queryParamMap.get('protocol')
    let queryParamTest = this.route.snapshot.queryParamMap
    console.log('session start time: ', this.session_start_time)
    console.log('nickname: ', this.subject_nickname)
    console.log('all queryParams: ', queryParamTest)

    this.QCService.retrieveProbeInsertions({'subject_uuid': this.subject_uuid, 'session_start_time': this.session_start_time});
    this.probeInsertionSubscription = this.QCService.getProbeInsertionsLoadedListener()
      .subscribe((probeInsertions) => {
        // console.log('probe insertions: ', probeInsertions);
        for (let entry of Object.values(probeInsertions)) {
          this.probeList.push(entry['probe_idx']);
        }
        this.probeIndex = Math.min(...this.probeList);
        // console.log('min of the detected probes are: ', Math.min(...this.probeList))
        this.driftmapInfo = {
          subject_uuid: this.subject_uuid,
          session_start_time: this.session_start_time,
          probe_idx: this.probeIndex
        };
      });
    // console.log(this.probeList);
    

  }

  ngOnDestroy() {
    
  }

  probe_selected(probe) {
    console.log('probe selected! - ', probe);
    this.probeIndex = probe;
    this.driftmapInfo['probe_idx'] = this.probeIndex;

    this.probeChanged = true;
    // this.probeSwitch.emit();
  }

  probeChange(event) {
    console.log('probe change detected - QC nedpoint')
  }

}
