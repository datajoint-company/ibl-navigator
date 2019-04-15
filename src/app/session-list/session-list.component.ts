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

  queryValues = {
    'task_protocol': '_iblrig_tasks_habituationChoiceWorld3.7.6',
    // '__order': 'session_start_time'
  };

  selectedSession = {};

  private sessionsSubscription: Subscription;

  constructor(public allSessionsService: AllSessionsService) { }

  ngOnInit() {
    console.log('onInit');
    this.allSessionsService.getAllSessions();
    // this.allSessionsService.retrieveSessions(this.queryValues);
    // this.sessionsSubscription = this.allSessionsService.getNewSessionsLoadedListener()
    this.sessionsSubscription = this.allSessionsService.getSessionsLoadedListener()
      .subscribe((sessions: any) => {
        console.log('got all sessions ---');
        console.log('total session length: ' + sessions.length);
        this.sessions = sessions.slice(0, 50);
        this.allSessions = this.sessions;
        this.updateMenu(this.sessions);
    });
  }

  ngOnDestroy() {
    if (this.sessionsSubscription) {
      this.sessionsSubscription.unsubscribe();
    }
  }
  private updateMenu(sessions) {
    this.session_menu = {};
    const keys = ['task_protocol', 'session_start_time', 'session_uuid'];
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
