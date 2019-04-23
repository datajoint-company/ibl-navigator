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
    console.log('subject_uuid type is: ', typeof this.mouse_uuid);
    this.mouseSubscription = this.allMiceService.getRequestedMiceLoadedListener()
      .subscribe((mouse: any) => {
        console.log('got the mouse with uuid ', this.mouse_uuid);
        console.log(mouse);
        this.mouse = mouse[0];
      });
  }

  ngOnDestroy() {
    if (this.mouseSubscription) {
      this.mouseSubscription.unsubscribe();
    }
  }

  getSessions(mouse) {
    console.log('show session button clicked!');
    console.log(mouse);
  }

}
