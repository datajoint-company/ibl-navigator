import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { AllSessionsService } from './all-sessions.service';
import { SessionComponent } from './session/session.component';
import { FilterStoreService } from '../filter-store.service';


@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css']
})
export class SessionListComponent implements OnInit, OnDestroy {
  session_filter_form = new FormGroup({
    task_protocol_control : new FormControl(),
    session_uuid_control : new FormControl(),
    session_start_time_control : new FormControl(),
    session_range_filter: new FormGroup({
      session_range_start_control: new FormControl(),
      session_range_end_control: new FormControl()
    }),
    lab_name_control: new FormControl(),
    subject_nickname_control: new FormControl(),
    session_project_control: new FormControl(),
    subject_uuid_control: new FormControl(),
    sex_control: new FormArray([new FormControl(), new FormControl(), new FormControl()]),
    subject_birth_date_control: new FormControl(),
    subject_line_control: new FormControl(),
    responsible_user_control: new FormControl(),
    nplot_control: new FormControl()
  });
  loading = true;
  sessions;
  allSessions;
  sessionDateFilter: Function;
  miceBirthdayFilter: Function;
  sessionMinDate: Date;
  sessionMaxDate: Date;
  dateRangeToggle: boolean;
  filteredTaskProtocolOptions: Observable<string[]>;
  filteredSessionUuidOptions: Observable<string[]>;
  filteredLabNameOptions: Observable<string[]>;
  filteredSubjectNicknameOptions: Observable<string[]>;
  filteredSessionProjectOptions: Observable<string[]>;
  filteredSubjectUuidOptions: Observable<string[]>;
  filteredSubjectLineOptions: Observable<string[]>;
  filteredResponsibleUserOptions: Observable<string[]>;
  session_menu: any;
  // setup for the table columns
  displayedColumns: string[] = ['lab_name', 'subject_nickname', 'subject_birth_date', 'session_start_time',
                              'task_protocol', 'subject_line', 'responsible_user',
                              'session_uuid', 'sex', 'subject_uuid', 'nplot', 'session_project'];
  nplotMap: any = { '0': '', '1': '\u2714' };
  // setup for the paginator
  dataSource;
  pageSize = 25;
  pageSizeOptions: number[] = [10, 25, 50, 100];

  // queryValues = {
  //   'task_protocol': '_iblrig_tasks_habituationChoiceWorld3.7.6',
  //   // '__order': 'session_start_time'
  // };

  genderForm2MenuMap = { F: 0, M: 1, U: 2 };

  selectedSession = {};

  private sessionsSubscription: Subscription;
  private sessionMenuSubscription: Subscription;

