import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterStoreService {
  sessionFilter: Object;
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
}
