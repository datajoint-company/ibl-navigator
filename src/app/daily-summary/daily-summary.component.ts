import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { DailySummaryService } from './daily-summary.service';
import { FilterStoreService } from '../filter-store.service';

declare var Plotly: any;
@Component({
  selector: 'app-daily-summary',
  templateUrl: './daily-summary.component.html',
  styleUrls: ['./daily-summary.component.css'],
  animations: [
    trigger('expandCollapse', [
      state('expanded', style({
        // backgroundColor: 'pink',
        // height: '400px',
        opacity: '1'
      })),
      state('collapsed', style({
        // backgroundColor: 'lavender',
        // height: '0px',
        display: 'none',
        transform: 'translateY(-120%)',
        opacity: '0'
      })),
      transition('collapsed <=> expanded', [
        animate('0.5s')
      ])
    ])
  ]
})
export class DailySummaryComponent implements OnInit, OnDestroy {
  summary_filter_form = new FormGroup({
    lab_name_control: new FormControl(),
    subject_nickname_control: new FormControl(),
    subject_uuid_control: new FormControl(),
    latest_task_protocol_control: new FormControl(),
    latest_training_status_control: new FormControl(),
    latest_session_ingested_control: new FormControl(),
    last_session_time_control: new FormControl(),
    session_range_filter: new FormGroup({
      session_range_start_control: new FormControl(),
      session_range_end_control: new FormControl()
    }),
    // n_sessions_current_protocol_control: new FormControl()
  });
  summary;
  allSummary;
  loading = true;
  
  sessionDateFilter: Function;
  sessionMinDate: Date;
  sessionMaxDate: Date;
  // nSessionsMin: number;
  // nSessionsMax: number;
  sliderStep = 1;
  sliderInverted = false;
  dateRangeToggle: boolean;
  filteredLatestTaskProtocolOptions: Observable<string[]>;
  filteredLatestTrainingStatusOptions: Observable<string[]>;
  filteredLabNameOptions: Observable<string[]>;
  filteredSubjectNicknameOptions: Observable<string[]>;
  filteredSubjectUuidOptions: Observable<string[]>;
  daily_summary_menu = {};

  displayedColumns: string[] = ['subject_nickname', 'last_session_time', 'lab_name', 'latest_training_status',
    'latest_task_protocol', 'n_sessions_current_protocol', 'latest_session_ingested',
    'latest_session_on_flatiron', 'subject_uuid', 'detail_link', 'expand_collapse'];

  displayedPlots: string[] = ['water_weight', 'performance_reaction_time',
    'trial_counts_session_duration', 'contrast_heatmap'];

  displayedPlots2: string[] = ['daily_plots'];

  allPlotsOpen = true;
  plotViewStatus: Object;

