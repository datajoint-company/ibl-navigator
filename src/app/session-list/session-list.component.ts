import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AllSessionsService } from './all-sessions.service';

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css']
})
export class SessionListComponent implements OnInit, OnDestroy {
  session_filter_form = new FormGroup({
    task_protocol_control : new FormControl(),
    session_uuid_control : new FormControl(),
    session_date_control : new FormControl()
  });
  sessions;
  allSessions;
  sessionDateFilter: Function;
  sessionMinDate: Date;
  sessionMaxDate: Date;
  filteredTaskProtocolOptions: Observable<string[]>;
  filteredSessionUuidOptions: Observable<string[]>;
  session_menu = {};
  task_protocol_menu = [];
  session_start_time_menu = [];
  session_end_time_menu = [];
  session_uuid_menu = [];
  lab_name_menu = [];
  subject_nickname_menu = [];

  queryValues = {
    'subject_nickname': 'IBL-T1',
    'session_uuid': 'b5433979-abbc-4ff3-90c0-09ea7b3f8198'
  };

  selectedSession = {};

  private sessionsSubscription: Subscription;

  constructor(public allSessionsService: AllSessionsService) { }

  ngOnInit() {
    console.log('onInit');
    this.allSessionsService.getAllSessions();
    // this.allSessionsService.retrieveSessions(this.queryValues);

    this.sessionsSubscription = this.allSessionsService.getSessionsLoadedListener()
      .subscribe((sessions: any) => {
        console.log('got all sessions ---');
        console.log('total session length: ' + sessions.length);
        this.sessions = sessions;
        this.allSessions = sessions;
        this.updateMenu(sessions);
    });
  }

  ngOnDestroy() {
    if (this.sessionsSubscription) {
      this.sessionsSubscription.unsubscribe();
    }
  }
  private updateMenu(sessions) {
    this.session_menu = {};
    this.task_protocol_menu = [];
    this.session_start_time_menu = [];
    this.session_end_time_menu = [];
    this.session_uuid_menu = [];
    this.lab_name_menu = [];
    this.subject_nickname_menu = [];
    for (const session of sessions) {
      if (!this.task_protocol_menu.includes(session['task_protocol'])) {
        this.task_protocol_menu.push(session['task_protocol']);
      }
      this.session_menu['task_protocol'] = this.task_protocol_menu;

      if (!this.session_start_time_menu.includes(session['session_start_time'])) {
        this.session_start_time_menu.push(session['session_start_time']);
      }
      this.session_menu['session_start_time'] = this.session_start_time_menu;

      if (!this.session_end_time_menu.includes(session['session_end_time'])) {
        this.session_end_time_menu.push(session['session_end_time']);
      }
      this.session_menu['session_end_time'] = this.session_end_time_menu;

      if (!this.session_uuid_menu.includes(session['session_uuid'])) {
        this.session_uuid_menu.push(session['session_uuid']);
      }
      this.session_menu['session_uuid'] = this.session_uuid_menu;

      if (!this.lab_name_menu.includes(session['lab_name'])) {
        this.lab_name_menu.push(session['lab_name']);
      }
      this.session_menu['lab_name'] = this.lab_name_menu;

      if (!this.subject_nickname_menu.includes(session['subject_nickname'])) {
        this.subject_nickname_menu.push(session['subject_nickname']);
      }
      this.session_menu['subject_nickname'] = this.subject_nickname_menu;
    }

    this.filteredTaskProtocolOptions = this.session_filter_form.controls.task_protocol_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'task_protocol'))
      );

    this.filteredSessionUuidOptions = this.session_filter_form.controls.session_uuid_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'session_uuid'))
      );
    this.sessionDateFilter = (d: Date): boolean => {
      const sessionDates = [];
      for (const date of this.session_menu['session_start_time']) {
        sessionDates.push(date.split('T')[0]);
      }

      // filter out dates without any session
      return sessionDates.includes(d.toISOString().split('T')[0]);
    };
    const sessionSeconds = [];
    for (const date of this.session_menu['session_start_time']) {
      sessionSeconds.push(new Date(date).getTime());
    }
    this.sessionMinDate = new Date(Math.min(...sessionSeconds));
    this.sessionMaxDate = new Date(Math.max(...sessionSeconds));
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

  updateSessionFilter(event) {
    console.log('blur detected');
    console.log('form group content');
    console.log(typeof this.session_filter_form.value);
    // for (const item of this.session_filter_form.value) {
    //   console.log('insde for loop');
    //   console.log(item);
    // }
    const newQuery = {};
    for ( const entry of Object.entries(this.session_filter_form.value)) {
      // entry is ["task_protocol_control", "_iblrig_tasks_trainingChoiceWorld3.7.6"]
      if (entry[1]) {
        newQuery[entry[0].split('_control')[0]] = entry[1];
      }
    }
    console.log('newQuery is');
    console.log(newQuery);
    console.log(this.session_filter_form);
    if (event.target.value) {
      const queryFor = {};
      queryFor[event.target.name] = event.target.value;
      console.log('queryFor is');
      console.log(queryFor);
      // this.allSessionsService.retrieveSessions(queryFor);
      this.allSessionsService.retrieveSessions(newQuery);
      this.sessionsSubscription = this.allSessionsService.getNewSessionsLoadedListener()
        .subscribe((sessions: any) => {
          console.log('retrieved new sessions ---');
          console.log(sessions.length);
          this.sessions = sessions;
          this.updateMenu(sessions);
        });
    } else {
      console.log('total number of sessions: ' + this.sessions.length);
      this.sessions = this.allSessions;
      this.updateMenu(this.allSessions);
    }
  }

  sessionSelected(session) {
    console.log('sessionSelected in list-component ran!');
    console.log(session);
    this.selectedSession = session;
  }
}
