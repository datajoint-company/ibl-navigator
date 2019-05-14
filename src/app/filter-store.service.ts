import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterStoreService {
  sessionFilter: Object;
  mouseFilter: Object;
  summaryFilter: Object;
  pageIndexInfo: number;
  pageSizeInfo: number;
  sortInfo: Object;
  constructor() { }

  storeSessionFilter(filterForm) {
    this.sessionFilter = filterForm;
  }

  retrieveSessionFilter() {
    return this.sessionFilter;
  }

  clearSessionFilter() {
    this.sessionFilter = {};
  }

  storeMouseFilter(filterForm) {
    this.mouseFilter = filterForm;
  }

  storeMouseTableState(pageIndex, pageSize, sorter) {
    if (pageIndex && pageSize) {
      this.pageIndexInfo = pageIndex;
      this.pageSizeInfo = pageSize;
    } else if (sorter) {
      this.sortInfo = sorter;
    }
    console.log(this.pageIndexInfo, this.pageSizeInfo, this.sortInfo);
  }

  retrieveMouseFilter() {
    // return {sex: 'F'};
    return this.mouseFilter;
  }
  retrieveMouseTableState() {
    return [this.pageIndexInfo, this.pageSizeInfo, this.sortInfo];
  }

  clearMouseFilter() {
    this.mouseFilter = {};
  }
  clearMouseTableState() {
    this.pageIndexInfo = null;
    this.pageSizeInfo = null;
    this.sortInfo = {};
  }

  storeSummaryFilter(filterForm) {
    this.summaryFilter = filterForm;
  }

  retrieveSummaryFilter() {
    return this.summaryFilter;
  }

  clearSummaryFilter() {
    this.summaryFilter = {};
  }
}
