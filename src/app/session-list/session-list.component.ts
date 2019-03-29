import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AllSessionsService } from './all-sessions.service';

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css']
})
export class SessionListComponent implements OnInit, OnDestroy {
  task_protocol_control = new FormControl();
  session_uuid_control = new FormControl();
  sessions;
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

  private sessionsSubscription: Subscription;

  constructor(public allSessionsService: AllSessionsService) { }

  ngOnInit() {
    this.allSessionsService.getAllSessions();
    this.sessionsSubscription = this.allSessionsService.getSessionsLoadedListener()
      .subscribe((sessions: any) => {
        this.sessions = sessions;
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

        this.filteredTaskProtocolOptions = this.task_protocol_control.valueChanges
          .pipe(
            startWith(''),
            map(value => this._filter(value, 'task_protocol'))
          );

        this.filteredSessionUuidOptions = this.session_uuid_control.valueChanges
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
    });
  }
  ngOnDestroy() {
    if (this.sessionsSubscription) {
      this.sessionsSubscription.unsubscribe();
    }
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

  
}