  constructor(private route: ActivatedRoute, private router: Router, public allSessionsService: AllSessionsService, public filterStoreService: FilterStoreService) {}
  // @Input('preRestriction') preRestrictedMouseInfo: Object;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit() {
    this.session_menu = {};
    this.loading = true;
    this.session_menu['sex'] = { F: null, M: null, U: null };
    const tableState: [number, number, Object] = this.filterStoreService.retrieveSessionTableState();
    // console.log('tableState: ', tableState);
    this.route.queryParams
      .subscribe(params => {
        // console.log('params loading sessions: ', params);
        if (Object.entries(params).length === 0) {
          params = this.filterStoreService.retrieveSessionFilter();
        }
        for (const key in params) {
          if (key === '__json') {
            // console.log('inside __json filter');
            // console.log('params[key] is', params[key]);
            const JSONcontent = JSON.parse(params[key]);
            const dateRange = ['', ''];
            for (const item of JSONcontent) {
              if (typeof item === 'string') {
                 // item = "session_start_time>'2019-04-24T00:00:00'"
                if (item.split('>')[1]) {
                  dateRange[0] = item.split('>')[1].split('T')[0].split('\'')[1];
                }
                if (item.split('<')[1]) {
                  dateRange[1] = item.split('<')[1].split('T')[0].split('\'')[1];
                }

              } else {
                for (const gender of item) {
                  // console.log(gender); // gender = { sex: "F"}
                  this.session_filter_form.controls.sex_control['controls'][this.genderForm2MenuMap[gender['sex']]].patchValue(true);
                }
              }
            }
            if (dateRange[0] !== '' && dateRange[0] === dateRange[1]) {
              this.dateRangeToggle = false;
              this.session_filter_form.controls.session_start_time_control.patchValue(new Date(dateRange[0] + ' (UTC)'));
            } else if (dateRange[0] !== '') {
              this.dateRangeToggle = true;
              this.session_filter_form.controls.session_range_filter['controls'].session_range_start_control.patchValue(new Date(dateRange[0] + ' (UTC)'));
              this.session_filter_form.controls.session_range_filter['controls'].session_range_end_control.patchValue(new Date(dateRange[1] + ' (UTC)'));
            }
          } else if (key === 'sex') {
            this.session_filter_form.controls.sex_control['controls'][this.genderForm2MenuMap[params[key]]].patchValue(true);
          } else if (key === 'subject_birth_date') {
            // console.log(new Date(params[key] + ' (UTC)'));
            this.session_filter_form.controls.subject_birth_date_control.patchValue(new Date(params[key] + ' (UTC)'));
          } else if ( key !== 'session_start_time' && key !== '__json' && key !== '__order') {
            const controlName = key + '_control';
            if (this.session_filter_form.controls[controlName]) {
              const toPatch = {};
              toPatch[controlName] = params[key];
              this.session_filter_form.patchValue(toPatch);
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

      });
    // TODO: create menu content using separate api designated for menu instead of getting all session info
    this.allSessionsService.getSessionMenu({'__order': 'lab_name'});
        this.sessionMenuSubscription = this.allSessionsService.getSessionMenuLoadedListener()
          .subscribe((sessions: any) => {
            this.allSessions = sessions;
            this.createMenu(sessions);
          });
  }

  ngOnDestroy() {
    if (this.sessionsSubscription) {
      this.sessionsSubscription.unsubscribe();
    }
    if (this.sessionMenuSubscription) {
      this.sessionMenuSubscription.unsubscribe();
    }
  }

  private createMenu(sessions) {
    this.session_menu = {};
    const keys = ['task_protocol', 'session_start_time',
    'session_uuid', 'lab_name', 'subject_birth_date', 'subject_line',
    'subject_uuid', 'sex', 'subject_nickname', 'responsible_user', 'session_project'];
    for (const key of keys) {
      if (key !== 'sex') {
        this.session_menu[key] = [];
      } else {
        this.session_menu[key] = { F: false, M: false, U: false };
      }
    }
    for (const session of sessions) {
      for (const key of keys) {
        if (key !== 'sex' && !this.session_menu[key].includes(session[key])) {
          this.session_menu[key].push(session[key]);
        } else if (key === 'sex') {
          // console.log('creating sex menu - looking at ', this.session_menu[key], ' and ', session[key]);
          if (Object.keys(this.session_menu[key]).includes(session[key]) && !this.session_menu[key][session[key]]) {
            this.session_menu[key][session[key]] = true;
          }
        }
      }
    }

    // create formcontrol for item in menus
    // const sex_control_array = <FormArray>this.session_filter_form.controls['sex_control'];


    for (const item in this.session_menu['sex']) {
      if (!this.session_menu['sex'][item]) {
        this.session_filter_form.controls.sex_control['controls'][this.genderForm2MenuMap[item]].patchValue(false);
        this.session_filter_form.controls.sex_control['controls'][this.genderForm2MenuMap[item]].disable();
      } else {
        this.session_filter_form.controls.sex_control['controls'][this.genderForm2MenuMap[item]].enable();
      }
    }

    const sessionSeconds = [];
    for (const date of this.session_menu['session_start_time']) {
      sessionSeconds.push(new Date(date).getTime());
    }
    this.sessionMinDate = new Date(Math.min(...sessionSeconds));
    this.sessionMaxDate = new Date(Math.max(...sessionSeconds));

    this.filteredLabNameOptions = this.session_filter_form.controls.lab_name_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'lab_name'))
      );

