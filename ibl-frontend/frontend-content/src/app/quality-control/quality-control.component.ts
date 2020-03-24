import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Subscription } from 'rxjs';

import { QualityControlService } from './quality-control.service';

declare var Plotly: any;

@Component({
  selector: 'app-quality-control',
  templateUrl: './quality-control.component.html',
  styleUrls: ['./quality-control.component.css']
})
export class QualityControlComponent implements OnInit, OnDestroy {

  @Input() sessionInfo: Object;
  constructor(public QCService: QualityControlService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    
  }

}
