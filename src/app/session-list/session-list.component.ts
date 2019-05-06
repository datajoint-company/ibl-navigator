import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { AllSessionsService } from './all-sessions.service';
import { SessionComponent } from './session/session.component';
import { noComponentFactoryError } from '@angular/core/src/linker/component_factory_resolver';


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
  filteredSubjectUuidOptions: Observable<string[]>;
  filteredSubjectLineOptions: Observable<string[]>;
  filteredResponsibleUserOptions: Observable<string[]>;
  session_menu = {};
  // setup for the table columns
  displayedColumns: string[] = ['lab_name', 'subject_nickname', 'subject_birth_date', 'session_start_time',
                              'task_protocol', 'subject_line', 'responsible_user',
                              'session_uuid', 'sex', 'subject_uuid', 'nplot'];
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

  constructor(private route: ActivatedRoute, private router: Router, public allSessionsService: AllSessionsService) {}
  // @Input('preRestriction') preRestrictedMouseInfo: Object;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit() {
    this.loading = true;
    console.log('onInit');
    this.session_menu['sex'] = { F: null, M: null, U: null };
    this.route.queryParams
      .subscribe(params => {
        for (const key in params) {
          const controlName = key + '_control';
          if (this.session_filter_form.controls[controlName]) {
            if (controlName !== 'sex_control') {
              const toPatch = {};
              toPatch[controlName] = params[key];
              this.session_filter_form.patchValue(toPatch)
            } else {
              this.session_filter_form.controls.sex_control['controls'][this.genderForm2MenuMap[params[key]]].patchValue(true);
            }
          };
        };
        this.applyFilter();

      });
    // TODO: create menu content using separate api designated for menu instead of getting all session info
    this.allSessionsService.getAllSessions();
        this.sessionsSubscription = this.allSessionsService.getSessionsLoadedListener()
          .subscribe((sessions: any) => {
            this.allSessions = sessions;
            this.createMenu(sessions);
          });
  }

  ngOnDestroy() {
    if (this.sessionsSubscription) {
      this.sessionsSubscription.unsubscribe();
    }
  }

  private createMenu(sessions) {
    this.session_menu = {};
    const keys = ['task_protocol', 'session_start_time',
    'session_uuid', 'lab_name', 'subject_birth_date', 'subject_line',
    'subject_uuid', 'sex', 'subject_nickname', 'responsible_user'];
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
      this.allSessionsService.retrieveSessions(menuRequest);
      this.allSessionsService.getNewSessionsLoadedListener()
        .subscribe((sessions: any) => {
          this.createMenu(sessions);
        });
    }
  }

  stepBackMenu(event) {
    const referenceMenuReq = this.filterRequests(event.target.name);
    if (Object.entries(referenceMenuReq) && Object.entries(referenceMenuReq).length > 0) {
      this.allSessionsService.retrieveSessions(referenceMenuReq);
      this.allSessionsService.getNewSessionsLoadedListener()
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
    console.log('filterList is...');
    console.log(filterList);
    const requestFilter = {};
    let requestJSONstring = '';
    filterList.forEach(filter => {
      console.log(filter);
      // filter is [["lab_name_control", "somelab"], ["subject_nickname_control", null]...]
      const filterKey = filter[0].split('_control')[0]; // filter[0] is control name like 'lab_name_control'
      if (filter[1] && filterKey !== focusedField) {
        if (filterKey === 'sex' && this.genderSelected(filter[1])) {
          console.log('session_menu[sex] keys are, ', Object.keys(this.session_menu['sex']));
          console.log('filter[1]: ', filter[1]);
          // only accepts single selection - this case the last selection.
          // TODO:coordinate with API for multi-selection
          let requestedGender: string;
          const requestGenderArray = [];
          for (const index in filter[1]) {
            if (filter[1][index]) {
              console.log('logging filter[1][', index, ']', filter[1][index]);
              requestedGender = Object.keys(this.session_menu['sex'])[index];
              // console.log('type of JSON.stringify({sex: requestedGender}) is: ', typeof JSON.stringify({ 'sex': requestedGender}));
              requestGenderArray.push(JSON.stringify({ 'sex': requestedGender}));
              // requestedGender = this.session_menu['sex'][index];
            }
          }
          console.log('requestGenderArray is...: ', requestGenderArray);
          if (requestJSONstring.length > 0) {
            requestJSONstring += ',' + '[' + requestGenderArray + ']';
          } else {
            requestJSONstring += '[' + requestGenderArray + ']';
          }
          
          console.log('requestJSONString after adding genderArray is: ', requestJSONstring);
          // requestFilter['__json'] = '[' + requestGenderArray + ']';
        } else if (filterKey !== 'sex') {
          // making sure gender filter gets removed from the request

          if (filterKey === 'subject_birth_date') {
            // Tue Dec 11 2018 00:00:00 GMT-0600 (Central Standard Time) => 2018-12-11T06:00:00.000Z => 2018-12-11
            const mouseDOB = new Date(filter[1].toString());
            console.log(mouseDOB.toISOString());
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
                console.log('requestJSONString before adding ranges is: ', requestJSONstring);
                if (requestJSONstring.length > 0) {
                  requestJSONstring += ',' + rangeStart + ',' + rangeEnd;
                } else {
                  requestJSONstring += rangeStart + ',' + rangeEnd;
                }
                console.log('requestJSONString after adding ranges is: ', requestJSONstring);
              }
          } else if (filterKey === 'session_range_filter') {
            console.log('inside from/to selector - filterKey is: ', filterKey);
            //// Note: filter =
            ////      ["session_range_filter", { session_range_start_control: null, session_range_end_control: null }]
            if (this.dateRangeToggle && filter[1]['session_range_start_control'] && filter[1]['session_range_end_control']) {
                console.log('range requested!');
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
                console.log('all session from ', filter[1]['session_range_start_control'], ' requested!');
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
                console.log('all session up to ', filter[1]['session_range_end_control'], ' requested!');
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
          console.log('requestJSONstring is : ', requestJSONstring);
          requestFilter['__json'] = '[' + requestJSONstring + ']';
        }
      }
    });
    console.log('requestFilter is: ', requestFilter);
    return requestFilter;
  }

  applyFilter() {
    this.loading = true;
    this.sessions = [];
    const request = this.filterRequests();
    request['__order'] = 'session_start_time DESC';
    if (Object.entries(request) && Object.entries(request).length > 1) {
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
    this.allSessionsService.retrieveSessions({'__order': 'session_start_time DESC'});
    this.allSessionsService.getNewSessionsLoadedListener()
      .subscribe((sessions: any) => {
        this.loading = false;
        this.sessions = sessions;
        this.dataSource = new MatTableDataSource(this.sessions);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
  }

  clearControl() {
    console.log('control cleared');
    for (const control in this.session_filter_form.controls) {
      console.log(control);
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
    console.log(this.route.queryParams);
    this.route.queryParams.subscribe(param => {
      console.log('queryParams', param);
      console.log(Object.keys(param).length);
      if (Object.keys(param).length > 0) {
        console.log('route params exist');
        this.router.navigate(
          [],
          {
            relativeTo: this.route,
            queryParams: null
          });
      } else {
        console.log('queryParam not there');
        this.applyFilter();
      }
     });
  }
  sessionSelected(session) {
    console.log(session);
    this.selectedSession = session;
  }

}
