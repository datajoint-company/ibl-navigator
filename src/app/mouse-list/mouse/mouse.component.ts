import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AllMiceService } from '../all-mice.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mouse',
  templateUrl: './mouse.component.html',
  styleUrls: ['./mouse.component.css']
})
export class MouseComponent implements OnInit, OnDestroy {
  public mouse_uuid: string;
  private mouseSubscription: Subscription;
  mouse: Object;

  constructor(private route: ActivatedRoute, public allMiceService: AllMiceService) { }

  ngOnInit() {
    this.mouse_uuid = this.route.snapshot.paramMap.get('mouseUUID');
    console.log('inside mouse component');
    console.log('subject_uuid: ', this.mouse_uuid);
    this.allMiceService.retrieveMice({'subject_uuid': this.mouse_uuid});
    this.mouseSubscription = this.allMiceService.getRequestedMiceLoadedListener()
      .subscribe((mouse: any) => {
        this.mouse = mouse[0];
      });
  }

  ngOnDestroy() {
    if (this.mouseSubscription) {
      this.mouseSubscription.unsubscribe();
    }
  }

}
