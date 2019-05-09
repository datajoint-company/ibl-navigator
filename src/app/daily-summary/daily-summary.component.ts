import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { DailySummaryService } from './daily-summary.service';

declare var Plotly: any;
@Component({
  selector: 'app-daily-summary',
  templateUrl: './daily-summary.component.html',
  styleUrls: ['./daily-summary.component.css']
})
export class DailySummaryComponent implements OnInit, OnDestroy {
  summary;
  loading = true;

  displayedColumns: string[] = ['subject_nickname', 'last_session_time', 'latest_task_protocol',
    'latest_training_status', 'n_sessions_current_protocol', 'latest_session_ingested',
    'latest_session_on_flatiron', 'lab_name', 'subject_uuid'];

  displayedPlots: string[] = ['water_weight', 'performance_reaction_time',
    'trial_counts_session_duration', 'contrast_heatmap'];

  displayedPlots2: string[] = ['daily_plots'];

  // setup for the paginator
  dataSource;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];

  private summarySubscription: Subscription;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild('waterWeightPlot') elemWWI: ElementRef;
  // @ViewChild('trialCountsSessionDurationPlot') elemTCSD: ElementRef;
  // @ViewChild('performanceReactionTimePlot') elemPRT: ElementRef;
  // @ViewChild('contrastHeatmapPlot') elemCH: ElementRef;
  constructor(public dailySummaryService: DailySummaryService) { }

  ngOnInit() {
    // const elementWWI = this.elemWWI.nativeElement;
    // const elementTCSD = this.elemTCSD.nativeElement;
    // const elementPRT = this.elemPRT.nativeElement;
    // const elementCH = this.elemCH.nativeElement;

    this.dailySummaryService.getSummary({'__order': 'last_session_time DESC'});
    this.summarySubscription = this.dailySummaryService.getSummaryLoadedListener()
      .subscribe(summary => {
        this.summary = summary;
        this.dataSource = new MatTableDataSource(this.summary);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.loading = false;
      });
  }

  ngOnDestroy() {
    this.summarySubscription.unsubscribe();
  }

}
