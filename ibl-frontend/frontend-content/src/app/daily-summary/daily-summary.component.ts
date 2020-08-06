import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subscription, Observable, Subject } from 'rxjs';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { DailySummaryService } from './daily-summary.service';
import { FilterStoreService } from '../filter-store.service';
import * as moment from 'moment';

declare var Plotly: any;
@Component({
  selector: 'app-daily-summary',
  templateUrl: './daily-summary.component.html',
  styleUrls: ['./daily-summary.component.css'],
  // animations: [
  //   trigger('expandCollapse', [
  //     state('expanded', style({
  //       opacity: '1'
  //     })),
  //     state('collapsed', style({
  //       display: 'none',
  //       transform: 'translateY(-120%)',
  //       opacity: '0'
  //     })),
  //     transition('collapsed <=> expanded', [
  //       animate('0.5s')
  //     ])
  //   ])
  // ]
})
export class DailySummaryComponent implements OnInit, OnDestroy {
  summary_filter_form = new FormGroup({
    lab_name_control: new FormControl(),
    subject_nickname_control: new FormControl(),
    subject_uuid_control: new FormControl(),
    latest_task_protocol_control: new FormControl(),
    latest_training_status_control: new FormControl(),
    latest_session_ingested_control: new FormControl(),
    projects_control: new FormControl(),
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
  // sliderStep = 1;
  // sliderInverted = false;
  dateRangeToggle: boolean;
  filteredLatestTaskProtocolOptions: Observable<string[]>;
  filteredLatestTrainingStatusOptions: Observable<string[]>;
  filteredLabNameOptions: Observable<string[]>;
  filteredSubjectNicknameOptions: Observable<string[]>;
  filteredSubjectUuidOptions: Observable<string[]>;
  filteredProjectsOptions: Observable<string[]>;
  daily_summary_menu = {};

  displayedColumns: string[] = ['lab_name', 'subject_nickname', 'latest_session_ingested',
    'latest_training_status', 'latest_task_protocol', 'n_sessions_current_protocol',
    'projects', 'latest_session_on_flatiron', 'data_update_status', 'subject_uuid', 'detail_link', 'expand_collapse'];

  displayedPlots: string[] = ['water_weight', 'performance_reaction_time',
    'trial_counts_session_duration', 'contrast_heatmap'];

  displayedPlots2: string[] = ['daily_plots'];

  allPlotsOpen = true;
  plotViewStatus: Object;

  // setup for the paginator
  dataSource;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 25];

  collapsedStyle = {
    animationName: 'collapsing',
    animationDuration: '0.75s',
    height: '0'
  };
  expandedStyle = {
    animationName: 'expanding',
    animationDuration: '1s'
  };
  private viewStatusAdded = new Subject();

  private summarySubscription: Subscription;
  private summarySubscription2: Subscription;
  private summaryMenuSubscription: Subscription;
  private summaryAllMenuSubscription: Subscription;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(public dailySummaryService: DailySummaryService, public filterStoreService: FilterStoreService) { }

  ngOnInit() {
    // console.log('on init');
    this.plotViewStatus = {};
    // const tableState = this.filterStoreService.retrieveSummaryTableState();

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
          this.summary_filter_form.controls.latest_session_ingested_control.patchValue(moment.utc(dateRange[0]));
        } else if (dateRange[0] !== '') {
          this.dateRangeToggle = true;
          this.summary_filter_form.controls.session_range_filter['controls'].session_range_start_control.patchValue(moment.utc(dateRange[0]));
          this.summary_filter_form.controls.session_range_filter['controls'].session_range_end_control.patchValue(moment.utc(dateRange[1]));
        }
      } else if (key !== 'latest_session_ingested' && key !== '__json' && key !== '__order') {
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
    this.dailySummaryService.getSummaryAllMenu({'__order': 'lab_name, latest_session_ingested DESC'});
    this.summaryAllMenuSubscription = this.dailySummaryService.getSummaryAllMenuLoadedListener()
      .subscribe(summary => {
        const viewStatusObservable = new Observable((observer) => {
          // console.log('making full menu with ', summary);

          for (const info of Object.values(summary)) {
            // console.log('logging info: ', info);
            info['plotViewingStatus'] = true;
          }
          observer.next(summary);
          observer.complete();
        });
        viewStatusObservable.subscribe(updatedSummary => {
          // console.log('view status added?', updatedSummary);
          this.allSummary = updatedSummary;
          this.createMenu(updatedSummary);
          this.loading = false;
        });
      });
  }

  ngOnDestroy() {
    if (this.summarySubscription) {
      this.summarySubscription.unsubscribe();
    }
    if (this.summarySubscription2) {
      this.summarySubscription2.unsubscribe();
    }
    if (this.summaryMenuSubscription) {
      this.summaryMenuSubscription.unsubscribe();
    }
    if (this.summaryAllMenuSubscription) {
      this.summaryAllMenuSubscription.unsubscribe();
    }

  }

