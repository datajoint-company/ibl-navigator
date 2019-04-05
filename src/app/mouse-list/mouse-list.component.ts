import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { AllMiceService } from './all-mice.service';

@Component({
  selector: 'app-mouse-list',
  templateUrl: './mouse-list.component.html',
  styleUrls: ['./mouse-list.component.css']
})
export class MouseListComponent implements OnInit, OnDestroy {
  mouse_filter_form = new FormGroup({
    lab_name_control: new FormControl(),
    subject_nickname_control : new FormControl(),
    subject_uuid_control : new FormControl(),
    sex_control : new FormControl(),
    subject_birth_date_control : new FormControl(),
    subject_line_control : new FormControl(),
    responsible_user_control : new FormControl()
  });
  mice;
  allmice;
  miceBirthdayFilter: Function;
  mice_menu = {};
  lab_name_menu = [];
  subject_birth_date_menu = [];
  subject_line_menu = [];
  subject_uuid_menu = [];
  sex_menu = [];
  subject_nickname_menu = [];
  responsible_user_menu = [];

  filteredLabNameOptions: Observable<string[]>;
  filteredSubjectNicknameOptions: Observable<string[]>;
  filteredSubjectUuidOptions: Observable<string[]>;
  filteredSubjectLineOptions: Observable<string[]>;
  filteredResponsibleUserOptions: Observable<string[]>;

  private miceSubscription: Subscription;

  constructor(public allMiceService: AllMiceService) { }

  ngOnInit() {
    this.allMiceService.getAllMice();
    this.miceSubscription = this.allMiceService.getMiceLoadedListener()
      .subscribe((mice: any) => {
        this.mice = mice;
        this.updateMenu(mice);
      });
  }

  ngOnDestroy() {
    if (this.miceSubscription) {
      this.miceSubscription.unsubscribe();
    }
  }


  private updateMenu(mice) {
    this.mice_menu = {};
    this.lab_name_menu = [];
    this.subject_birth_date_menu = [];
    this.subject_line_menu = [];
    this.subject_uuid_menu = [];
    this.sex_menu = [];
    this.subject_nickname_menu = [];
    this.responsible_user_menu = [];
    for (const mouse of mice) {
      if (!this.lab_name_menu.includes(mouse['lab_name'])) {
        this.lab_name_menu.push(mouse['lab_name']);
      }
      this.mice_menu['lab_name'] = this.lab_name_menu;

      if (!this.subject_birth_date_menu.includes(mouse['subject_birth_date'])) {
        this.subject_birth_date_menu.push(mouse['subject_birth_date']);
      }
      this.mice_menu['subject_birth_date'] = this.subject_birth_date_menu;

      if (!this.subject_line_menu.includes(mouse['subject_line'])) {
        this.subject_line_menu.push(mouse['subject_line']);
      }
      this.mice_menu['subject_line'] = this.subject_line_menu;

      if (!this.subject_uuid_menu.includes(mouse['subject_uuid'])) {
        this.subject_uuid_menu.push(mouse['subject_uuid']);
      }
      this.mice_menu['subject_uuid'] = this.subject_uuid_menu;

      if (!this.sex_menu.includes(mouse['sex'])) {
        this.sex_menu.push(mouse['sex']);
      }
      this.mice_menu['sex'] = this.sex_menu;

      if (!this.subject_nickname_menu.includes(mouse['subject_nickname'])) {
        this.subject_nickname_menu.push(mouse['subject_nickname']);
      }
      this.mice_menu['subject_nickname'] = this.subject_nickname_menu;

      if (!this.responsible_user_menu.includes(mouse['responsible_user'])) {
        this.responsible_user_menu.push(mouse['responsible_user']);
      }
        this.mice_menu['responsible_user'] = this.responsible_user_menu;
    }

    this.filteredLabNameOptions = this.mouse_filter_form.controls.lab_name_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'lab_name'))
      );

    this.filteredSubjectNicknameOptions = this.mouse_filter_form.controls.subject_nickname_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'subject_nickname'))
      );

    this.filteredSubjectUuidOptions = this.mouse_filter_form.controls.subject_uuid_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'subject_uuid'))
      );

    this.filteredSubjectLineOptions = this.mouse_filter_form.controls.subject_line_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'subject_line'))
      );

    this.filteredResponsibleUserOptions = this.mouse_filter_form.controls.responsible_user_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'responsible_user'))
      );

    this.miceBirthdayFilter = (d: Date): boolean => {
      const birthDates = [];
      for (const date of this.mice_menu['subject_birth_date']) {
        birthDates.push(date);
      }
      return birthDates.includes(d.toISOString().split('T')[0]);
    };
  }
  private _filter(value: string, menuType: string): string[] {
    const filterValue = value.toLowerCase();
    const result = this.mice_menu[menuType].filter(menu_items => {
      if (menu_items && menu_items.toLowerCase().includes(filterValue)) {
        return true;
      }
    });
    return result;
  }

}