    this.filteredSubjectNicknameOptions = this.session_filter_form.controls.subject_nickname_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'subject_nickname'))
      );

    this.filteredSessionProjectOptions = this.session_filter_form.controls.session_project_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'session_project'))
      );

    this.filteredSubjectUuidOptions = this.session_filter_form.controls.subject_uuid_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'subject_uuid'))
      );

    this.filteredSessionUuidOptions = this.session_filter_form.controls.session_uuid_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'session_uuid'))
      );

    this.filteredTaskProtocolOptions = this.session_filter_form.controls.task_protocol_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'task_protocol'))
      );

    this.filteredSubjectLineOptions = this.session_filter_form.controls.subject_line_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'subject_line'))
      );

    this.filteredResponsibleUserOptions = this.session_filter_form.controls.responsible_user_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'responsible_user'))
      );

    this.sessionDateFilter = (d: Date): boolean => {
      const sessionDates = [];
      for (const date of this.session_menu['session_start_time']) {
        sessionDates.push(date.split('T')[0]);
      }

      // filter out dates without any session
      return sessionDates.includes(d.toISOString().split('T')[0]);
    };
    this.miceBirthdayFilter = (d: Date): boolean => {
      const birthDates = [];
      for (const date of this.session_menu['subject_birth_date']) {
        birthDates.push(date);
      }
      return birthDates.includes(d.toISOString().split('T')[0]);
    };


  }

  private _filter(value: string, menuType: string): string[] {
    const filterValue = value.toLowerCase();
    const result =  this.session_menu[menuType].filter(menu_items => {
      if (menu_items && menu_items.toLowerCase().includes(filterValue)) {
        return true;
      }
    });
    return result;

  }

  updateMenu() {
    const menuRequest = this.filterRequests();
    if (Object.entries(menuRequest).length > 1) {
      menuRequest['order__'] = 'lab_name';
      this.allSessionsService.getSessionMenu(menuRequest);
      this.allSessionsService.getSessionMenuLoadedListener()
        .subscribe((sessions: any) => {
          this.createMenu(sessions);
        });
    }
  }

  stepBackMenu(event) {
    let focusOn: string;
    if (event.checked) {
      focusOn = 'sex';
    } else {
      focusOn = event.target.name;
    }
    const referenceMenuReq = this.filterRequests(focusOn);
    if (Object.entries(referenceMenuReq) && Object.entries(referenceMenuReq).length > 0) {
      referenceMenuReq['order__'] = 'lab_name';
      this.allSessionsService.getSessionMenu(referenceMenuReq);
      this.allSessionsService.getSessionMenuLoadedListener()
        .subscribe((sessions: any) => {
          this.createMenu(sessions);
        });
    } else {
      this.createMenu(this.allSessions);
    }

  }
  genderSelected(genderForm) {
    return genderForm.includes(true);
  }

  filterRequests(focusedField?: string) {
    const filterList = Object.entries(this.session_filter_form.getRawValue());
    const requestFilter = {};
    let requestJSONstring = '';
    filterList.forEach(filter => {
      // filter is [["lab_name_control", "somelab"], ["subject_nickname_control", null]...]
      const filterKey = filter[0].split('_control')[0]; // filter[0] is control name like 'lab_name_control'
      if (filter[1] && filterKey !== focusedField) {
        if (filterKey === 'sex' && this.genderSelected(filter[1])) {
          // only accepts single selection - this case the last selection.
          // TODO:coordinate with API for multi-selection
          let requestedGender: string;
          const requestGenderArray = [];
          for (const index in filter[1]) {
            if (filter[1][index]) {
              requestedGender = Object.keys(this.session_menu['sex'])[index];
              // console.log('type of JSON.stringify({sex: requestedGender}) is: ', typeof JSON.stringify({ 'sex': requestedGender}));
              requestGenderArray.push(JSON.stringify({ 'sex': requestedGender}));
              // requestedGender = this.session_menu['sex'][index];
            }
          }
          if (requestJSONstring.length > 0) {
            requestJSONstring += ',' + '[' + requestGenderArray + ']';
          } else {
            requestJSONstring += '[' + requestGenderArray + ']';
          }

          // requestFilter['__json'] = '[' + requestGenderArray + ']';
        } else if (filterKey !== 'sex') {
          // making sure gender filter gets removed from the request

          if (filterKey === 'subject_birth_date') {
            // Tue Dec 11 2018 00:00:00 GMT-0600 (Central Standard Time) => 2018-12-11T06:00:00.000Z => 2018-12-11
            const mouseDOB = new Date(filter[1].toString());
            requestFilter[filterKey] = mouseDOB.toISOString().split('T')[0];
          } else if (filterKey === 'session_start_time') {
              if (!this.dateRangeToggle) {
                const sessionST = new Date(filter[1].toString());
                const rangeStartTime = '00:00:00';
                const rangeEndTime = '23:59:59';
                const startString = sessionST.toISOString().split('T')[0] + 'T' + rangeStartTime;
                const endString = sessionST.toISOString().split('T')[0] + 'T' + rangeEndTime;
                const rangeStart = '"' + 'session_start_time>' + '\'' + startString + '\'' + '"';
                const rangeEnd = '"' + 'session_start_time<' + '\'' + endString + '\'' + '"';
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
                const rangeStart = '"' + 'session_start_time>' + '\'' + startString + '\'' + '"';
                const rangeEnd = '"' + 'session_start_time<' + '\'' + endString + '\'' + '"';
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
                const rangeStart = '"' + 'session_start_time>' + '\'' + startString + '\'' + '"';
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
                const rangeEnd = '"' + 'session_start_time<' + '\'' + endString + '\'' + '"';
                if (requestJSONstring.length > 0) {
                  requestJSONstring += ',' + rangeEnd;
                } else {
                  requestJSONstring += rangeEnd;
                }
            }
          } else if (filterKey === 'nplot') {
              filter[1] ? requestFilter[filterKey] = 1 : requestFilter[filterKey] = 0;
          } else {
            requestFilter[filterKey] = filter[1];
          }
        }
        // if ((requestGenderArray && requestGenderArray.length > 0) || (rangeStart && rangeStart.length > 0)) {
        //   console.log('gender or session start time restricted');
        //   requestFilter['__json'] = '[' + requestGenderArray + rangeStart + ',' + rangeEnd + ']';
        // }

        if (requestJSONstring.length > 0) {
          requestFilter['__json'] = '[' + requestJSONstring + ']';
        }
      }
    });
    return requestFilter;
  }

  applyFilter() {
    this.loading = true;
    this.sessions = [];
    const request = this.filterRequests();
    request['__order'] = 'session_start_time DESC';
    if (Object.entries(request) && Object.entries(request).length > 1) {
      this.filterStoreService.storeSessionFilter(request);
      this.allSessionsService.retrieveSessions(request);
      this.allSessionsService.getNewSessionsLoadedListener()
        .subscribe((sessions: any) => {
          this.loading = false;
          this.sessions = sessions;
          this.dataSource = new MatTableDataSource(this.sessions);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        });
    } else {
      this.resetFilter();
    }
  }

  resetFilter() {
    this.loading = true;
    this.allSessionsService.retrieveSessions({'__order': 'session_start_time DESC'});
    this.filterStoreService.clearSessionFilter();
    this.allSessionsService.getNewSessionsLoadedListener()
      .subscribe((sessions: any) => {
        this.loading = false;
        this.sessions = sessions;
        this.allSessions = sessions;
        this.dataSource = new MatTableDataSource(this.sessions);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
  }

  clearControl() {
    for (const control in this.session_filter_form.controls) {
      const toReset = {}
      
      if (control === 'session_range_filter') {
        toReset[control] = { 'session_range_start_control': null, 'session_range_end_control': null}
        
      } else if (control === 'sex_control') {
        toReset[control] = [false, false, false];
        for (const index in this.session_filter_form.get(control)['controls']) {
          this.session_filter_form.get(control).get([index]).enable();
        }
      } else {
        toReset[control] = '';
      }
      this.session_filter_form.patchValue(toReset); 
    }
    this.filterStoreService.clearSessionTableState();
    this.paginator.pageSize = 25;
    this.paginator.pageIndex = null;
    // the below sort is to reset the arrow UI that doesn't go away after this.sort.active = '' 
    this.sort.sortables.forEach(sortItem => {
      this.sort.sort(sortItem);
    });

    this.sort.active = '';

    // console.log(this.route.queryParams);
    this.route.queryParams.subscribe(param => {
      if (Object.keys(param).length > 0) {
        this.router.navigate(
          [],
          {
            relativeTo: this.route,
            queryParams: null
          });
      } else {
        this.applyFilter();
      }
     });
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
      if (event.active !== 'nplot') {
        sorter[event.active] = { 'direction': event.direction };
      }
    }
    this.filterStoreService.storeSessionTableState(pageIndex, pageSize, sorter);
  }

  sessionSelected(session) {
    console.log(session);
    this.selectedSession = session;
  }

}
