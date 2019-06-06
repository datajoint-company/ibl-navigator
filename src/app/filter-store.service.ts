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
  sessionPageIndexInfo: number;
  sessionPageSizeInfo: number;
  sessionSortInfo: Object;
  micePageIndexInfo: number;
  micePageSizeInfo: number;
  miceSortInfo: Object;
  summaryPageIndexInfo: number;
  summaryPageSizeInfo: number;
  summarySortInfo: Object;
  constructor() { }

  // ========= Session List Filter Sticky ===============//
  storeSessionFilter(filterForm) {
    this.sessionFilter = filterForm;
  }

  storeSessionTableState(pageIndex, pageSize, sorter) {
    if (pageSize) {
      this.sessionPageIndexInfo = pageIndex;
      this.sessionPageSizeInfo = pageSize;
    } else if (sorter) {
      this.sessionSortInfo = sorter;
    }
    // console.log(this.sessionPageIndexInfo, this.sessionPageSizeInfo, this.sessionSortInfo);
  }

  retrieveSessionFilter() {
    return this.sessionFilter;
  }

  retrieveSessionTableState() {
    return <[number, number, Object]>[this.sessionPageIndexInfo, this.sessionPageSizeInfo, this.sessionSortInfo];
  }

  clearSessionFilter() {
    this.sessionFilter = {};
  }

  clearSessionTableState() {
    this.sessionPageIndexInfo = null;
    this.sessionPageSizeInfo = null;
    this.sessionSortInfo = {};
  }

// ========= Mouse List Filter Sticky ===============//
  storeMouseFilter(filterForm) {
    this.mouseFilter = filterForm;
  }

  storeMouseTableState(pageIndex, pageSize, sorter) {
    if (pageSize) {
      this.micePageIndexInfo = pageIndex;
      this.micePageSizeInfo = pageSize;
    } else if (sorter) {
      this.miceSortInfo = sorter;
    }
    // console.log(this.micePageIndexInfo, this.micePageSizeInfo, this.miceSortInfo);
  }

  retrieveMouseFilter() {
    // return {sex: 'F'};
    return this.mouseFilter;
  }
  retrieveMouseTableState() {
    return <[number, number, Object]>[this.micePageIndexInfo, this.micePageSizeInfo, this.miceSortInfo];
  }

  clearMouseFilter() {
    this.mouseFilter = {};
  }
  clearMouseTableState() {
    this.micePageIndexInfo = null;
    this.micePageSizeInfo = null;
    this.miceSortInfo = {};
  }

  // ========= Mouse List Filter Sticky ===============//

  storeSummaryFilter(filterForm) {
    this.summaryFilter = filterForm;
  }

  storeSummaryTableState(pageIndex, pageSize, sorter) {
    if (pageSize) {
      this.summaryPageIndexInfo = pageIndex;
      this.summaryPageSizeInfo = pageSize;
    } else if (sorter) {
      this.summarySortInfo = sorter;
    }
  }

  retrieveSummaryFilter() {
    return this.summaryFilter;
  }

  retrieveSummaryTableState() {
    return <[number, number, Object]>[this.summaryPageIndexInfo, this.summaryPageSizeInfo, this.summarySortInfo];
  }

  clearSummaryFilter() {
    this.summaryFilter = {};
  }

  clearSummaryTableState() {
    this.summaryPageIndexInfo = null;
    this.summaryPageSizeInfo = null;
    this.summarySortInfo = {};
  }
}
