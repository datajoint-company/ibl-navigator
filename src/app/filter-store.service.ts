import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterStoreService {
  sessionFilter: Object;
  mouseFilter: Object;
  constructor() { }

  storeSessionFilter(filterForm) {
    this.sessionFilter = filterForm;
  }

  retrieveSessionFilter() {
    // return {sex: 'F'};
    return this.sessionFilter;
  }

  clearSessionFilter() {
    this.sessionFilter = {};
  }

  storeMouseFilter(filterForm) {
    this.mouseFilter = filterForm;
  }

  retrieveMouseFilter() {
    // return {sex: 'F'};
    return this.mouseFilter;
  }

  clearMouseFilter() {
    this.mouseFilter = {};
  }
}
