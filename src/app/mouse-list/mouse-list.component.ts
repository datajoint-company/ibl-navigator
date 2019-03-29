import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AllMiceService } from './all-mice.service';

@Component({
  selector: 'app-mouse-list',
  templateUrl: './mouse-list.component.html',
  styleUrls: ['./mouse-list.component.css']
})
export class MouseListComponent implements OnInit, OnDestroy {
  mice;

  private miceSubscription: Subscription;

  constructor(public allMiceService: AllMiceService) { }

  ngOnInit() {
    this.allMiceService.getAllMice();
    this.miceSubscription = this.allMiceService.getMiceLoadedListener()
      .subscribe((mice: any) => {
        this.mice = mice;
      });
  }

  ngOnDestroy() {
    if (this.miceSubscription) {
      this.miceSubscription.unsubscribe();
    }
  }

}
