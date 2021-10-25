import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, FormArray, AbstractControl} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { MatPaginator} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AllSessionsService } from './all-sessions.service';
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
    task_protocol: new FormControl(),
    session_uuid: new FormControl(),
    session_start_time: new FormControl(),
    session_range_filter: new FormGroup({
      session_range_start: new FormControl(),
      session_range_end: new FormControl()
    }),
    session_lab: new FormControl(),
    subject_nickname: new FormControl(),
    session_project: new FormControl(),
    subject_uuid: new FormControl(),
    sex: new FormArray([new FormControl(), new FormControl(), new FormControl()]),
    subject_birth_date: new FormControl(),
    subject_line: new FormControl(),
    responsible_user: new FormControl()
  });
  isLoading;
  initialLoad;
  filterExpanded;
  allSessions;
  restrictedSessions: Array<any>;
  // currentlyLoadedSessions;
  sessionDateFilter: Function;
  miceBirthdayFilter: Function;
  sessionMinDate: Date;
  sessionMaxDate: Date;
  isSessionDateUsingRange: boolean;
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
                              'session_uuid', 'sex', 'subject_uuid', 'nplot', 'nprobe', 'session_project', 'good4bmap'];
  nplotMap: any = { '0': '', '1': '\u2714' };
  // setup for the paginator
  dataSource;
  pageIndex: number;
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
    // Initalized the material table
    this.dataSource = new MatTableDataSource<any>();
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit() {
    this.isLoading = true;
    this.initialLoad = true;

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
    // the SessionTableState and SessionTableState2 is result of Maho being confused about subscription/observable handling - two separate ones had to be made to avoid conflicts in data
    // but basically the TableState is the original for storing table info like index, pagesize and sort, but the second one is for once sessions are restricted - if 
    // the second one can be used for all cases (with or without restricted data) without data conflict, then that should be ideal
    //const tableState: [number, number, Object] = this.filterStoreService.retrieveSessionTableState(); // PageIndex, PageSize, SortInfo
    //const tableState2: [number, number, Object, Object] = this.filterStoreService.retrieveSessionTableState2(); // PageIndex, PageSize, SortInfo, loadedSessions

    // Parse URL params to extract the restrictions and apply them accordingly
    this.route.queryParams.subscribe(async urlParams => {
      // Storage for filter params
      let params: any = undefined;

      // Find any params in either the url or storage
      if (!Object.keys(urlParams).length) {
        // There are no urlParams, thus we need to check the storage to see if there any filter there that needs to be loaded
        params = this.filterStoreService.retrieveSessionFilter();
      }
      else {
        // UrlParams exist thus set them to params
        params = urlParams;
      }

      // Process the params to conver them IBLAPI format
      for (const key in params) {
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
                this.session_filter_form.controls.sex['controls'][this.genderForm2MenuMap[gender['sex']]].patchValue(true);
              }
            }
          }

          // Process the date range assuming that it is valid
          if (dateRange[0] !== '') {
            if (dateRange[0] === dateRange[1]) {
              // Start Date and End date is the same, thus update materials controls to reflect the actual dates
              this.isSessionDateUsingRange = false;
              this.session_filter_form.controls.session_start_time.patchValue(moment.utc(dateRange[0]));
            }
            else {
              // Set start date and end date respectively
              this.isSessionDateUsingRange = true;
              this.session_filter_form.controls.session_range_filter['controls'].session_range_start.patchValue(moment.utc(dateRange[0]));
              this.session_filter_form.controls.session_range_filter['controls'].session_range_end.patchValue(moment.utc(dateRange[1]));
            }
          }
        } 
        else if (key === 'session_start_time' && params[key] !== null) {
          this.session_filter_form.controls.session_start_time.patchValue(moment.utc(params[key]));
        }
        else if (key === 'session_range_filter') {
          if (params[key]['session_range_start'] !== null && params[key]['session_range_end'] !== null) {
            this.isSessionDateUsingRange = true;
            this.session_filter_form.controls.session_range_filter['controls'].session_range_start.patchValue(moment.utc(params[key]['session_range_start']));
            this.session_filter_form.controls.session_range_filter['controls'].session_range_end.patchValue(moment.utc(params[key]['session_range_end']));
          }
        }
        else if (key === 'sex' && params[key] !== null) {
          this.session_filter_form.controls.sex['controls'][this.genderForm2MenuMap[params[key]]].patchValue(true);
        }
        else if (key === 'subject_birth_date') {
          // Set subject Birth date
          if (params[key] !== null) {
            this.session_filter_form.controls.subject_birth_date.patchValue(moment.utc(params[key]));
          }
          
        } 
        else if ( key !== 'session_start_time' && key !== '__json' && key !== '__order') {
          // Handle session start time
          const controlName = key + '';
          if (this.session_filter_form.controls[controlName]) {
            const toPatch = {};
            toPatch[controlName] = params[key];
            this.session_filter_form.patchValue(toPatch);
          }
        }
      }

      // Check storage to see if there is anything there
      // Check for paginator
      if (this.filterStoreService.sessionPaginator) {
        this.paginator.pageSize = this.filterStoreService.sessionPaginator['pageSize'];
        this.paginator.pageIndex = this.filterStoreService.sessionPaginator['pageIndex'];
      }

      // Check for sort info
      if (this.filterStoreService.sessionSortInfo && this.filterStoreService.sessionSortInfo['active'] !== undefined && this.filterStoreService.sessionSortInfo['direction'] !== '') {
        // Session sort info is valid, thus set it locally
        this.sort.active = this.filterStoreService.sessionSortInfo['active'];
        this.sort.direction = this.filterStoreService.sessionSortInfo['direction'];
      }

      // Check for the hide buttons
      if (this.filterStoreService.hideMissingEphys) {
        this.hideMissingEphys = true;
      }

      if (this.filterStoreService.hideMissingPlots) {
        this.hideMissingPlots = true;
      }

      if (this.filterStoreService.hideNG4BrainMap) {
        this.hideNG4BrainMap = true;
      }

      if (this.filterStoreService.hideNotReady4Delay) {
        this.hideNotReady4Delay = true;
      }
      

      // Check for preloaded sessions
      if (this.filterStoreService.loadedSessions) {
        // We have previously loaded sessions, thus just use that
        this.allSessions = this.filterStoreService.loadedSessions;
      }
      else {
        // Else fetch from database
        await this.fetchSessions();
        this.initialLoad = false;
      }
      
      // Check if there are params, if they are then apply them via this.applyFilter();
      if (params !== undefined && Object.keys(params).length !== 0) {
        // There are params, thus apply the filter and get the restricted sessions
        this.restrictedSessions = await this.applyFilter(); 
      }
      else {
        // There are no params so just set restricted Session to all sessions
        this.restrictedSessions = this.allSessions
      }

      // Create Menu, Update table view and set loading to false
      this.createMenu(this.restrictedSessions);
      
      this.updateTableView(this.restrictedSessions);
      this.isLoading = false;

      if (this.filterStoreService.sessionPaginator) {
        this.paginator.pageSize = this.filterStoreService.sessionPaginator['pageSize'];
        this.paginator.pageIndex = this.filterStoreService.sessionPaginator['pageIndex'];
        
        this.dataSource.paginator = this.paginator
      }

      this.updateSelection();
    });

    // Brain tree is part of the filter, this code seems to be independent of the other filter construction
    this.allSessionsService.getBrainRegionTree();
    this.allSessionsService.getBrainRegionTreeLoadedListener().subscribe((allBrainRegions) => {
      this.brainRegionTree = allBrainRegions;
      this.treeDataSource.data = this.brainRegionTree;
      this.treeControl.dataNodes = this.treeDataSource.data;
      this.buildLookup();
    })
  }
  
  ngOnDestroy() {
    // Store paginator, sort, buttons, and sessions
    this.filterStoreService.sessionPaginator = {length: this.paginator.length, pageIndex: this.paginator.pageIndex, pageSize: this.paginator.pageSize}
    this.filterStoreService.sessionSortInfo = {active: this.sort.active, direction: this.sort.direction};
    this.filterStoreService.hideMissingEphys = this.hideMissingEphys;
    this.filterStoreService.hideMissingPlots = this.hideMissingPlots;
    this.filterStoreService.hideNG4BrainMap = this.hideNG4BrainMap;
    this.filterStoreService.hideNotReady4Delay = this.hideNotReady4Delay;
    this.filterStoreService.loadedSessions = this.allSessions

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
  async fetchSessions() {
    this.hideMissingPlots = false;
    this.hideMissingEphys = false;
    this.hideNG4BrainMap = false;
    this.hideNotReady4Delay = false;

    const filters = {}

    // Store the filters, regardless if it is empty
    this.filterStoreService.storeSessionFilter(filters);
    
    // Add the default sorting for the api request
    filters['__order'] = 'session_start_time DESC';
    // filters['__page'] = this.pageIndex
    // filters['__limit'] = this.pageSize

    this.allSessions = await this.allSessionsService.fetchSessions(filters).toPromise();
    this.allSessions = this.allSessions['records'];
    //record count json and assign it here 
  }

  setDropDownFormOptions(dropDownMenuOptionKey, formControl: AbstractControl, key: string) {
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
      this.session_filter_form.controls.sex['controls'][sexType].enable();
    }
    else {
      this.session_filter_form.controls.sex['controls'][sexType].patchValue(false);
      this.session_filter_form.controls.sex['controls'][sexType].disable();
    }
  }

  private createMenu(restrictedSessions: Array<any>) {
    const keys = ['task_protocol', 'session_start_time',
    'session_uuid', 'session_lab', 'subject_birth_date', 'subject_line',
    'subject_uuid', 'sex', 'subject_nickname', 'responsible_user', 'session_project'];
    
    keys.forEach(key => {
      this.uniqueValuesForEachAttribute[key] = new Set();
    })

    // Loop through each tuple
    restrictedSessions.forEach(tuple => {
      keys.forEach(key => {
        if (tuple[key] !== null && !this.uniqueValuesForEachAttribute[key].has(tuple[key])) {
          // Add it to the uniqueValuesForColumns if it doesn't already exist in there
          this.uniqueValuesForEachAttribute[key].add(tuple[key])
        }
      })
    });
    
    // Deal with specific case for
    this.patchSexMaterial(Sex.FEMALE, this.uniqueValuesForEachAttribute['sex'].has('F'));
    this.patchSexMaterial(Sex.MALE, this.uniqueValuesForEachAttribute['sex'].has('M'));
    this.patchSexMaterial(Sex.UNDEFINED, this.uniqueValuesForEachAttribute['sex'].has('U'));

    // This is for selected or not for sex, don't know why this is here blame Maho
    this.uniqueValuesForEachAttribute['sex'] = {
      F: false,
      M: false,
      U: false
    }

    // Deal with figureing out the range of dates
    const sessionSeconds = [];
    this.uniqueValuesForEachAttribute['session_start_time'].forEach(date => {
      sessionSeconds.push(new Date(date).getTime());
    });

    this.sessionMinDate = new Date(Math.min(...sessionSeconds));
    this.sessionMaxDate = new Date(Math.max(...sessionSeconds));

    // Figure out what dates are valid and assign it to this.sessionDateFilter for the material table to highlight those date
    this.sessionDateFilter = (date: Date): boolean => {
      let sessionDates = [];
      this.uniqueValuesForEachAttribute['session_start_time'].forEach(date => {
        sessionDates.push(date.toString().substring(0, 10)); // Split it at T and only take the first half
      });
      // filter out dates without any session
      return (date == null ? true : sessionDates.includes(date.toISOString().split('T')[0]))
    };

    // Figure out what dates for the mouse Birthday Filter are valid and assign it to this.sessionDateFilter for the material table to highlight those date
    this.miceBirthdayFilter = (calendarDate: Date): boolean => {
      let birthDates = [];
      this.uniqueValuesForEachAttribute['subject_birth_date'].forEach(date => {
        birthDates.push(date);
      }); 
      return (calendarDate == null ? true : birthDates.includes(calendarDate.toISOString().split('T')[0]))
    };

    // Set material from drop down
    this.setDropDownFormOptions('filteredSessionLabOptions', this.session_filter_form.controls.session_lab, 'session_lab');
    this.setDropDownFormOptions('filteredSubjectNicknameOptions', this.session_filter_form.controls.subject_nickname, 'subject_nickname');
    this.setDropDownFormOptions('filteredSessionProjectOptions', this.session_filter_form.controls.session_project, 'session_project');
    this.setDropDownFormOptions('filteredSubjectUuidOptions',  this.session_filter_form.controls.subject_uuid, 'subject_uuid');
    this.setDropDownFormOptions('filteredSessionUuidOptions',  this.session_filter_form.controls.session_uuid, 'session_uuid');
    this.setDropDownFormOptions('filteredTaskProtocolOptions',  this.session_filter_form.controls.task_protocol, 'task_protocol');
    this.setDropDownFormOptions('filteredSubjectLineOptions',  this.session_filter_form.controls.subject_line, 'subject_line');
    this.setDropDownFormOptions('filteredResponsibleUserOptions',  this.session_filter_form.controls.responsible_user, 'responsible_user');
  }

  /**
   * Call back to filter the avalible results down to the array with only the valid entries that matches the filter value
   * @param userRestrictionString 
   * @param attributeName 
   * @returns 
   */
  private _filter(userRestrictionString: string, attributeName: string): string[] {
    // If the value is an empty string then just return the array of the unique set
    if (userRestrictionString === '' || userRestrictionString === null) {
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

  /**
   * Updates filter menu whenever user selects a filter option
   * @param event
   */
  async updateMenu() {
    const restrictedSessions = await this.applyFilter();
    this.createMenu(restrictedSessions);
  }

  /**
   * Recreates menu for the focused field without restriction on the focused field
   * @param event
   */
  async stepBackMenu(event) {
    //this.isLoading = true;
    // disregard the sex option since user can always see the options and unclick to de-restrict
    let currentlyActiveAttributeName: string = event.target.name;
    
    // Check if the field is filled out, if not then ignore
    const restrictionObject = this.session_filter_form.getRawValue();
    if (restrictionObject[currentlyActiveAttributeName] !== null && restrictionObject[currentlyActiveAttributeName] !== '') {
      const t0 = performance.now()
      const restrictedSessions = await this.applyFilter(currentlyActiveAttributeName);
      await this.createMenu(restrictedSessions);
    }

    //this.isLoading = false;
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
    return;
    const filterList = Object.entries(this.session_filter_form.getRawValue());
    const brainRegionRequest = this.requested_BR;
    const requestFilter = {};
    let requestJSONstring = '';
    
    filterList.forEach((filter: Array<any>) => {
      // filter is [["session_lab", "somelab"], ["subject_nickname", null]...]
      const filterKey = filter[0].split('')[0]; // filter[0] is control name like 'session_lab'
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
              if (!this.isSessionDateUsingRange) {
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
            ////      ["session_range_filter", { session_range_start: null, session_range_end: null }]
            if (this.isSessionDateUsingRange && filter[1]['session_range_start'] && filter[1]['session_range_end']) {

              const sessionStart = moment.utc(filter[1]['session_range_start'].toString());
              const sessionEnd = moment.utc(filter[1]['session_range_end'].toString());
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
            } else if (this.isSessionDateUsingRange && filter[1]['session_range_start'] && !filter[1]['session_range_end']) {
                // console.log('all session from ', filter[1]['session_range_start'], ' requested!');
              const sessionStart = moment.utc(filter[1]['session_range_start'].toString());
                const rangeStartTime = '00:00:00';
                const startString = sessionStart.toISOString().split('T')[0] + 'T' + rangeStartTime;
                const rangeStart = '"' + 'session_start_time>' + '\'' + startString + '\'' + '"';
                if (requestJSONstring.length > 0) {
                  requestJSONstring += ',' + rangeStart;
                } else {
                  requestJSONstring += rangeStart;
                }
            } else if (this.isSessionDateUsingRange && !filter[1]['session_range_start'] && filter[1]['session_range_end']) {
                // console.log('all session up to ', filter[1]['session_range_end'], ' requested!');
              const sessionEnd = moment.utc(filter[1]['session_range_end'].toString());
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

  /**
   * 
   * @param tuple Tuple object, the keys should be the attribute names
   * @param restrictionObjectFromForm restriction object
   * @returns boolean of whether the tuple match the restriction or not
   */
  doesTupleMatchRestriction(tuple: any, restrictionObject: any): boolean {
    for (let attributeName of Object.keys(restrictionObject)) {
      if (restrictionObject[attributeName] !== null && restrictionObject[attributeName] !== '') {
        if (attributeName === 'session_range_filter') {
          if (this.isSessionDateUsingRange) {
            const tupleDate = moment.utc(tuple['session_start_time'])

            // Deals with start time
            if (restrictionObject[attributeName]['session_range_start'] && tupleDate.valueOf() - restrictionObject[attributeName]['session_range_start'].valueOf() < 0) {
              // Session start date is valid thus check if the tuple matches the requirement
              return false;
            }

            // Deal with end time - adding 1 day in milliseconds to make sure the end date is inclusive up to 1 millisecond before midnight of the next day
            if (restrictionObject[attributeName]['session_range_end'] && tupleDate.valueOf() - (restrictionObject[attributeName]['session_range_end'].valueOf() + 86400000) >= 0) {
              return false;
            }
          }  
        }
        else if (attributeName === 'session_start_time') {
          if (!this.isSessionDateUsingRange) {
            // make sure only  the date of the tuple value is compared to the form restriction value
            if (tuple[attributeName].substr(0, 10) !== restrictionObject[attributeName].format('YYYY-MM-DD')) {
              return false;
            }
          }
        }
        else if (attributeName === 'subject_birth_date') {
          if (tuple[attributeName] !== restrictionObject[attributeName].format('YYYY-MM-DD')) {
            return false;
          }
        }
        else if (attributeName === 'sex') {
          let isTheFormNotNull = false;
          // Check if the form for sex has anything checked
          for (let sexOption of restrictionObject[attributeName]) {
            if (sexOption) {
              isTheFormNotNull = true;
              break
            }
          }

          // Check if the form is not null, if so then do the procesing
          if (isTheFormNotNull) {
            // Handle sex
            let indexToCheck = this.genderForm2MenuMap[tuple[attributeName]];

            if (indexToCheck === undefined) {
              throw Error('Invalid gender found in the tuple object of: ' + String(tuple))
            }

            if (!restrictionObject[attributeName][indexToCheck]) {
              // The tuple doesn't have the right sex, thus return false
              return false;
            }
          }
        }
        else if (tuple[attributeName] !== restrictionObject[attributeName]) {
          // The attribute type is not one of the speical ones, thus just check if it equals each other
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Update the table view to this.restrictedSessions
   */
  updateTableView(restrictedSessions: Array<any>) {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.data = restrictedSessions;
  }

  /**
   * Triggers when user presses the apply filter button
   */
  async handleApplyFilterButtonPress() {
    this.isLoading = true;
    // store current filter content to storage
    let filter = Object.assign({}, this.session_filter_form.getRawValue())
    // NOTE: deleting the non-dropdown field for now - needs to process filter form data to match the format read by the params like below if we are to keep the existing param read parsing style
    // sex field needs to be converted into {__json: '[[{"sex":"F"}]]' } for single selection, {_json: '[[{"sex":"F"},{"sex":"M"}]]'} for multiple selection for param to work 
    // not sure about the start time/range filter application at the moment
    // format for start_time on the djcompute along with the sex field is like this 
    // {__json: "["session_start_time>'2021-04-08T00:00:00'","session_start_time<'2021-04-08T23:59:59'",[{"sex":"F"},{"sex":"M"}]]"}
    // filter['__json'] = '[[{"sex":"F"},{"sex":"M"}]]'
    if (this.isSessionDateUsingRange) {
      delete filter.session_start_time
    }
    else {
      delete filter.session_range_filter
    }
    this.filterStoreService.storeSessionFilter(filter);


    this.restrictedSessions = await this.applyFilter();
    this.createMenu(this.restrictedSessions);
    await this.updateTableView(this.restrictedSessions);
    this.isLoading = false;
  }

  /**
   * Computes the restrictions based on what filters are provided and dump what tuples matches into this.restrictedTuple()
   * @returns 
   */
  async applyFilter(focusFieldKey?: string) {
    if (!this.allSessions) {
      return [];
    }

    // Hide certain checkboxes
    this.hideMissingPlots = false;
    this.hideMissingEphys = false;
    this.hideNG4BrainMap = false;
    this.hideNotReady4Delay = false;
    
    let tupleToRestrict = this.allSessions // By default this should be all sessions

    // Check if there is a brain region request, if so override the tupleToRestrict reference
    const brainRegionRequest = this.requested_BR;
    if (brainRegionRequest.length !== 0) {
      // BrainRegionRequest is not empty, thus query the backend for it
      let requestFilter = {}
      let BR_JSONstring = '';
      if (brainRegionRequest.length > 0) {
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

      // Add it it to the requestFilter object
      if (brainRegionRequest.length > 0) {
        requestFilter['__json_kwargs'] = '{ "brain_regions": ' + BR_JSONstring + '}';
      }

      // Add the default sorting for the api request
      requestFilter['__order'] = 'session_start_time DESC';

      // Query back end
      tupleToRestrict = await this.allSessionsService.fetchSessions(requestFilter).toPromise();
    }
    
    // Filter based on what the user requested
    let restrictionObjectFromForm = this.session_filter_form.getRawValue();

    // if user is focusing on a specific field, then remove the currently focused field's restriction value from menu creation
    if (focusFieldKey) {
      restrictionObjectFromForm[focusFieldKey] = null;
    }

    // Iterate through the tuples and restrict accordingly
    // This is kind of stupid cause it doesn't check if the restrictionObjectFromForm even have a valid restriction
    let restrictedSessions = [];
    for (let tuple of tupleToRestrict) {
      if (this.doesTupleMatchRestriction(tuple, restrictionObjectFromForm)) {
        restrictedSessions.push(tuple);
      }
    }
    return restrictedSessions;
  }

  /**
   * Triggers when user presses the refresh data button - filters persist, data is refetched
   */
  async refreshData() {
    this.isLoading = true;
    this.filterStoreService.refreshSessionTableState();
    await this.fetchSessions();
    this.restrictedSessions = await this.applyFilter();
    this.createMenu(this.restrictedSessions);
    await this.updateTableView(this.restrictedSessions);
    this.isLoading = false;
  }

  /**
   * Triggers when user presses the reset filter button - no new fetch here, just clearing the input fields and stored state
   */
  async handleResetFilterButtonPress() {
    this.isLoading = true;
    for (const control in this.session_filter_form.controls) {
      const toReset = {}
      
      if (control === 'session_range_filter') {
        toReset[control] = { 'session_range_start': null, 'session_range_end': null}
        
      } else if (control === 'sex') {
        toReset[control] = [false, false, false];
        for (const index in this.session_filter_form.get(control)['controls']) {
          this.session_filter_form.get(control).get([index]).enable();
        }
      } else {
        toReset[control] = null;
      }
      this.session_filter_form.patchValue(toReset); 
    }

    this.route.queryParams.subscribe(async param => {
      if (Object.keys(param).length > 0) {
        // Clear all URL params, and do a fresh fetch
        this.router.navigate(
          [],
          {
            relativeTo: this.route,
            queryParams: null
          });
      }
    })

    // clear the filter in storage before applying filter
    this.filterStoreService.clearSessionFilter();
    
    this.restrictedSessions = await this.applyFilter();
    this.createMenu(this.restrictedSessions);

    // intention here is to reset the sort/pagination to default state before updating table view 
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 25;
    // the below is to remove the arrow UI that doesn't go away after this.sort.active = '' 
    this.sort.sortables.forEach(sortItem => {
      this.sort.sort(sortItem);
    });
    this.sort.active = '';

    await this.updateTableView(this.restrictedSessions);
    this.isLoading = false;
    return;
  }

  storeTableInfo(event) {
    return;
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
      // console.log('only show those good for brain map')
      
      criteria.push(_.map(this.restrictedSessions, x => x.good_enough_for_brainwide_map > 0));
    }
    
    if (this.hideNotReady4Delay) {
      // console.log('only show those ready for delay')
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

  filterNode(node, word, selectAll) {
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
