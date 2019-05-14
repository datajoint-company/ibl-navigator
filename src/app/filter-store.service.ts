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

  // ========= Session List Filter Sticky ===============//
  storeSessionFilter(filterForm) {
    this.sessionFilter = filterForm;
  }

  storeSessionTableState(pageIndex, pageSize, sorter) {
    if (pageSize) {
      this.pageIndexInfo = pageIndex;
      this.pageSizeInfo = pageSize;
    } else if (sorter) {
      this.sortInfo = sorter;
    }
    console.log(this.pageIndexInfo, this.pageSizeInfo, this.sortInfo);
  }

  retrieveSessionFilter() {
    return this.sessionFilter;
  }

  retrieveSessionTableState() {
    return [this.pageIndexInfo, this.pageSizeInfo, this.sortInfo];
  }

  clearSessionFilter() {
    this.sessionFilter = {};
  }

  clearSessionTableState() {
    this.pageIndexInfo = null;
    this.pageSizeInfo = null;
    this.sortInfo = {};
  }

// ========= Mouse List Filter Sticky ===============//
  storeMouseFilter(filterForm) {
    this.mouseFilter = filterForm;
  }

  storeMouseTableState(pageIndex, pageSize, sorter) {
    if (pageSize) {
      this.pageIndexInfo = pageIndex;
      this.pageSizeInfo = pageSize;
    } else if (sorter) {
      this.sortInfo = sorter;
    }
    // console.log(this.pageIndexInfo, this.pageSizeInfo, this.sortInfo);
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

  // ========= Mouse List Filter Sticky ===============//

  storeSummaryFilter(filterForm) {
    this.summaryFilter = filterForm;
  }

  storeSummaryTableState(pageIndex, pageSize, sorter) {
    if (pageSize) {
      this.pageIndexInfo = pageIndex;
      this.pageSizeInfo = pageSize;
    } else if (sorter) {
      this.sortInfo = sorter;
    }
  }

  retrieveSummaryFilter() {
    return this.summaryFilter;
  }

  retrieveSummaryTableState() {
    return [this.pageIndexInfo, this.pageSizeInfo, this.sortInfo];
  }

  clearSummaryFilter() {
    this.summaryFilter = {};
  }

  clearSummaryTableState() {
    this.pageIndexInfo = null;
    this.pageSizeInfo = null;
    this.sortInfo = {};
  }
}
