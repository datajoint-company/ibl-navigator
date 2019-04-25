import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Subscription, Observable, Subject } from 'rxjs';
import { MousePlotsService } from '../mouse-plots.service';

declare var Plotly: any;

@Component({
  selector: 'app-by-date-result-plots',
  templateUrl: './by-date-result-plots.component.html',
  styleUrls: ['./by-date-result-plots.component.css']
})
export class ByDateResultPlotsComponent implements OnInit, OnDestroy {
  recent3dates = [];
  datePsychPlotList = [];
  dateRTCPlotList = [];
  dateRTTPlotList = [];
  private datePsychPlotSubscription: Subscription;
  private dateRTContrastPlotSubscription: Subscription;
  private dateRTTrialNumPlotSubscription: Subscription;

  private recent3datesLoaded = new Subject();

  @Input('mouseInfo') mouseInfo: Object;
  constructor(public mousePlotsService: MousePlotsService) { }
  // @ViewChild('datePsychCurvePlot') elPsych: ElementRef;
  // @ViewChild('dateRTContrastPlot') elRTContrast: ElementRef;
  // @ViewChild('dateRTTrialNumPlot') elRTTrialNum: ElementRef;
  @ViewChild('datePsychCurvePlot1') elPsych1: ElementRef;
  @ViewChild('dateRTContrastPlot1') elRTContrast1: ElementRef;
  @ViewChild('dateRTTrialNumPlot1') elRTTrialNum1: ElementRef;
  @ViewChild('datePsychCurvePlot2') elPsych2: ElementRef;
  @ViewChild('dateRTContrastPlot2') elRTContrast2: ElementRef;
  @ViewChild('dateRTTrialNumPlot2') elRTTrialNum2: ElementRef;
  @ViewChild('datePsychCurvePlot3') elPsych3: ElementRef;
  @ViewChild('dateRTContrastPlot3') elRTContrast3: ElementRef;
  @ViewChild('dateRTTrialNumPlot3') elRTTrialNum3: ElementRef;
  ngOnInit() {
    const elementList = [];
    elementList.push({ elPsych: this.elPsych1.nativeElement, elRTContrast: this.elRTContrast1.nativeElement, elRTTrialNum: this.elRTTrialNum1.nativeElement });
    elementList.push({ elPsych: this.elPsych2.nativeElement, elRTContrast: this.elRTContrast2.nativeElement, elRTTrialNum: this.elRTTrialNum2.nativeElement });
    elementList.push({ elPsych: this.elPsych3.nativeElement, elRTContrast: this.elRTContrast3.nativeElement, elRTTrialNum: this.elRTTrialNum3.nativeElement });
    // const elPsych1 = this.elPsych1.nativeElement;
    // const elRTContrast1 = this.elRTContrast1.nativeElement;
    // const elRTTrialNum1 = this.elRTTrialNum1.nativeElement;
    // const elPsych2 = this.elPsych2.nativeElement;
    // const elRTContrast2 = this.elRTContrast2.nativeElement;
    // const elRTTrialNum2 = this.elRTTrialNum2.nativeElement;
    // const elPsych3 = this.elPsych3.nativeElement;
    // const elRTContrast3 = this.elRTContrast3.nativeElement;
    // const elRTTrialNum3 = this.elRTTrialNum3.nativeElement;
    this.mousePlotsService.getDatePsychPlot({ 'subject_uuid': this.mouseInfo['subject_uuid'], '__order': 'session_date'});
    this.datePsychPlotSubscription = this.mousePlotsService.getDatePsychPlotLoadedListener()
      .subscribe((psychCurveInfo: any) => {
        if (psychCurveInfo && psychCurveInfo.length > 0) {
          this.datePsychPlotList = psychCurveInfo;
          psychCurveInfo.reverse();
          const recent3 = psychCurveInfo.slice(0, 3);
          console.log('going through datepsychcurve');
          recent3.forEach((plot, index) => {
            console.log('evaluating psych Curve plot:', plot);
            this.recent3dates.push(plot['session_date']);
            const datePsychPlot = plot['plotting_data'];
            Plotly.newPlot(elementList[index].elPsych, datePsychPlot['data'], datePsychPlot['layout']);
          });
          this.recent3datesLoaded.next(this.recent3dates);
        } else {
          console.log('date psychometric curve unavailable');
        }
      });
    this.getRecent3DatesLoadedListener().subscribe((dates) => {
      console.log('recent 3 dates ready', dates);
      console.log(typeof dates);
      this.mousePlotsService.getDateRTContrastPlot({ 'subject_uuid': this.mouseInfo['subject_uuid'], '__order': 'session_date' });
      this.dateRTContrastPlotSubscription = this.mousePlotsService.getDateRTContrastPlotLoadedListener()
        .subscribe((DRTCplotInfo: any) => {
          console.log('date RT contrast plot data here...?');
          if (DRTCplotInfo && DRTCplotInfo.length > 0) {
            this.dateRTCPlotList = DRTCplotInfo;
            DRTCplotInfo.reverse();
            const recent3 = DRTCplotInfo.slice(0, 3);
            console.log('going through dateRTContrast');
            this.recent3dates.forEach((date, idx) => {
              let RTCmatchFound = false;
              console.log(date);
              recent3.forEach((plot, index) => {
                if (plot['session_date'] === date) {
                  RTCmatchFound = true;
                  console.log('session date match in contrast!!', plot['session_date'], 'at index', index);
                  const dateRTCPlot = plot['plotting_data'];
                  Plotly.newPlot(elementList[idx].elRTContrast, dateRTCPlot['data'], dateRTCPlot['layout']);
                }
              });
              if (!RTCmatchFound) {
                Plotly.newPlot(elementList[idx].elRTContrast, []);
              }
            });
          } else {
            console.log('date reaction time contrast plot unavailable');
          }
        });
      this.mousePlotsService.getDateRTTrialNumPlot({ 'subject_uuid': this.mouseInfo['subject_uuid'], '__order': 'session_date' });
      this.dateRTTrialNumPlotSubscription = this.mousePlotsService.getDateRTTrialNumPlotLoadedListener()
        .subscribe((plotInfo: any) => {
          if (plotInfo && plotInfo.length > 0) {
            this.dateRTTPlotList = plotInfo;
            plotInfo.reverse();
            const recent3 = plotInfo.slice(0, 3);
            this.recent3dates.forEach((date, idx) => {
              let RTTNmatchFound = false;
              recent3.forEach((plot, index) => {
                console.log('evaluating TrialNum plot:', plot);
                console.log('date:', date, 'idx:', idx);
                if (plot['session_date'] === date) {
                  RTTNmatchFound = true;
                  console.log('session date match in trialNum!', plot['session_date'], 'at index:', index, '& at idx:', idx);
                  const dateRTTPlot = plot['plotting_data'];
                  Plotly.newPlot(elementList[idx].elRTTrialNum, dateRTTPlot['data'], dateRTTPlot['layout']);
                }
              });
              console.log('match has been found:', RTTNmatchFound, ' at round', idx);
              if (!RTTNmatchFound) {
                Plotly.newPlot(elementList[idx].elRTTrialNum, []);
              }
            });
          } else {
            console.log('date reaction time trial number plot unavailable');
          }
        });
    });
  }

  ngOnDestroy() {
    if (this.datePsychPlotSubscription && this.dateRTContrastPlotSubscription &&
      this.dateRTTrialNumPlotSubscription && this.recent3datesLoaded) {
      this.datePsychPlotSubscription.unsubscribe();
      this.dateRTContrastPlotSubscription.unsubscribe();
      this.dateRTTrialNumPlotSubscription.unsubscribe();
      this.recent3datesLoaded.unsubscribe();
    }
  }

  getRecent3DatesLoadedListener() {
    return this.recent3datesLoaded.asObservable();
  }

}
