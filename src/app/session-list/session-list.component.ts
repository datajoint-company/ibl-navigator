import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AllSessionsService } from './all-sessions.service';

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css']
})
export class SessionListComponent implements OnInit, OnDestroy {
  sessionMenuControl = new FormControl();
  sessions;
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
    });
  }
  ngOnDestroy() {
    if (this.sessionsSubscription) {
      this.sessionsSubscription.unsubscribe();
    }
  }
}
