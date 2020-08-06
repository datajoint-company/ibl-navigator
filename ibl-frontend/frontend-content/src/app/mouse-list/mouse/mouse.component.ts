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
  mouse: any;
  cleanMouse; // for returning as query param going back to sessions list for the mouse

  constructor(private route: ActivatedRoute, public allMiceService: AllMiceService) { }

  ngOnInit() {
    this.mouse_uuid = this.route.snapshot.paramMap.get('mouseUUID');
    // console.log('inside mouse component');
    // console.log('subject_uuid: ', this.mouse_uuid);
    this.allMiceService.retrieveMice({'subject_uuid': this.mouse_uuid});
    // console.log('subject_uuid type is: ', typeof this.mouse_uuid);
    this.mouseSubscription = this.allMiceService.getRequestedMiceLoadedListener()
      .subscribe((mouse: any) => {
        // console.log('got the mouse with uuid ', this.mouse_uuid);
        // console.log(mouse);
        this.mouse = mouse[0];

        this.cleanMouse = {
          lab_name: this.mouse.lab_name,
          session_project: this.mouse.projects,
          responsible_user: this.mouse.responsible_user,
          sex: this.mouse.sex,
          subject_birth_date: this.mouse.subject_birth_date,
          subject_line: this.mouse.subject_line,
          subject_nickname: this.mouse.subject_nickname,
          subject_uuid: this.mouse.subject_uuid
        };
      });
  }

  ngOnDestroy() {
    if (this.mouseSubscription) {
      this.mouseSubscription.unsubscribe();
    }
  }

}
