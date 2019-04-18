import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
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
    sex_control : new FormArray([]),
    subject_birth_date_control : new FormControl(),
    subject_line_control : new FormControl(),
    responsible_user_control : new FormControl()
  });
  mice;
  allMice;
  miceBirthdayFilter: Function;
  mice_menu = {};

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
        this.allMice = mice;
        this.createMenu(mice);
      });
  }

  ngOnDestroy() {
    if (this.miceSubscription) {
      this.miceSubscription.unsubscribe();
    }
  }


  private createMenu(mice) {
    this.mice_menu = {};


    const keys = ['lab_name', 'subject_birth_date', 'subject_line', 'subject_uuid', 'sex', 'subject_nickname', 'responsible_user'];


    // initialize all entries into an empty list
    for (const key of keys) {
      this.mice_menu[key] = [];
    }


  // find unique entries for each key
  for (const mouse of mice) {

    for (const key of keys) {
      if (!this.mice_menu[key].includes(mouse[key])) {
        this.mice_menu[key].push(mouse[key]);
      }
    }
  }

    // create formcontrol for item in menus
    const sex_control_array = <FormArray>this.mouse_filter_form.controls['sex_control'];
    sex_control_array.controls.length = 0;
    for (const item of this.mice_menu['sex']) {
      sex_control_array.push(new FormControl(false));
    }

    // for autocomplete search bar
    // const autoCompleteList = ['lab_name', 'subject_nickname', 'subject_uuid', 'subject_line', 'responsible_user'];

    // for (const field of autoCompleteList) {
    //   const word = [];
    //   field.split('_').forEach((item) => {
    //     word.push(item.charAt(0).toUpperCase() + item.slice(1));
    //   });
    //   let filterName = 'filtered' + word.join('') + 'Options'; // filteredLabNameOptions
    //   console.log(filterName);
    //   this.`${filterName}` = this.mouse_filter_form.controls[field + '_control'].valueChanges
    //     .pipe(
    //       startWith(''),
    //       map(value => this._filter(value, field))
    //     );
    // }
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

  applyFilter() {
    const request = this.filterRequests();

    if (Object.entries(request).length > 0) {
      this.allMiceService.retrieveMice(request);
      this.allMiceService.getRequestedMiceLoadedListener()
        .subscribe((mice: any) => {
          this.mice = mice;
      });
    }
  }

  updateMenu() {
    console.log('detected selection in mouse list menu');
    // console.log(this.mouse_filter_form.value);
    const menuRequest = this.filterRequests();
    if (Object.entries(menuRequest).length > 0) {
      this.allMiceService.retrieveMice(menuRequest);
      this.allMiceService.getRequestedMiceLoadedListener()
        .subscribe((mice: any) => {
          this.createMenu(mice);
        });
    }
  }

  stepBackMenu(event) {
    console.log('detected focus in menu');
    console.log(event.target.name);
    const referenceMenuReq = this.filterRequests(event.target.name);
    if (Object.entries(referenceMenuReq).length > 0) {
      this.allMiceService.retrieveMice(referenceMenuReq);
      this.allMiceService.getRequestedMiceLoadedListener()
        .subscribe((mice: any) => {
          this.createMenu(mice);
        });
    } else {
      this.createMenu(this.allMice);
    }

  }

  genderSelected(genderForm) {
    return genderForm.includes(true);
  }

  filterRequests(focusedField?: string) {
    const filterList = Object.entries(this.mouse_filter_form.value);
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
              requestedGender = this.mice_menu['sex'][index];
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
}
