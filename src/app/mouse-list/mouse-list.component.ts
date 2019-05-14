import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { AllMiceService } from './all-mice.service';
import { FilterStoreService } from '../filter-store.service';

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
    sex_control: new FormArray([new FormControl(), new FormControl(), new FormControl()]),
    subject_birth_date_control : new FormControl(),
    subject_line_control : new FormControl(),
    responsible_user_control : new FormControl()
  });
  loading = true;
  mice;
  allMice;
  miceBirthdayFilter: Function;
  mice_menu = {};
  // setup for the table columns
  displayedColumns: string[] = ['lab_name', 'subject_nickname', 'subject_birth_date',
    'subject_line', 'responsible_user', 'sex', 'subject_uuid'];

  // setup for the paginator
  dataSource;
  pageSize = 25;
  pageSizeOptions: number[] = [10, 25, 50, 100];

  filteredLabNameOptions: Observable<string[]>;
  filteredSubjectNicknameOptions: Observable<string[]>;
  filteredSubjectUuidOptions: Observable<string[]>;
  filteredSubjectLineOptions: Observable<string[]>;
  filteredResponsibleUserOptions: Observable<string[]>;
  genderMenu2ControlMap = { F: 0, M: 1, U: 2 };

  private miceSubscription: Subscription;

  constructor(public allMiceService: AllMiceService, public filterStoreService: FilterStoreService) { }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit() {
    // this.loading = true;
    this.mice_menu['sex'] = { F: null, M: null, U: null };
    const tableState: [number, number, Object] = this.filterStoreService.retrieveMouseTableState();
    const filters = this.filterStoreService.retrieveMouseFilter();
    for (const key in filters) {
      if (key === '__json') {
        const JSONcontent = JSON.parse(filters[key]);
        for (const item of JSONcontent) {
          if (typeof item === 'string') {
          } else {
            for (const gender of item) {
              this.mouse_filter_form.controls.sex_control['controls'][this.genderMenu2ControlMap[gender['sex']]].patchValue(true);
            }
          }
        }
      } else if (key === 'sex') {
        this.mouse_filter_form.controls.sex_control['controls'][this.genderMenu2ControlMap[filters[key]]].patchValue(true);
      } else if (key === 'subject_birth_date') {
        this.mouse_filter_form.controls.subject_birth_date_control.patchValue(new Date(filters[key] + ' (UTC)'));
      } else {
        const controlName = key + '_control';
        if (this.mouse_filter_form.controls[controlName]) {
          const toPatch = {};
          toPatch[controlName] = filters[key];
          this.mouse_filter_form.patchValue(toPatch);
        }
      }
    }
    if (tableState[0] && tableState[1]) {
      this.paginator.pageIndex = tableState[0];
      this.pageSize = tableState[1];
    }
    if (tableState[2] && Object.entries(tableState[2]).length > 0 && this.sort) {
      this.sort.active = Object.keys(tableState[2])[0];
      this.sort.direction = Object.values(tableState[2])[0].direction;
      // console.log(Object.keys(tableState[2])[0], ' => ',  Object.values(tableState[2])[0].direction);
    }
    this.applyFilter();
    // for creating the menu
    this.allMiceService.getAllMice();
    this.miceSubscription = this.allMiceService.getMiceLoadedListener()
      .subscribe((mice: any) => {
        // this.loading = false;
        // this.mice = mice;
        this.allMice = mice;
        // this.dataSource = new MatTableDataSource(mice);
        // this.dataSource.sort = this.sort;
        // this.dataSource.paginator = this.paginator;
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
      if (key === 'sex') {
        this.mice_menu[key] = { F: false, M: false, U: false };
      } else {
        this.mice_menu[key] = [];
      }
    }


  // find unique entries for each key
  for (const mouse of mice) {
    for (const key of keys) {
      if (key !== 'sex' && !this.mice_menu[key].includes(mouse[key])) {
        this.mice_menu[key].push(mouse[key]);
      } else if (key === 'sex') {
        if (Object.keys(this.mice_menu[key]).includes(mouse[key]) && !this.mice_menu[key][mouse[key]]) {
          this.mice_menu[key][mouse[key]] = true;
        }
      }
    }
  }

    // create formcontrol for item in menus
    // const sex_control_array = <FormArray>this.mouse_filter_form.controls['sex_control'];
    // sex_control_array.controls.length = 0;
    // for (const item of this.mice_menu['sex']) {
    //   sex_control_array.push(new FormControl(false));
    // }
    
    for (const item in this.mice_menu['sex']) {
      if (!this.mice_menu['sex'][item]) {
        this.mouse_filter_form.controls.sex_control['controls'][this.genderMenu2ControlMap[item]].patchValue(false);
        this.mouse_filter_form.controls.sex_control['controls'][this.genderMenu2ControlMap[item]].disable();
      } else {
        this.mouse_filter_form.controls.sex_control['controls'][this.genderMenu2ControlMap[item]].enable();
      }
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
    this.loading = true;
    const request = this.filterRequests();
    if (Object.entries(request).length > 0) {
      this.filterStoreService.storeMouseFilter(request);
      this.allMiceService.retrieveMice(request);
      this.allMiceService.getRequestedMiceLoadedListener()
        .subscribe((mice: any) => {
          this.loading = false;
          this.mice = mice;
          this.dataSource = new MatTableDataSource(this.mice);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
      });
    } else {
      this.resetFilter();
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
    let focusOn: string;
    if (event.checked) {
      focusOn = 'sex';
    } else {
      focusOn = event.target.name;
    }
    const referenceMenuReq = this.filterRequests(focusOn);
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
    const filterList = Object.entries(this.mouse_filter_form.getRawValue());
    const requestFilter = {};
    filterList.forEach(filter => {
      // filter is [["lab_name_control", "somelab"], ["subject_nickname_control", null]...]
      const filterKey = filter[0].split('_control')[0]; // filter[0] is control name like 'lab_name_control'
      if (filter[1] && filterKey !== focusedField) {
        if (filterKey === 'sex' && this.genderSelected(filter[1])) {
          // only accepts single selection - this case the last selection. TODO:coordinate with API for multi-selection
          let requestedGender: string;
          const requestGenderArray = [];
          for (const index in filter[1]) {
            if (filter[1][index]) {
              requestedGender = Object.keys(this.mice_menu['sex'])[index];
              requestGenderArray.push(JSON.stringify({ 'sex': requestedGender }));
            }
          }
          requestFilter['__json'] = '[[' + requestGenderArray + ']]';
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

  resetFilter() {
    this.loading = true;
    this.allMiceService.getAllMice();
    this.filterStoreService.clearMouseFilter();
    this.allMiceService.getMiceLoadedListener()
      .subscribe((mice: any) => {
        this.loading = false;
        this.mice = mice;
        this.dataSource = new MatTableDataSource(this.mice);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
  }

  clearFilter() {
    console.log('control cleared');
    for (const control in this.mouse_filter_form.controls) {
      const toReset = {}

      if (control !== 'sex_control') {
        toReset[control] = '';
      } else {
        toReset[control] = [false, false, false];
        for (const index in this.mouse_filter_form.get(control)['controls']) {
          this.mouse_filter_form.get(control).get([index]).enable();
        }

      }
      this.mouse_filter_form.patchValue(toReset);
    }
    this.filterStoreService.clearMouseTableState();
    this.paginator.pageSize = 25;
    this.paginator.pageIndex = null;
    // the below sort is to reset the arrow UI that doesn't go away after this.sort.active = '' 
    this.sort.sortables.forEach(sortItem => {
      this.sort.sort(sortItem);
    });

    this.sort.active = '';
    this.applyFilter();
  }

  storeTableInfo(event) {
    let pageIndex;
    let pageSize;
    const sorter = {};
    console.log('storing table info');
    if (event.pageIndex && event.pageSize) {
      pageIndex = event.pageIndex;
      pageSize = event.pageSize;
    }
    if (event.active && event.direction) {
      console.log(event);
      sorter[event.active] = { 'direction': event.direction };
    }
    console.log(pageIndex, pageSize, sorter);
    this.filterStoreService.storeMouseTableState(pageIndex, pageSize, sorter);
  }
}
