import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
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
    session_date_control : new FormControl(),

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

  // setup for sorting table
  sortedSessions: [];



  queryValues = {
    'task_protocol': '_iblrig_tasks_habituationChoiceWorld3.7.6',
    // '__order': 'session_start_time'
  };

  selectedSession = {};

  private sessionsSubscription: Subscription;

  constructor(public allSessionsService: AllSessionsService) {
    // if (this.sessions) {
    //   this.sortedSessions = this.sessions.slice();
    // }
  }

  @ViewChild(SessionComponent) sessionComponent: SessionComponent;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit() {
    console.log('onInit');
    this.allSessionsService.getAllSessions();
    // this.allSessionsService.retrieveSessions(this.queryValues);
    // this.sessionsSubscription = this.allSessionsService.getNewSessionsLoadedListener()
    this.sessionsSubscription = this.allSessionsService.getSessionsLoadedListener()
      .subscribe((sessions: any) => {
        console.log('got all sessions ---');
        console.log('total session length: ' + sessions.length);
        sessions = sessions.reverse();
        this.allSessions = sessions;
        this.dataSource = new MatTableDataSource(sessions);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.sessions = sessions.slice(0, 50);
        this.createMenu(this.allSessions);
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
    const request = this.filterRequests();
    request['__order'] = 'session_start_time';

    if (Object.entries(request).length > 0) {
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

  applyResetFilter() {
    this.sessions = [];
    this.sessions = this.allSessions;
    this.createMenu(this.allSessions);

  }
  sessionSelected(session) {
    console.log('sessionSelected in list-component ran!');
    console.log(session);
    this.selectedSession = session;
  }

  // sortData(sort: Sort) {
  //   if (this.sessions) {
  //     const data = this.sessions.slice();
  //     if (!sort.active || sort.direction === '') {
  //       this.sortedSessions = data;
  //       return;
  //     }

  //     this.sortedSessions = data.sort((a, b) => {
  //       const isAsc = sort.direction === 'asc';
  //       switch (sort.active) {
  //         case 'labName': return compare(a.ab_name, b.ab_name, isAsc);
  //         case 'subjectNickname': return compare(a.subject_nickname, b.subject_nickname, isAsc);
  //         case 'sessionStart': return compare(a.session_start_time, b.session_start_time, isAsc);
  //         case 'subjectLine': return compare(a.subject_line, b.subject_line, isAsc);
  //         case 'responsibleUser': return compare(a.responsible_user, b.responsible_user, isAsc);
  //         case 'subjectDOB': return compare(a.subject_birth_date, b.subject_birth_date, isAsc);
  //         case 'taskProtocol': return compare(a.task_protocol, b.task_protocol, isAsc);
  //         case 'gender': return compare(a.sex, b.sex, isAsc);
  //         default: return 0;
  //       }
  //     });
  //   }


  //   function compare(a: Date | string, b: Date | string, isAsc: boolean) {
  //     return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  //   }
  // }


}