  // setup for the paginator
  dataSource;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];

  private summarySubscription: Subscription;
  private summaryMenuSubscription: Subscription;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(public dailySummaryService: DailySummaryService, public filterStoreService: FilterStoreService) { }

  ngOnInit() {
    this.plotViewStatus = {};
    const tableState: [number, number, Object] = this.filterStoreService.retrieveSummaryTableState();
    const filters = this.filterStoreService.retrieveSummaryFilter();
    for (const key in filters) {
      // console.log('preApplied filters are: ', filters);
      if (key === '__json') {
        const JSONcontent = JSON.parse(filters[key]);
        const dateRange = ['', ''];
        for (const item of JSONcontent) {
          if (typeof item === 'string') {
            if (item.split('>')[1]) {
              dateRange[0] = item.split('>')[1].split('T')[0].split('\'')[1];
            }
            if (item.split('<')[1]) {
              dateRange[1] = item.split('<')[1].split('T')[0].split('\'')[1];
            }
          }
        }
        if (dateRange[0] !== '' && dateRange[0] === dateRange[1]) {
          this.dateRangeToggle = false;
          this.summary_filter_form.controls.last_session_time_control.patchValue(new Date(dateRange[0] + ' (UTC)'));
        } else if (dateRange[0] !== '') {
          this.dateRangeToggle = true;
          this.summary_filter_form.controls.session_range_filter['controls'].session_range_start_control.patchValue(new Date(dateRange[0] + ' (UTC)'));
          this.summary_filter_form.controls.session_range_filter['controls'].session_range_end_control.patchValue(new Date(dateRange[1] + ' (UTC)'));
        }
      } else if (key !== 'last_session_time' && key !== '__json' && key !== '__order') {
        const controlName = key + '_control';
        if (this.summary_filter_form.controls[controlName]) {
          const toPatch = {};
          toPatch[controlName] = filters[key];
          this.summary_filter_form.patchValue(toPatch);
        }
      }
    }
    if (tableState[1]) {
      this.paginator.pageIndex = tableState[0];
      this.pageSize = tableState[1];
    }
    if (tableState[2] && Object.entries(tableState[2]).length > 0 && this.sort) {
      this.sort.active = Object.keys(tableState[2])[0];
      this.sort.direction = Object.values(tableState[2])[0].direction;
    }

    this.applyFilter();
    this.dailySummaryService.getSummaryMenu({'__order': 'last_session_time DESC'});
    this.summaryMenuSubscription = this.dailySummaryService.getSummaryMenuLoadedListener()
      .subscribe(summary => {
        this.allSummary = summary;

        // this.dataSource = new MatTableDataSource(this.summary);
        // this.dataSource.sort = tshis.sort;
        // this.dataSource.paginator = this.paginator;
        this.createMenu(summary);
        this.loading = false;
      });
  }

  ngOnDestroy() {
    if (this.summarySubscription) {
      this.summarySubscription.unsubscribe();
    }
    if (this.summaryMenuSubscription) {
      this.summaryMenuSubscription.unsubscribe();
    }
  }

  private createMenu(summaryInfo) {
    this.daily_summary_menu = {};
    const keys = ['latest_task_protocol', 'last_session_time', 'subject_uuid',
      'latest_training_status', 'lab_name', 'latest_session_on_flatiron',
      'latest_session_ingested', 'subject_nickname', 'n_sessions_current_protocol'];
    for (const key of keys) {
      this.daily_summary_menu[key] = [];
    }
    for (const summaryItem of summaryInfo) {
      for (const key of keys) {
        if (!this.daily_summary_menu[key].includes(summaryItem[key])) {
          this.daily_summary_menu[key].push(summaryItem[key]);
        }
      }
    }

    // create formcontrol for item in menus
    const sessionSeconds = [];
    for (const date of this.daily_summary_menu['last_session_time']) {
      sessionSeconds.push(new Date(date).getTime());
    }
    this.sessionMinDate = new Date(Math.min(...sessionSeconds));
    this.sessionMaxDate = new Date(Math.max(...sessionSeconds));

    // const sessionNumbers = [];
    // for (const num of this.daily_summary_menu['n_sessions_current_protocol']) {
    //   sessionNumbers.push(num);
    // }
    // this.nSessionsMin = Math.min(...sessionNumbers);
    // this.nSessionsMax = Math.max(...sessionNumbers);

    this.filteredLabNameOptions = this.summary_filter_form.controls.lab_name_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'lab_name'))
      );

    this.filteredSubjectNicknameOptions = this.summary_filter_form.controls.subject_nickname_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'subject_nickname'))
      );

    this.filteredSubjectUuidOptions = this.summary_filter_form.controls.subject_uuid_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'subject_uuid'))
      );

    this.filteredLatestTrainingStatusOptions = this.summary_filter_form.controls.latest_training_status_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'latest_training_status'))
      );

    this.filteredLatestTaskProtocolOptions = this.summary_filter_form.controls.latest_task_protocol_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'latest_task_protocol'))
      );

    this.sessionDateFilter = (d: Date): boolean => {
      const sessionDates = [];
      for (const date of this.daily_summary_menu['last_session_time']) {
        sessionDates.push(date.split('T')[0]);
      }

      // filter out dates without any session
      return sessionDates.includes(d.toISOString().split('T')[0]);
    };
  }

  private _filter(value: string, menuType: string): string[] {
    const filterValue = value.toLowerCase();
    const result = this.daily_summary_menu[menuType].filter(menu_items => {
      if (menu_items && menu_items.toLowerCase().includes(filterValue)) {
        return true;
      }
    });
    return result;
  }

  stepBackMenu(event) {
    let focusOn: string;
    focusOn = event.target.name;
    const referenceMenuReq = this.filterRequests(focusOn);
    if (Object.entries(referenceMenuReq) && Object.entries(referenceMenuReq).length > 0) {
      this.dailySummaryService.getSummaryMenu(referenceMenuReq);
      this.summaryMenuSubscription = this.dailySummaryService.getSummaryMenuLoadedListener()
        .subscribe((summaryInfo: any) => {

          this.createMenu(summaryInfo);
        });
    } else {
      // console.log('reference menu empty - creating all menu');
      this.createMenu(this.allSummary);
    }
  }

  updateMenu() {
    const menuRequest = this.filterRequests();
    if (Object.entries(menuRequest).length > 1) {
      this.dailySummaryService.getSummaryMenu(menuRequest);
      this.dailySummaryService.getSummaryMenuLoadedListener()
        .subscribe((sessions: any) => {
          this.createMenu(sessions);
        });
    }
  }

  filterRequests(focusedField?: string) {
    const filterList = Object.entries(this.summary_filter_form.getRawValue());
    // console.log('filterList is...');
    // console.log(filterList);
    const requestFilter = {};
    let requestJSONstring = '';
    filterList.forEach(filter => {
      // filter is [["lab_name_control", "somelab"], ["subject_nickname_control", null]...]
      const filterKey = filter[0].split('_control')[0]; // filter[0] is control name like 'lab_name_control'
      if (filter[1] && filterKey !== focusedField) {
        if (filterKey === 'last_session_time') {
          if (!this.dateRangeToggle) {
            const sessionST = new Date(filter[1].toString());
            const rangeStartTime = '00:00:00';
            const rangeEndTime = '23:59:59';
            const startString = sessionST.toISOString().split('T')[0] + 'T' + rangeStartTime;
            const endString = sessionST.toISOString().split('T')[0] + 'T' + rangeEndTime;
            const rangeStart = '"' + 'last_session_time>' + '\'' + startString + '\'' + '"';
            const rangeEnd = '"' + 'last_session_time<' + '\'' + endString + '\'' + '"';
            if (requestJSONstring.length > 0) {
              requestJSONstring += ',' + rangeStart + ',' + rangeEnd;
            } else {
              requestJSONstring += rangeStart + ',' + rangeEnd;
            }
          }
        } else if (filterKey === 'session_range_filter') {
          //// Note: filter =
          ////      ["session_range_filter", { session_range_start_control: null, session_range_end_control: null }]
          if (this.dateRangeToggle && filter[1]['session_range_start_control'] && filter[1]['session_range_end_control']) {

            const sessionStart = new Date(filter[1]['session_range_start_control'].toString());
            const sessionEnd = new Date(filter[1]['session_range_end_control'].toString());
            const rangeStartTime = '00:00:00';
            const rangeEndTime = '23:59:59';
            const startString = sessionStart.toISOString().split('T')[0] + 'T' + rangeStartTime;
            const endString = sessionEnd.toISOString().split('T')[0] + 'T' + rangeEndTime;
            const rangeStart = '"' + 'last_session_time>' + '\'' + startString + '\'' + '"';
            const rangeEnd = '"' + 'last_session_time<' + '\'' + endString + '\'' + '"';
            if (requestJSONstring.length > 0) {
              requestJSONstring += ',' + rangeStart + ',' + rangeEnd;
            } else {
              requestJSONstring += rangeStart + ',' + rangeEnd;
            }
          } else if (this.dateRangeToggle && filter[1]['session_range_start_control'] && !filter[1]['session_range_end_control']) {
            // console.log('all session from ', filter[1]['session_range_start_control'], ' requested!');
            const sessionStart = new Date(filter[1]['session_range_start_control'].toString());
            const rangeStartTime = '00:00:00';
            const startString = sessionStart.toISOString().split('T')[0] + 'T' + rangeStartTime;
            const rangeStart = '"' + 'last_session_time>' + '\'' + startString + '\'' + '"';
            if (requestJSONstring.length > 0) {
              requestJSONstring += ',' + rangeStart;
            } else {
              requestJSONstring += rangeStart;
            }
          } else if (this.dateRangeToggle && !filter[1]['session_range_start_control'] && filter[1]['session_range_end_control']) {
            // console.log('all session up to ', filter[1]['session_range_end_control'], ' requested!');
            const sessionEnd = new Date(filter[1]['session_range_end_control'].toString());
            const rangeEndTime = '23:59:59';
            const endString = sessionEnd.toISOString().split('T')[0] + 'T' + rangeEndTime;
            const rangeEnd = '"' + 'last_session_time<' + '\'' + endString + '\'' + '"';
            if (requestJSONstring.length > 0) {
              requestJSONstring += ',' + rangeEnd;
            } else {
              requestJSONstring += rangeEnd;
            }
          }
        } else {
          requestFilter[filterKey] = filter[1];
        }

        if (requestJSONstring.length > 0) {
          // console.log('requestJSONstring is : ', requestJSONstring);
          requestFilter['__json'] = '[' + requestJSONstring + ']';
        }
      }
    });
    return requestFilter;
  }

  applyFilter() {
    console.log('applying filter');
    this.loading = true;
    this.summary = [];
    const request = this.filterRequests();
    request['__order'] = 'last_session_time DESC';
    if (Object.entries(request) && Object.entries(request).length > 1) {
      // if (this.summarySubscription) this.summarySubscription.unsubscribe();
      this.filterStoreService.storeSummaryFilter(request);
      this.dailySummaryService.getSummary(request);
      this.summarySubscription = this.dailySummaryService.getSummaryLoadedListener()
        .subscribe((summaryInfo: any) => {
          this.loading = false;

          this.summary = summaryInfo;

          this.dataSource = new MatTableDataSource(this.summary);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;

        });
    } else {
      this.resetFilter();
    }
  }

  resetFilter() {
    console.log('resetting filter');
    this.loading = true;
    this.dailySummaryService.getSummary({ '__order': 'last_session_time DESC' });
    this.filterStoreService.clearSummaryFilter();
    this.summarySubscription = this.dailySummaryService.getSummaryLoadedListener()
      .subscribe((summaryInfo: any) => {
        this.loading = false;
        for (let info of summaryInfo) {
          info['plotViewingStatus'] = true;
        }

        this.summary = summaryInfo;
        this.allSummary = summaryInfo;

        this.dataSource = new MatTableDataSource(this.summary);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        
      });
    
  }

  clearControl() {
    const toReset = {};
    for (const control in this.summary_filter_form.controls) {
      if (control === 'session_range_filter') {
        toReset[control] = { 'session_range_start_control': null, 'session_range_end_control': null }

      }  else {
        toReset[control] = '';
      }
      this.summary_filter_form.patchValue(toReset);
    }
    this.filterStoreService.clearSummaryTableState();
    this.paginator.pageSize = 5;
    this.paginator.pageIndex = null;
    // the below sort is to reset the arrow UI that doesn't go away after this.sort.active = '' 
    this.sort.sortables.forEach(sortItem => {
      this.sort.sort(sortItem);
    });

    this.sort.active = '';

    this.applyFilter();
  }

  storeTableInfo(event) {
    let pageIndex;
    let pageSize;
    const sorter = {};
    if (event.pageSize) {
      pageIndex = event.pageIndex;
      pageSize = event.pageSize;
    }
    if (event.active && event.direction) {
      sorter[event.active] = { 'direction': event.direction };
    }
    this.filterStoreService.storeSummaryTableState(pageIndex, pageSize, sorter);
  }

  openPlot(summaryId) {
    console.log('trying to open plot for');
    console.log(summaryId);
    for (let info of this.allSummary) {
      if (info['subject_uuid'] === summaryId) {
        console.log('before: ', info['plotViewingStatus']);
        if (info['plotViewingStatus']) {
          info['plotViewingStatus'] = false;
        } else {
          info['plotViewingStatus'] = true;
        }
        console.log('after: ', info['plotViewingStatus']);
      }
    }
  }

  toggleAllPlotsView() {
    // make all plotViewStatus open/closed regardless of their individual state
    console.log('all plot view status toggled');
    if (this.allPlotsOpen) {
      this.allPlotsOpen = false;
      for (const info of this.allSummary) {
        info['plotViewingStatus'] = false;
      }
    } else {
      this.allPlotsOpen = true;
      for (const info of this.allSummary) {
        info['plotViewingStatus'] = true;
      }
    }
  }
}