  private createMenu(summaryInfo) {
    this.daily_summary_menu = {};
    const keys = ['latest_task_protocol', 'latest_session_ingested', 'subject_uuid',
      'latest_training_status', 'lab_name', 'latest_session_on_flatiron',
      'subject_nickname', 'n_sessions_current_protocol', 'projects'];
    for (const key of keys) {
      this.daily_summary_menu[key] = [];
    }
    for (const summaryItem of summaryInfo) {
      for (const key of keys) {
        if (key !== 'projects' && !this.daily_summary_menu[key].includes(summaryItem[key])) {
          this.daily_summary_menu[key].push(summaryItem[key]);
        } else if (key === 'projects') {
          if (summaryItem[key].split(',').length === 1 && !this.daily_summary_menu[key].includes(summaryItem[key])) {
            this.daily_summary_menu[key].push(summaryItem[key]);
          } else if (summaryItem[key].split(',').length > 1) {
            for (const projOpt of summaryItem[key].split(',')) {
              if (!this.daily_summary_menu[key].includes(projOpt)) {
                this.daily_summary_menu[key].push(projOpt);
              }
            }
          }
        }
      }
    }

    // create formcontrol for item in menus
    const sessionSeconds = [];
    for (const date of this.daily_summary_menu['latest_session_ingested']) {
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

    this.filteredProjectsOptions = this.summary_filter_form.controls.projects_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'projects'))
      );

    this.sessionDateFilter = (d: Date): boolean => {
      const sessionDates = [];
      for (const date of this.daily_summary_menu['latest_session_ingested']) {
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
      // console.log('reference menu NOT empty - creating new menu');
      this.dailySummaryService.getSummaryMenu(referenceMenuReq);
      this.summaryMenuSubscription = this.dailySummaryService.getSummaryMenuLoadedListener()
        .subscribe((summaryInfo: any) => {

          this.createMenu(summaryInfo);
        });
    } else {
      // console.log('reference menu empty - creating all menu');
      // console.log('length of allSummary is: ', this.allSummary.length);
      this.createMenu(this.allSummary);
    }
  }

  updateMenu() {
    const menuRequest = this.filterRequests();
    // console.log('attempting updateMenu - menuRequest is: ', menuRequest);
    // console.log('allMenu length here (updateMenu) is: ', this.allSummary.length);
    if (Object.entries(menuRequest).length > 1) {
      this.dailySummaryService.getSummaryMenu(menuRequest);
      this.dailySummaryService.getSummaryMenuLoadedListener()
        .subscribe((sessions: any) => {
          this.createMenu(sessions);
          // console.log('menu has been updated - requested session length is - ', sessions.length);
          // console.log('menu has been updated - checking all session length - ', this.allSummary.length);
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
        if (filterKey === 'latest_session_ingested') {
          if (!this.dateRangeToggle) {
            const sessionST = moment.utc(filter[1]);
            const rangeStartTime = '00:00:00';
            const rangeEndTime = '23:59:59';
            const startString = sessionST.toISOString().split('T')[0] + 'T' + rangeStartTime;
            const endString = sessionST.toISOString().split('T')[0] + 'T' + rangeEndTime;
            const rangeStart = '"' + 'latest_session_ingested>' + '\'' + startString + '\'' + '"';
            const rangeEnd = '"' + 'latest_session_ingested<' + '\'' + endString + '\'' + '"';
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

            const sessionStart = moment.utc(filter[1]['session_range_start_control']);
            const sessionEnd = moment.utc(filter[1]['session_range_end_control']);
            const rangeStartTime = '00:00:00';
            const rangeEndTime = '23:59:59';
            const startString = sessionStart.toISOString().split('T')[0] + 'T' + rangeStartTime;
            const endString = sessionEnd.toISOString().split('T')[0] + 'T' + rangeEndTime;
            const rangeStart = '"' + 'latest_session_ingested>' + '\'' + startString + '\'' + '"';
            const rangeEnd = '"' + 'latest_session_ingested<' + '\'' + endString + '\'' + '"';
            if (requestJSONstring.length > 0) {
              requestJSONstring += ',' + rangeStart + ',' + rangeEnd;
            } else {
              requestJSONstring += rangeStart + ',' + rangeEnd;
            }
          } else if (this.dateRangeToggle && filter[1]['session_range_start_control'] && !filter[1]['session_range_end_control']) {
            // console.log('all session from ', filter[1]['session_range_start_control'], ' requested!');
            const sessionStart = moment.utc(filter[1]['session_range_start_control']);
            const rangeStartTime = '00:00:00';
            const startString = sessionStart.toISOString().split('T')[0] + 'T' + rangeStartTime;
            const rangeStart = '"' + 'latest_session_ingested>' + '\'' + startString + '\'' + '"';
            if (requestJSONstring.length > 0) {
              requestJSONstring += ',' + rangeStart;
            } else {
              requestJSONstring += rangeStart;
            }
          } else if (this.dateRangeToggle && !filter[1]['session_range_start_control'] && filter[1]['session_range_end_control']) {
            // console.log('all session up to ', filter[1]['session_range_end_control'], ' requested!');
            const sessionEnd = moment.utc(filter[1]['session_range_end_control']);
            const rangeEndTime = '23:59:59';
            const endString = sessionEnd.toISOString().split('T')[0] + 'T' + rangeEndTime;
            const rangeEnd = '"' + 'latest_session_ingested<' + '\'' + endString + '\'' + '"';
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
    // console.log('applying filter');
    this.loading = true;
    this.summary = [];
    const request = this.filterRequests();
    request['__order'] = 'lab_name, latest_session_ingested DESC';
    if (Object.entries(request) && Object.entries(request).length > 1) {
      this.filterStoreService.storeSummaryFilter(request);
      this.dailySummaryService.getSummary2(request);
      this.summarySubscription2 = this.dailySummaryService.getSummary2LoadedListener()
        .subscribe((summaryInfo: any) => {
          const viewStatusObservable = new Observable((observer) => {
            // console.log('making full menu with ', summaryInfo);
            for (let info of summaryInfo) {
              info['plotViewingStatus'] = true;
            }
            observer.next(summaryInfo);
          });
          viewStatusObservable.subscribe(updatedSummary => {
            // console.log('updated summary - applied filter:', updatedSummary);
            this.summary = updatedSummary;
            this.dataSource = new MatTableDataSource(this.summary);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.loading = false;
          });

          // this.loading = false;
          // this.summary = summaryInfo;
          // this.dataSource = new MatTableDataSource(this.summary);
          // this.dataSource.sort = this.sort;
          // this.dataSource.paginator = this.paginator;
        });
    } else {
      this.resetFilter();
    }
  }

  resetFilter() {
    // console.log('resetting filter');
    this.loading = true;
    this.dailySummaryService.getSummary({ '__order': 'lab_name, latest_session_ingested DESC' });
    this.filterStoreService.clearSummaryFilter();
    this.summarySubscription = this.dailySummaryService.getSummaryLoadedListener()
      .subscribe((summaryInfo: any) => {
        const viewStatusObservable = new Observable((observer) => {
          for (const info of Object.values(summaryInfo)) {
            info['plotViewingStatus'] = true;
          }
          observer.next(summaryInfo);
        });
        viewStatusObservable.subscribe(updatedSummary => {
          // console.log('updated summary - reset filter:', updatedSummary);
          this.allSummary = updatedSummary;
          this.summary = updatedSummary;
          this.dataSource = new MatTableDataSource(this.summary);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.loading = false;
        });


        // this.loading = false;
        // this.summary = summaryInfo;
        // this.allSummary = summaryInfo;

        // this.dataSource = new MatTableDataSource(this.summary);
        // this.dataSource.sort = this.sort;
        // this.dataSource.paginator = this.paginator;
        
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
    // console.log('trying to open plot for');
    // console.log(summaryId);
    for (const info of this.allSummary) {
      if (info['subject_uuid'] === summaryId) {
        // console.log('before: ', info['plotViewingStatus']);
        if (info['plotViewingStatus'] || info['plotViewingStatus'] == null) {
          info['plotViewingStatus'] = false;
        } else {
          info['plotViewingStatus'] = true;
        }
        // console.log('after: ', info['plotViewingStatus']);
      }
    }
    for (const info of this.summary) {
      if (info['subject_uuid'] === summaryId) {
        if (info['plotViewingStatus'] || info['plotViewingStatus'] == null) {
          info['plotViewingStatus'] = false;
        } else {
          info['plotViewingStatus'] = true;
        }
      }
    }
  }

  toggleAllPlotsView() {
    // make all plotViewStatus open/closed regardless of their individual state
    // console.log('all plot view status toggled');
    if (this.allPlotsOpen) {
      this.allPlotsOpen = false;
      for (const info of this.allSummary) {
        info['plotViewingStatus'] = false;
      }
      for (const info of this.summary) {
        info['plotViewingStatus'] = false;
      }
    } else {
      this.allPlotsOpen = true;
      for (const info of this.allSummary) {
        info['plotViewingStatus'] = true;
      }
      for (const info of this.summary) {
        info['plotViewingStatus'] = true;
      }
    }
  }

  openDetail(event, subjectID) {
    console.log('right click!');
    console.log(event);
    console.log(subjectID);
    window.open(`/mouse/${subjectID}`, "_blank")
  }
}
