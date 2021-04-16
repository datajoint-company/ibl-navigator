import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatPaginator, MatTableDataSource, MatSort, MatTreeNestedDataSource } from '@angular/material';
import { AllSessionsService } from './all-sessions.service';
import { SessionComponent } from './session/session.component';
import { FilterStoreService } from '../filter-store.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { NestedTreeControl } from '@angular/cdk/tree';


enum Sex {
  FEMALE,
  MALE,
  UNDEFINED
}

const MAX_NUMBER_OF_SUGGESTIONS = 50

interface BrainTreeNode {
  display: string;
  value: any;
  children?: BrainTreeNode[];
  isSelected: boolean;
}

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
    session_lab_control: new FormControl(),
    subject_nickname_control: new FormControl(),
    session_project_control: new FormControl(),
    subject_uuid_control: new FormControl(),
    sex_control: new FormArray([new FormControl(), new FormControl(), new FormControl()]),
    subject_birth_date_control: new FormControl(),
    subject_line_control: new FormControl(),
    responsible_user_control: new FormControl()
  });
  loading = true;
  filterExpanded;
  restrictedSessions;
  allSessions;
  // currentlyLoadedSessions;
  sessionDateFilter: Function;
  miceBirthdayFilter: Function;
  sessionMinDate: Date;
  sessionMaxDate: Date;
  dateRangeToggle: boolean;
  dropDownMenuOptions: any = {};
  // filteredTaskProtocolOptions: Observable<string[]>;
  // filteredSessionUuidOptions: Observable<string[]>;
  // filteredSessionLabOptions: Observable<string[]>;
  // filteredSubjectNicknameOptions: Observable<string[]>;
  // filteredSessionProjectOptions: Observable<string[]>;
  // filteredSubjectUuidOptions: Observable<string[]>;
  // filteredSubjectLineOptions: Observable<string[]>;
  // filteredResponsibleUserOptions: Observable<string[]>;
  uniqueValuesForEachAttribute: any = {}; // 

  hideMissingPlots = false;
  hideMissingEphys = false;
  hideNG4BrainMap = false;
  hideNotReady4Delay = false;
  // setup for the table columns
  displayedColumns: string[] = ['session_lab', 'subject_nickname', 'subject_birth_date', 'session_start_time',
                              'task_protocol', 'subject_line', 'responsible_user',
                              'session_uuid', 'sex', 'subject_uuid', 'nplot', 'nprobe', 'session_project', 'ready4delay', 'good4bmap'];
  nplotMap: any = { '0': '', '1': '\u2714' };
  // setup for the paginator
  dataSource;
  pageSize = 25;
  pageSizeOptions: number[] = [10, 25, 50, 100];

  // for brain region tree selector
  brainRegionTree;
  treeControl = new NestedTreeControl<BrainTreeNode> (node => node.children);
  treeDataSource = new MatTreeNestedDataSource<BrainTreeNode>();
  // BT_childIsSelectedList = [];
  BT_selections: BrainTreeNode[] = [];
  requested_BR = [];
  BT_selectionStatus = {};
  BT_nodeLookup = {};

  BT_hasChild = (_: number, node: BrainTreeNode) => !!node.children && node.children.length > 0;
  BT_partlySelected = (node) => (this.BT_selectionStatus[node.value] == 1);
  BT_allSelected = (node) => (this.BT_selectionStatus[node.value] == 2);

  // queryValues = {
  //   'task_protocol': '_iblrig_tasks_habituationChoiceWorld3.7.6',
  //   // '__order': 'session_start_time'
  // };

  genderForm2MenuMap = { F: 0, M: 1, U: 2 };

  selectedSession = {};

  private sessionsSubscription: Subscription;
  private sessionMenuSubscription: Subscription;
  private allSessionMenuSubscription: Subscription;
  private reqSessionsSubscription: Subscription;

  constructor(private route: ActivatedRoute, private router: Router, public allSessionsService: AllSessionsService, public filterStoreService: FilterStoreService) {
    this.treeDataSource.data = this.brainRegionTree
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit() {
    // Patch job to initalized sex to the filters can be rendered
    this.uniqueValuesForEachAttribute['sex'] = {
      F: false,
      M: false,
      U: false
    }

    // Hide filter if screen size is smaller than the values of 1250x750
    if (window.innerWidth < 1250 || window.innerHeight < 750) {
      this.filterExpanded = false;
    } 
    else {
      this.filterExpanded = true;
    }

    // Read previous store state if it exist inside of filterStoreService
    const tableState: [number, number, Object] = this.filterStoreService.retrieveSessionTableState(); // PageIndex, PageSize, SortInfo
    const tableState2: [number, number, Object, Object] = this.filterStoreService.retrieveSessionTableState2(); // PageIndex, PageSize, SortInfo, loadedSessions

    // Parse URL params to extract the restrictions and apply them accordingly
    this.route.queryParams.subscribe(urlParams => {
      // Storage for filter params
      var params: any = {};

      // Find any params in either the url or storage
      if (!Object.keys(urlParams).length) {
        // There are no urlParams, thus we need to check the storage to see if there any filter there that needs to be loaded
        params = this.filterStoreService.retrieveSessionFilter();
        if (!params) {
          // There are no params in storage either, thus call updateMenu()
          this.updateMenu();
        }
      }
      else {
        // UrlParams exist thus set them to params
        params = urlParams;
      }

      // Process the params to conver them IBLAPI format
      for (const key in params) {
        console.log('going through params key: ', key)
        if (key === '__json') {
          // If key is __json than to reformat to IBL API format
          const JSONcontent = JSON.parse(params[key]);
          const dateRange = ['', '']; // First value is start date, second value is end date

          // Loop through each item in JSON Content and figgure out it is a date or a gender
          for (const item of JSONcontent) {
            if (typeof item === 'string') {
              // Example item = "session_start_time>'2019-04-24T00:00:00'"
              
              // Split raw string restriction and shove it in date
              const itemSplitByGreaterThan = item.split('>')
              if (itemSplitByGreaterThan[1]) {
                dateRange[0] = itemSplitByGreaterThan[1].split('T')[0].split('\'')[1];
              }

              const itemSplitByLessThan = item.split('<')
              if (itemSplitByLessThan[1]) {
                dateRange[1] = itemSplitByLessThan[1].split('T')[0].split('\'')[1];
              }
            } 
            else {
              for (const gender of item) {
                // If gender is defined then we need to tell the material controls to match the actual values
                // Example gender = { sex: "F" }
                this.session_filter_form.controls.sex_control['controls'][this.genderForm2MenuMap[gender['sex']]].patchValue(true);
              }
            }
          }

          // Process the date range assuming that it is valid
          if (dateRange[0] !== '') {
            if (dateRange[0] === dateRange[1]) {
              // Start Date and End date is the same, thus update materials controls to reflect the actual dates
              this.dateRangeToggle = false;
              this.session_filter_form.controls.session_start_time_control.patchValue(moment.utc(dateRange[0]));
            }
            else {
              // Set start date and end date respectively
              this.dateRangeToggle = true;
              this.session_filter_form.controls.session_range_filter['controls'].session_range_start_control.patchValue(moment.utc(dateRange[0]));
              this.session_filter_form.controls.session_range_filter['controls'].session_range_end_control.patchValue(moment.utc(dateRange[1]));
            }
          }
        } 
        else if (key === 'sex') {
          // Maho said that this is for a single selection of sex, don't know wtf this is the case when there is a json up there for mutiple values (FIX LATER)
          this.session_filter_form.controls.sex_control['controls'][this.genderForm2MenuMap[params[key]]].patchValue(true);
        } 
        else if (key === 'subject_birth_date') {
          // Set subject Birth date
          this.session_filter_form.controls.subject_birth_date_control.patchValue(moment.utc(params[key]));
        } 
        else if ( key !== 'session_start_time' && key !== '__json' && key !== '__order') {
          // Handle session start time
          const controlName = key + '_control';
          if (this.session_filter_form.controls[controlName]) {
            const toPatch = {};
            toPatch[controlName] = params[key];
            this.session_filter_form.patchValue(toPatch);
          }
        }
      }

      // Reading out the stored table state from the filter state
      if (tableState[1]) {
        this.paginator.pageIndex = tableState[0];
        this.pageSize = tableState[1];
      }

      if (tableState[2] && Object.entries(tableState[2]).length > 0 && this.sort) {
        this.sort.active = Object.keys(tableState[2])[0];
        this.sort.direction = Object.values(tableState[2])[0].direction;
      }


      if (tableState2[3]) { 
        // checks if there are any pre-loaded session upon returning
        this.applyPreloadedSessions(tableState2)
      } 
      else {
        // Nothing was found in storage, thus apply default filter (This shouldn't be needed)
        this.fetchSessions();
      }

    });

    // Brain tree is part of the filter, this code seems to be independent of the other filter construction
    /*
    this.allSessionsService.getBrainRegionTree();
    this.allSessionsService.getBrainRegionTreeLoadedListener().subscribe((allBrainRegions) => {
      this.brainRegionTree = allBrainRegions;
      this.treeDataSource.data = this.brainRegionTree;
      this.treeControl.dataNodes = this.treeDataSource.data;
      this.buildLookup();
      console.log('done fetching brain regions')
    })
    console.log('Finsihed running init')
    */
  }
  
  ngOnDestroy() {
    // console.log('destroying while storing these sessions: ', this.sessions);
    this.filterStoreService.storeSessionTableState2(this.paginator.pageIndex, this.pageSize, this.sort, this.restrictedSessions)

    if (this.sessionsSubscription) {
      this.sessionsSubscription.unsubscribe();
    }
    if (this.reqSessionsSubscription) {
      this.reqSessionsSubscription.unsubscribe();
    }
    if (this.sessionMenuSubscription) {
      this.sessionMenuSubscription.unsubscribe();
    }
    if (this.allSessionMenuSubscription) {
      this.allSessionMenuSubscription.unsubscribe();
    }
  }

  /**
   * Fetch sessiosn with the current restrictions obtainn from the filter form
   */
  fetchSessions() {
    console.log('fetching sessions')
    const filters = this.getFiltersRequests();

    this.hideMissingPlots = false;
    this.hideMissingEphys = false;
    this.hideNG4BrainMap = false;
    this.hideNotReady4Delay = false;

    // Store the filters, regardless if it is empty
    this.filterStoreService.storeSessionFilter(filters);
    
    // Add the default sorting for the api request
    filters['__order'] = 'session_start_time DESC';

    this.allSessionsService.fetchSessions(filters).subscribe((sessions: Array<any>) => {
      this.restrictedSessions = sessions;
      this.dataSource = new MatTableDataSource(this.restrictedSessions);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      console.log('datasource ready - table should be here')
      this.createMenu();
    })
  }

  setDropDownFormOptions(dropDownMenuOptionKey, formControl: FormControl, key: string) {
    this.dropDownMenuOptions[dropDownMenuOptionKey] = formControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, key))
    )
  }

  /**
   * Helper function to help patch the material radio button
   * @param sexType Should either be M, F, or U
   */
  private patchSexMaterial(sexType: Sex, enable: boolean) {
    if (enable) {
      this.session_filter_form.controls.sex_control['controls'][sexType].enable();
    }
    else {
      this.session_filter_form.controls.sex_control['controls'][sexType].patchValue(false);
      this.session_filter_form.controls.sex_control['controls'][sexType].disable();
    }
  }

  private createMenu() {
    const keys = ['task_protocol', 'session_start_time',
    'session_uuid', 'session_lab', 'subject_birth_date', 'subject_line',
    'subject_uuid', 'sex', 'subject_nickname', 'responsible_user', 'session_project'];

    let uniqueValuesForColumns = {}
    keys.forEach(key => {
      uniqueValuesForColumns[key] = new Set();
    })

    console.log(this.restrictedSessions)

    const t0 = performance.now();
    // Loop through each tuple
    this.restrictedSessions.forEach(tuple => {
      keys.forEach(key => {
        if (tuple[key] !== null && !uniqueValuesForColumns[key].has(tuple[key])) {
          // Add it to the uniqueValuesForColumns if it doesn't already exist in there
          uniqueValuesForColumns[key].add(tuple[key])
        }
      })
    });
    
    // Deal with specific case for
    this.patchSexMaterial(Sex.FEMALE, uniqueValuesForColumns['sex'].has('F'));
    this.patchSexMaterial(Sex.MALE, uniqueValuesForColumns['sex'].has('M'));
    this.patchSexMaterial(Sex.UNDEFINED, uniqueValuesForColumns['sex'].has('U'));

    // This is for selected or not for sex, don't know why this is here blame Maho
    uniqueValuesForColumns['sex'] = {
      F: false,
      M: false,
      U: false
    }

    this.uniqueValuesForEachAttribute = uniqueValuesForColumns;
    console.log(this.uniqueValuesForEachAttribute)
    console.log(performance.now() - t0);

    // Set material from drop down
    this.setDropDownFormOptions('filteredSessionLabOptions', this.session_filter_form.controls.session_lab_control, 'session_lab');
    
    this.setDropDownFormOptions('filteredSubjectNicknameOptions', this.session_filter_form.controls.subject_nickname_control, 'subject_nickname');
    this.setDropDownFormOptions('filteredSessionProjectOptions', this.session_filter_form.controls.session_project_control, 'session_project');
    this.setDropDownFormOptions('filteredSubjectUuidOptions',  this.session_filter_form.controls.subject_uuid_control, 'subject_uuid');
    this.setDropDownFormOptions('filteredSessionUuidOptions',  this.session_filter_form.controls.session_uuid_control, 'session_uuid');
    this.setDropDownFormOptions('filteredTaskProtocolOptions',  this.session_filter_form.controls.task_protocol_control, 'task_protocol');
    this.setDropDownFormOptions('filteredSubjectLineOptions',  this.session_filter_form.controls.subject_line_control, 'subject_line');
    this.setDropDownFormOptions('filteredResponsibleUserOptions',  this.session_filter_form.controls.responsible_user_control, 'responsible_user');

    this.loading = false
    return;
    /*
    // console.log('now creating menu');
    this.session_menu = {};
    const keys = ['task_protocol', 'session_start_time',
    'session_uuid', 'session_lab', 'subject_birth_date', 'subject_line',
    'subject_uuid', 'sex', 'subject_nickname', 'responsible_user', 'session_project'];
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

    this.filteredSessionLabOptions = this.session_filter_form.controls.session_lab_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'session_lab'))
      );

    this.filteredSubjectNicknameOptions = this.session_filter_form.controls.subject_nickname_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'subject_nickname'))
      );

    this.filteredSessionProjectOptions = this.session_filter_form.controls.session_project_control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 'session_project'))
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

*/
  }

  /**
   * Call back to filter the avalible results down to the array with only the valid entries that matches the filter value
   * @param userRestrictionString 
   * @param attributeName 
   * @returns 
   */
  private _filter(userRestrictionString: string, attributeName: string): string[] {
    // If the value is an empty string then just return the array of the unique set
    if (userRestrictionString === '') {
      if (this.uniqueValuesForEachAttribute[attributeName].size > MAX_NUMBER_OF_SUGGESTIONS) {
        return (Array.from(this.uniqueValuesForEachAttribute[attributeName]) as Array<string>).slice(0, MAX_NUMBER_OF_SUGGESTIONS);
      }
      return Array.from(this.uniqueValuesForEachAttribute[attributeName]) // This is converting the set to an array
    }

    // If the userRestrictionString not an empty string, we basically need to loop through each of the unique values and see which of them contains the userRestrictionString
    var validUniqueValues = [] // Unqiue values that contains the user restrction string

    // If attribute has more than 10000 entires, restrict by substring match, otherwise restrict via include
    if (this.uniqueValuesForEachAttribute[attributeName].size > 10000) {
      // Check if the userRestriction string is at least of length 2 before trying to restrict (This is due to performance reasons)
      if (userRestrictionString.length >= 2) {
        this.uniqueValuesForEachAttribute[attributeName].forEach(uniqueValue => {
          if (userRestrictionString === uniqueValue.substr(0, userRestrictionString.length)) {
            // The unique value does include the user restrction string, thus we need to add it to the validUniqueValues array
            validUniqueValues.push(uniqueValue);
          }
    
          if (validUniqueValues.length > MAX_NUMBER_OF_SUGGESTIONS) {
            return;
          }
        })
      }
      else {
        return
      }
    }
    else {
      this.uniqueValuesForEachAttribute[attributeName].forEach(uniqueValue => {
        if (uniqueValue.includes(userRestrictionString)) {
          // The unique value does include the user restrction string, thus we need to add it to the validUniqueValues array
          validUniqueValues.push(uniqueValue);
        }
  
        if (validUniqueValues.length > MAX_NUMBER_OF_SUGGESTIONS) {
          return;
        }
      })
    }
    
    return validUniqueValues
  }

  updateMenu() {
    const menuRequest = this.getFiltersRequests();
    if (Object.entries(menuRequest).length > 1) {
      menuRequest['order__'] = 'session_lab';
      this.allSessionsService.getSessionMenu(menuRequest);
      this.allSessionsService.getSessionMenuLoadedListener()
        .subscribe((sessions: any) => {
          //this.createMenu(sessions);
        });
    }
  }

  stepBackMenu(event) {
    let focusOn: string;
    if (event.checked) {
      focusOn = 'sex';
    } else {
      focusOn = event.target.name;
    }
    const referenceMenuReq = this.getFiltersRequests(focusOn);
    if (Object.entries(referenceMenuReq) && Object.entries(referenceMenuReq).length > 0) {
      referenceMenuReq['order__'] = 'session_lab';
      this.allSessionsService.getSessionMenu(referenceMenuReq);
      this.allSessionsService.getSessionMenuLoadedListener()
        .subscribe((sessions: any) => {
          //this.createMenu(sessions);
        });
    } else {
      //this.createMenu(this.allSessions); // No guarrenty
    }

  }

  genderSelected(genderForm) {
    return genderForm.includes(true);
  }

  /**
   * Format whatever the user inputed inside filter form
   * @param focusedField 
   * @returns 
   */
  getFiltersRequests(focusedField?: string) {
    const filterList = Object.entries(this.session_filter_form.getRawValue());
    const brainRegionRequest = this.requested_BR;
    const requestFilter = {};
    let requestJSONstring = '';
    
    filterList.forEach(filter => {
      // filter is [["session_lab_control", "somelab"], ["subject_nickname_control", null]...]
      const filterKey = filter[0].split('_control')[0]; // filter[0] is control name like 'session_lab_control'
      if (filter[1] && filterKey !== focusedField) {
        if (filterKey === 'sex' && this.genderSelected(filter[1])) {
          // only accepts single selection - this case the last selection.
          // TODO:coordinate with API for multi-selection
          let requestedGender: string;
          const requestGenderArray = [];
          for (const index in filter[1]) {
            if (filter[1][index]) {
              requestedGender = Object.keys(this.uniqueValuesForEachAttribute['sex'])[index];
              // console.log('type of JSON.stringify({sex: requestedGender}) is: ', typeof JSON.stringify({ 'sex': requestedGender}));
              requestGenderArray.push(JSON.stringify({ 'sex': requestedGender}));
              // requestedGender = this.session_menu['sex'][index];
            }
          }
          if (requestJSONstring.length > 0) {
            requestJSONstring += ',' + '[' + requestGenderArray + ']';
          } else {
            requestJSONstring += '[' + requestGenderArray + ']';
          }

          // requestFilter['__json'] = '[' + requestGenderArray + ']';
        } else if (filterKey !== 'sex') {
          // making sure gender filter gets removed from the request

          if (filterKey === 'subject_birth_date') {
            // Tue Dec 11 2018 00:00:00 GMT-0600 (Central Standard Time) => 2018-12-11T06:00:00.000Z => 2018-12-11
            const mouseDOB = moment.utc(filter[1]);
            // console.log('printing mouse DOB in filter: ', filter[1]);
            // console.log('printing date created from filter date: ', mouseDOB);
            // console.log(mouseDOB.toISOString());
            if (mouseDOB.toISOString()) {
              requestFilter[filterKey] = mouseDOB.toISOString().split('T')[0];
            } 
          } else if (filterKey === 'session_start_time') {
              if (!this.dateRangeToggle) {
                const sessionST = moment.utc(filter[1].toString());
                const rangeStartTime = '00:00:00';
                const rangeEndTime = '23:59:59';
                const startString = sessionST.toISOString().split('T')[0] + 'T' + rangeStartTime;
                const endString = sessionST.toISOString().split('T')[0] + 'T' + rangeEndTime;
                const rangeStart = '"' + 'session_start_time>' + '\'' + startString + '\'' + '"';
                const rangeEnd = '"' + 'session_start_time<' + '\'' + endString + '\'' + '"';
                if (requestJSONstring.length > 0) {
                  requestJSONstring += ',' + rangeStart + ',' + rangeEnd;
                } else {
                  requestJSONstring += rangeStart + ',' + rangeEnd;
                }
              }
          } else if (filterKey === 'session_range_filter') {
            //// Note: filter =
            ////      ["session_range_filter", { session_range_start_control: null, session_range_end_control: null }]
            if (this.dateRangeToggle && filter[1]['session_range_start_control'] && filter[1]['session_range_end_control']) {

              const sessionStart = moment.utc(filter[1]['session_range_start_control'].toString());
              const sessionEnd = moment.utc(filter[1]['session_range_end_control'].toString());
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
                // console.log('all session from ', filter[1]['session_range_start_control'], ' requested!');
              const sessionStart = moment.utc(filter[1]['session_range_start_control'].toString());
                const rangeStartTime = '00:00:00';
                const startString = sessionStart.toISOString().split('T')[0] + 'T' + rangeStartTime;
                const rangeStart = '"' + 'session_start_time>' + '\'' + startString + '\'' + '"';
                if (requestJSONstring.length > 0) {
                  requestJSONstring += ',' + rangeStart;
                } else {
                  requestJSONstring += rangeStart;
                }
            } else if (this.dateRangeToggle && !filter[1]['session_range_start_control'] && filter[1]['session_range_end_control']) {
                // console.log('all session up to ', filter[1]['session_range_end_control'], ' requested!');
              const sessionEnd = moment.utc(filter[1]['session_range_end_control'].toString());
                const rangeEndTime = '23:59:59';
                const endString = sessionEnd.toISOString().split('T')[0] + 'T' + rangeEndTime;
                const rangeEnd = '"' + 'session_start_time<' + '\'' + endString + '\'' + '"';
                if (requestJSONstring.length > 0) {
                  requestJSONstring += ',' + rangeEnd;
                } else {
                  requestJSONstring += rangeEnd;
                }
            }
          } else {
            requestFilter[filterKey] = filter[1];
          }
        }
        // if ((requestGenderArray && requestGenderArray.length > 0) || (rangeStart && rangeStart.length > 0)) {
        //   console.log('gender or session start time restricted');
        //   requestFilter['__json'] = '[' + requestGenderArray + rangeStart + ',' + rangeEnd + ']';
        // }
        let BR_JSONstring = '';
        if (brainRegionRequest && brainRegionRequest.length > 0) {
          BR_JSONstring = '';
          brainRegionRequest.filter(function(selection, index) {
            if (index > 0) {
              BR_JSONstring += `, "${selection}"`
            } else {
              BR_JSONstring += `"${selection}"`
            }
          })
          
          BR_JSONstring = '[' + BR_JSONstring + ']'
          
        }

        // if (requestJSONstring.length > 0 && BR_JSONstring.length == 0) {
        //   requestFilter['__json'] = '[' + requestJSONstring + ']';
        // } else if (requestJSONstring.length > 0 && BR_JSONstring.length > 0) {
        //   requestFilter['__json'] = '[' + requestJSONstring + ',' + BR_JSONstring + ']';
        // } else if (requestJSONstring.length == 0 && BR_JSONstring.length > 0) {
        //   requestFilter['__json'] = '[' + BR_JSONstring + ']';
        // }
        if (requestJSONstring.length > 0) {
          requestFilter['__json'] = '[' + requestJSONstring + ']';
        }
        if (brainRegionRequest.length > 0) {
          requestFilter['__json_kwargs'] = '{ "brain_regions": ' + BR_JSONstring + '}';
        }
      }
    });
    return requestFilter;
  }

  applyFilter() {
    return;
    console.log('apply filter')
    this.hideMissingPlots = false;
    this.hideMissingEphys = false;
    this.hideNG4BrainMap = false;
    this.hideNotReady4Delay = false;
    // console.log('applying filter');
    this.loading = true;
    this.restrictedSessions = [];
    const request = this.getFiltersRequests();
    request['__order'] = 'session_start_time DESC';
    if (Object.entries(request) && Object.entries(request).length > 1) {
      console.log('printing request: ', request)
      this.filterStoreService.storeSessionFilter(request);
      this.allSessionsService.retrieveSessions2(request);
      this.reqSessionsSubscription = this.allSessionsService.getNewSessionsLoadedListener2()
        .subscribe((newSessions: any) => {
          console.log('sessions loaded: ', newSessions);
          this.loading = false;
          this.restrictedSessions = newSessions;
          this.dataSource = new MatTableDataSource(newSessions);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        });
    } else {
      this.resetFilter();
      // this.refreshData();
    }
  }

  applyPreloadedSessions(storedTableInfo) { // PageIndex, PageSize, SortInfo, loadedSessions
    // console.log('trying to apply preloaded sessions');
    this.dataSource = new MatTableDataSource(storedTableInfo[3]);
    this.dataSource.sort = storedTableInfo[2];
    this.dataSource.paginator = this.paginator

    this.hideMissingPlots = false;
    this.hideMissingEphys = false;
    this.hideNG4BrainMap = false;
    this.hideNotReady4Delay = false;
    if (storedTableInfo[1]) {
      // console.log('printing datasource: ', this.dataSource)
      // console.log('printing this.paginator: ', this.paginator)
      this.dataSource.paginator.pageSize = storedTableInfo[1];
    } else {
      this.dataSource.paginator.pageSize = this.pageSize
    }

    if (storedTableInfo[0]) {
      this.dataSource.paginator.pageIndex = storedTableInfo[0];
    } else {
      this.dataSource.paginator.pageIndex = 0
    }
    
    this.restrictedSessions = storedTableInfo[3];
    this.loading = false;
  }

  resetFilter() {
    console.log('resetting filter');
    this.loading = true;
    this.allSessionsService.retrieveSessions({ '__order': 'session_start_time DESC'});
    this.filterStoreService.clearSessionFilter();
    this.allSessionsService.getNewSessionsLoadedListener()
      .subscribe((sessionsAll: any) => {
        this.loading = false;
        this.restrictedSessions = sessionsAll;
        this.allSessions = sessionsAll;
        this.dataSource = new MatTableDataSource(this.restrictedSessions);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
  }


  refreshData() {
    // console.log('refreshing data to newest:');
    this.filterStoreService.refreshSessionTableState();
    this.loading = true;
    let params = this.filterStoreService.retrieveSessionFilter();
 
    for (const key in params) {
      if (key === '__json') {
        // console.log('inside __json filter');
        // console.log('params[key] is', params[key]);
        const JSONcontent = JSON.parse(params[key]);
        const dateRange = ['', ''];
        for (const item of JSONcontent) {
          if (typeof item === 'string') {
             // item = "session_start_time>'2019-04-24T00:00:00'"
            if (item.split('>')[1]) {
              dateRange[0] = item.split('>')[1].split('T')[0].split('\'')[1];
            }
            if (item.split('<')[1]) {
              dateRange[1] = item.split('<')[1].split('T')[0].split('\'')[1];
            }

          } else {
            for (const gender of item) {
              // console.log(gender); // gender = { sex: "F"}
              this.session_filter_form.controls.sex_control['controls'][this.genderForm2MenuMap[gender['sex']]].patchValue(true);
            }
          }
        }
        if (dateRange[0] !== '' && dateRange[0] === dateRange[1]) {
          this.dateRangeToggle = false;
          // console.log('loggin date range[0]- ', dateRange[0]);
          this.session_filter_form.controls.session_start_time_control.patchValue(moment.utc(dateRange[0]));
        } else if (dateRange[0] !== '') {
          this.dateRangeToggle = true;
          // console.log('loggin date range[1]- ', dateRange[1]);
          this.session_filter_form.controls.session_range_filter['controls'].session_range_start_control.patchValue(moment.utc(dateRange[0]));
          this.session_filter_form.controls.session_range_filter['controls'].session_range_end_control.patchValue(moment.utc(dateRange[1]));
        }
      } else if (key === 'sex') {
        this.session_filter_form.controls.sex_control['controls'][this.genderForm2MenuMap[params[key]]].patchValue(true);
      } else if (key === 'subject_birth_date') {
        this.session_filter_form.controls.subject_birth_date_control.patchValue(moment.utc(params[key]));
      } else if ( key !== 'session_start_time' && key !== '__json' && key !== '__order') {
        const controlName = key + '_control';
        if (this.session_filter_form.controls[controlName]) {
          const toPatch = {};
          toPatch[controlName] = params[key];
          this.session_filter_form.patchValue(toPatch);
        }
      }
    }
    this.applyFilter();
    // if (tableState[1]) {
    //   this.paginator.pageIndex = tableState[0];
    //   this.pageSize = tableState[1];
    // }
    // if (tableState[2] && Object.entries(tableState[2]).length > 0 && this.sort) {
    //   this.sort.active = Object.keys(tableState[2])[0];
    //   this.sort.direction = Object.values(tableState[2])[0].direction;
    // }


    // this.allSessionsService.retrieveSessions({ '__order': 'session_start_time DESC'});
    // this.allSessionsService.getNewSessionsLoadedListener()
    //   .subscribe((sessionsAll: any) => {
    //     this.loading = false;
    //     this.sessions = sessionsAll;
    //     this.allSessions = sessionsAll;
    //     this.dataSource = new MatTableDataSource(sessionsAll);
    //     this.dataSource.sort = this.sort;
    //     this.dataSource.paginator = this.paginator;
    //   });
    
  }

  clearControl() {
    // console.log('clearing control and storage');
    for (const control in this.session_filter_form.controls) {
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
      // console.log('going through controls - ', control);
    }
    

    // // attempting to just reset the table and not the actual session
    // this.dataSource = new MatTableDataSource(this.allSessions);
    // this.dataSource.paginator = this.paginator;
    // this.sessions = this.allSessions
    // console.log('length of all sessions: ', this.allSessions.length);

    this.paginator.pageSize = 25;
    this.paginator.pageIndex = null;
    

    // the below sort is to reset the arrow UI that doesn't go away after this.sort.active = '' 
    this.sort.sortables.forEach(sortItem => {
      this.sort.sort(sortItem);
    });
    
    this.sort.active = '';

    this.filterStoreService.clearSessionTableState();

    // console.log(this.route.queryParams);
    this.route.queryParams.subscribe(param => {
      if (Object.keys(param).length > 0) {
        this.router.navigate(
          [],
          {
            relativeTo: this.route,
            queryParams: null
          });
      } else {
        this.applyFilter();
      }
     });
  }

  storeTableInfo(event) {
    let pageIndex;
    let pageSize;
    const sorter = {};
    if (event.pageSize) {
      pageIndex = event.pageIndex;
      pageSize = event.pageSize;
    }
    if (event.active && event.direction) {
      if (event.active !== 'nplot') {
        sorter[event.active] = { 'direction': event.direction };
      }
    }
    this.filterStoreService.storeSessionTableState(pageIndex, pageSize, sorter);
    this.filterStoreService.storeSessionTableState2(pageIndex, pageSize, sorter, this.restrictedSessions);
  }

  sessionSelected(session) {
    // console.log(session);
    this.selectedSession = session;
  }

  // toggleNplotStatus() {
  //   if (!this.hideMissingPlots && !this.hideMissingEphys) {
  //     const sessionWithPlots = [];
  //     for (const session of this.sessions) {
  //       if (session.nplot === 1) {
  //         sessionWithPlots.push(session);
  //       }
  //     }
  //     this.dataSource = new MatTableDataSource(sessionWithPlots);
  //   } else if (!this.hideMissingPlots && this.hideMissingEphys) {
  //     const sessionWithPlotsAndEphys = [];
  //     for (const session of this.sessions) {
  //       if (session.nplot === 1 && session.nprobe > 0) {
  //         sessionWithPlotsAndEphys.push(session);
  //       }
  //     }
  //     this.dataSource = new MatTableDataSource(sessionWithPlotsAndEphys);
  //   } else if (this.hideMissingPlots && this.hideMissingEphys) {
  //     const sessionWithEphys = [];
  //     for (const session of this.sessions) {
  //       if (session.nprobe > 0) {
  //         sessionWithEphys.push(session);
  //       }
  //     }
  //     this.dataSource = new MatTableDataSource(sessionWithEphys);
  //   } else {
  //     this.dataSource = new MatTableDataSource(this.sessions);
  //   }
  //   this.dataSource.sort = this.sort;
  //   this.dataSource.sortingDataAccessor = (data, header) => data[header];
  //   this.dataSource.paginator = this.paginator;

  //   this.hideMissingPlots = !this.hideMissingPlots;
  // }

  // toggleNprobeStatus() {
  //   if (!this.hideMissingEphys && !this.hideMissingPlots) {
  //     const sessionWithEphys = [];
  //     for (const session of this.sessions) {
  //       if (session.nprobe > 0) {
  //         sessionWithEphys.push(session);
  //       }
  //     }
  //     this.dataSource = new MatTableDataSource(sessionWithEphys);
  //   } else if (!this.hideMissingEphys && this.hideMissingPlots) {
  //     const sessionWithEphysAndPlots = [];
  //     for (const session of this.sessions) {
  //       if (session.nprobe > 0 && session.nplot === 1) {
  //         sessionWithEphysAndPlots.push(session);
  //       }
  //     }
  //     this.dataSource = new MatTableDataSource(sessionWithEphysAndPlots);
  //   } else if (this.hideMissingEphys && this.hideMissingPlots) {
  //     const sessionWithPlots = [];
  //     for (const session of this.sessions) {
  //       if (session.nplot === 1) {
  //         sessionWithPlots.push(session);
  //       }
  //     }
  //     this.dataSource = new MatTableDataSource(sessionWithPlots);
  //   } else {
  //     this.dataSource = new MatTableDataSource(this.sessions);
  //   }
  //   this.dataSource.sort = this.sort;
  //   this.dataSource.sortingDataAccessor = (data, header) => data[header];
  //   this.dataSource.paginator = this.paginator;

  //   this.hideMissingEphys = !this.hideMissingEphys;
  // }

  updateSelection() {
    let criteria = []
    if (this.hideMissingPlots) {
        criteria.push(_.map(this.restrictedSessions, x => x.nplot === 1));
    }
​
    if (this.hideMissingEphys) {
        criteria.push(_.map(this.restrictedSessions, x => x.nprobe > 0));
    }

    if (this.hideNG4BrainMap) {
      console.log('only show those good for brain map')
      
      criteria.push(_.map(this.restrictedSessions, x => x.good_enough_for_brainwide_map > 0));
    }
    
    if (this.hideNotReady4Delay) {
      console.log('only show those ready for delay')
      criteria.push(_.map(this.restrictedSessions, x => x.training_status == 'ready4delay'));
      // training_status: "ready4delay"
    }
​    
    let selectedSessions = this.restrictedSessions;

​    if (criteria.length > 0) {
      let selection = _.map(_.zip(...criteria), (x) => _.every(x));
      selectedSessions = _.filter(this.restrictedSessions, (x, i) => selection[i]);
    }
    
    this.dataSource = new MatTableDataSource(selectedSessions);
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, header) => data[header];
    this.dataSource.paginator = this.paginator;
  }
  ​
  toggleNplotStatus() {
    // hide or show sessions that have missing session plots
    this.hideMissingPlots = !this.hideMissingPlots;
    this.updateSelection();
  }
  ​
  toggleNprobeStatus() {
    // hide or show sessions that have missing ephys data (based on existence of probe insertion)
    this.hideMissingEphys = !this.hideMissingEphys;
    this.updateSelection();
  }

  toggleG4BMviewStatus() {
    // hide or show sessions that are not good enough for brain map
    this.hideNG4BrainMap = !this.hideNG4BrainMap;
    this.updateSelection();
  }

  toggleR4DviewStatus() {
    // hide or show session that are not ready for delay
    this.hideNotReady4Delay = !this.hideNotReady4Delay;
    this.updateSelection();
  }

  //==**==**==**==**+=**+== [START] brain tree functions **==**==**==**==**==**==**==**==**==**+=//
  buildLookup() {
    for (let child of this.brainRegionTree) {
      this.buildNodeLookup(child);
    }
  }

  buildNodeLookup(node) {
    this.BT_nodeLookup[node.value] = node;
    if (node.children && node.children.length) {
      for (let child of node.children) {
        this.buildNodeLookup(child);
      }
    }
  }

  filterTree(word) {
    let newData = []
    for (let child of this.brainRegionTree) {
      let result = this.filterNode(child, word, false);
      if (result) newData.push(result);
    }
    return newData;
  }

  filterNode(node, word, selectAll){
    let children = []
    let newNode = {
      display: node.display,
      value: node.value,
      isSelected: node.isSelected,
      children: []
    }
    // let nodeHit = newNode.value.toLowerCase().includes(word) || selectAll;
    let nodeHit = newNode.display.toLowerCase().includes(word) || selectAll;
    if (node.children && node.children.length) {
      for (let child of node.children) {
        let subtree = this.filterNode(child, word, nodeHit);
        if (subtree || nodeHit) {
          newNode.children.push(subtree);
        }
      }
    }
    if (nodeHit || newNode.children.length > 0) {
      return newNode;
    }
    return null;
  }

  /**
   * Recursively applies the selection `isChecked` to the node and
   * all of its descendants (if they exist)
   */
  selectionToggle(isChecked, node) {
    let newValue = isChecked? 2: 0;
    this.BT_selectionStatus[node.value] = newValue;
    if (node.children && node.children.length) {
      for (let child of node.children) {
        this.selectionToggle(isChecked, child);
      }
    }
    // update the status of all nodes' selection
    this.updateSelectionStatus();
  }

  updateSelectionStatus() {
    for (let child of this.brainRegionTree) { 
      this.setSelectionStatus(child);
    }
    // fill the selection list with the selected items
    let currentSelection = [];
    for (let key in this.BT_selectionStatus) {
      if (this.BT_selectionStatus[key] > 0) currentSelection.push(key);
    }
    this.BT_selections = currentSelection;
    this.requested_BR = this.enlist(this.brainRegionTree);

  }

  setSelectionStatus(node) {
    let allSelected = true;
    let partlySelected = false;
    if (node.children && node.children.length) {
      for (let child of node.children) {
        let status = this.setSelectionStatus(child);
        allSelected = allSelected && status[0]; 
        partlySelected = partlySelected || status[1]
      }
    } else { // for leaf nodes
      allSelected = partlySelected = this.BT_selectionStatus[node.value] > 0; 
    }
    this.BT_selectionStatus[node.value] = Number(allSelected) + Number(partlySelected);
    return [allSelected, partlySelected];
  }

  filterChanged(inputValue) {
    let newData = this.filterTree(inputValue);
    // console.log('newData: ', newData)
    // console.log('dataNodes: ', this.treeControl.dataNodes);
    this.treeDataSource.data = newData;
    this.treeControl.dataNodes = this.treeDataSource.data;
    // console.log('treeControl: ', this.treeControl);
    this.treeControl.expandAll();
  }

  chipClicked(item) {
    let node = this.BT_nodeLookup[item];
    this.selectionToggle(false, node);
  }

  enlist(nodes) {
    let region_list = [];
    for (let region of nodes) {
      this.enlistNode(region, region_list);
    }
    
    return region_list;
  }

  enlistNode(node, region_list) {
    if (this.BT_selectionStatus[node['value']] == 2) {
      region_list.push(node['value']);
      return;
    }   
    for (let child of node['children']) {
      this.enlistNode(child, region_list)
    }
  }

  
  //===**==**==**==**+=**+== [END] brain tree functions **==**==**==**==**==**==**==**==**==**+=//
}
