import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { AllSessionsService } from './all-sessions.service';
import { SessionComponent } from './session/session.component';

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

    lab_name_control: new FormControl(),
    subject_nickname_control: new FormControl(),
    subject_uuid_control: new FormControl(),
    sex_control: new FormArray([]),
    subject_birth_date_control: new FormControl(),
    subject_line_control: new FormControl(),
    responsible_user_control: new FormControl()
  });

  sessions;
  allSessions;
  sessionDateFilter: Function;
  miceBirthdayFilter: Function;
  sessionMinDate: Date;
  sessionMaxDate: Date;
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
                              'session_uuid', 'sex', 'subject_uuid'];

  // setup for the paginator
  dataSource;
  pageSize = 25;
  pageSizeOptions: number[] = [10, 25, 50, 100];

  queryValues = {
    'task_protocol': '_iblrig_tasks_habituationChoiceWorld3.7.6',
    // '__order': 'session_start_time'
  };

  selectedSession = {};

  private sessionsSubscription: Subscription;

  constructor(private route: ActivatedRoute, private router: Router, public allSessionsService: AllSessionsService) {}
  @Input('preRestriction') preRestrictedMouseInfo: Object;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit() {
    console.log('onInit');
    this.route.queryParams
      .subscribe(params => {
        for (const key in params) {
          const controlName = key + '_control';
          if (this.session_filter_form.controls[controlName] && controlName !== 'sex_control') {
            const toPatch = {};
            toPatch[controlName] = params[key];
            this.session_filter_form.patchValue(toPatch)
            // this.session_filter_form.controls[controlName].value = params[key]; //what displays on the filter
            // this.session_filter_form.value[controlName] = params[key]; // the actual value of the filter
          };
        };
        this.applyFilter();
        // console.log(this.session_filter_form.controls);
        // this.allSessionsService.retrieveSessions(params);
        // this.sessionsSubscription = this.allSessionsService.getNewSessionsLoadedListener()
        //   .subscribe((sessions: any) => {
        //     this.sessions = sessions.reverse();
        //     this.dataSource = new MatTableDataSource(this.sessions);
        //     this.dataSource.sort = this.sort;
        //     this.dataSource.paginator = this.paginator;
        //     this.createMenu(this.sessions);
        //   });
      });
    // TODO: create menu content using separate api designated for menu instead of getting all session info
    this.allSessionsService.getAllSessions();
        this.sessionsSubscription = this.allSessionsService.getSessionsLoadedListener()
          .subscribe((sessions: any) => {
            this.allSessions = sessions;
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
      this.session_menu[key] = [];
    }
    for (const session of sessions) {
      for (const key of keys) {
        if (!this.session_menu[key].includes(session[key])) {
          this.session_menu[key].push(session[key]);
        }
      }
    }

    // create formcontrol for item in menus
    const sex_control_array = <FormArray>this.session_filter_form.controls['sex_control'];
    sex_control_array.controls.length = 0;
    for (const item of this.session_menu['sex']) {
      sex_control_array.push(new FormControl(false));
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
    if (Object.entries(menuRequest).length > 0) {
      this.allSessionsService.retrieveSessions(menuRequest);
      this.allSessionsService.getNewSessionsLoadedListener()
        .subscribe((sessions: any) => {
          this.createMenu(sessions);
        });
    }
  }

  stepBackMenu(event) {
    console.log('detected focus in menu');
    console.log(event.target.name);
    const referenceMenuReq = this.filterRequests(event.target.name);
    if (Object.entries(referenceMenuReq).length > 0) {
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
    const filterList = Object.entries(this.session_filter_form.value);
    console.log(this.session_filter_form.value);
    const requestFilter = {};
    filterList.forEach(filter => {
      // filter is [["lab_name_control", "somelab"], ["subject_nickname_control", null]...]
      const filterKey = filter[0].split('_control')[0]; // filter[0] is control name like 'lab_name_control'
      if (filter[1] && filterKey !== focusedField) {
        if (filterKey === 'sex' && this.genderSelected(filter[1])) {
          // only accepts single selection - this case the last selection. TODO:coordinate with API for multi-selection
          let requestedGender: string;
          for (const index in filter[1]) {
            if (filter[1][index]) {
              requestedGender = this.session_menu['sex'][index];
            }
          }
          requestFilter[filterKey] = requestedGender;
        } else if (filterKey !== 'sex') {
          // making sure gender filter gets removed from the request

          if (filterKey === 'subject_birth_date') {
            // Tue Dec 11 2018 00:00:00 GMT-0600 (Central Standard Time) => 2018-12-11T06:00:00.000Z => 2018-12-11
            const mouseDOB = new Date(filter[1].toString());
            console.log(mouseDOB.toISOString());
            requestFilter[filterKey] = mouseDOB.toISOString().split('T')[0];
          } else {
            requestFilter[filterKey] = filter[1];
          }
        }
      }
    });
    return requestFilter;
  }

  applyFilter() {
    this.sessions = [];
    const request = this.filterRequests();
    request['__order'] = 'session_start_time';
    console.log('requesting', request);
    if (Object.entries(request).length > 1) {
      this.allSessionsService.retrieveSessions(request);
      this.allSessionsService.getNewSessionsLoadedListener()
        .subscribe((sessions: any) => {
          sessions.reverse();
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
    this.allSessionsService.getAllSessions();
    this.allSessionsService.getSessionsLoadedListener()
      .subscribe((sessions: any) => {
        sessions.reverse();
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
      
      console.log(toReset);
      if (control !== 'sex_control') {
        toReset[control] = '';
      } else {
        toReset[control] = [false, false, false];
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
    console.log('sessionSelected in list-component ran!');
    console.log(session);
    this.selectedSession = session;
  }


}
