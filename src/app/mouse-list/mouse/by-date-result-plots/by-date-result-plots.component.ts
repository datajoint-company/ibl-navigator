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
  d3 = Plotly.d3;

  byDateResultPlotsAreAvailable: boolean;
  loadingPlots = [true, true, true, true, true, true, true, true, true];
  plotConfig = {
    responsive: true,
    showLink: false,
    showSendToCloud: false,
    displaylogo: false,
    modeBarButtonsToRemove: ['toImage'],
    modeBarButtonsToAdd: [
      {
        name: 'toPngImage',
        title: 'download plot as png',
        icon: Plotly.Icons.download_png,
        click: function (gd) {
          var toPngImageButtonOptions = gd._context.toImageButtonOptions;
          toPngImageButtonOptions.format = 'png';
          Plotly.downloadImage(gd, toPngImageButtonOptions);
        }
      },
      {
        name: 'toSVGImage',
        title: 'download plot as svg',
        icon: Plotly.Icons.download_svg,
        format: 'svg',
        click: function (gd) {
          var toSvgImageButtonOptions = gd._context.toImageButtonOptions;
          toSvgImageButtonOptions.format = 'svg';
          Plotly.downloadImage(gd, toSvgImageButtonOptions);
        }
      }
    ],
    toImageButtonOptions: {
      filename: '',
      scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
    }
  };
  recent3dates = [];
  datePsychPlotList = [];
  dateRTCPlotList = [];
  dateRTTPlotList = [];
  private datePsychPlotSubscription: Subscription;
  private dateRTContrastPlotSubscription: Subscription;
  private dateRTTrialNumPlotSubscription: Subscription;

  private recent3datesLoaded = new Subject();
  @Output() byDateResultPlotsAvailability: EventEmitter<any> = new EventEmitter();
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
    const screenSizeInitial = window.innerWidth;
    const elementList = [];
    elementList.push({ elPsych: this.elPsych1.nativeElement, elRTContrast: this.elRTContrast1.nativeElement, elRTTrialNum: this.elRTTrialNum1.nativeElement });
    elementList.push({ elPsych: this.elPsych2.nativeElement, elRTContrast: this.elRTContrast2.nativeElement, elRTTrialNum: this.elRTTrialNum2.nativeElement });
    elementList.push({ elPsych: this.elPsych3.nativeElement, elRTContrast: this.elRTContrast3.nativeElement, elRTTrialNum: this.elRTTrialNum3.nativeElement });

    const mediumScreenLayout = {
      font: { size: '10.5' },
      width: '380',
      legend: {
        x: '-0.5',
        y: '-0.4',
        font: {
          size: '9'
        }
      }
    };

    const mediumScreenPsychCurveLayout = {
      font: { size: '10.5' },
      width: '450',
      legend: {
        x: '1',
        y: '0.5',
        font: {
          size: '9'
        }
      }
    };

    const mediumScreenDataStyle = {
      // marker: { size: '3', color: 'black'}
    };

    const mediumLargeScreenLayout = {
      font: { size: '11' },
      width: '400',
      legend: {
        x: '-0.5',
        y: '-0.4',
        font: {
          size: '9.5'
        }
      }
    };

    const mediumLargeScreenPsychCurveLayout = {
      font: { size: '11' },
      width: '480',
      legend: {
        x: '1',
        y: '0.5',
        font: {
          size: '9.5'
        }
      }
    };

    const mediumLargeScreenDataStyle = {
      // marker: { size: '4', color: 'black' }
    };

    const defaultScreenLayout = {
      font: { size: '' },
      width: '',
      legend: {
        x: '1',
        y: '1',
        font: {
          size: '12'
        }
      }
    };

    const defaultScreenDataStyle = {
      // marker: { size: '', color: 'black' }
    };

    const RTContrastPlot1_d3 = this.d3.select(this.elRTContrast1.nativeElement)
      .style({
        // width: '100%',
        // 'margin-left': '0',
        // height: '100',
      });
    const responsiveRTCplot1 = RTContrastPlot1_d3.node();
    const responsiveRTCplot2 = this.d3.select(this.elRTContrast2.nativeElement).node();
    const responsiveRTCplot3 = this.d3.select(this.elRTContrast3.nativeElement).node();
    const responsivePCplot1 = this.d3.select(this.elPsych1.nativeElement).node();
    const responsivePCplot2 = this.d3.select(this.elPsych2.nativeElement).node();
    const responsivePCplot3 = this.d3.select(this.elPsych3.nativeElement).node();
    const responsiveRTTNplot1 = this.d3.select(this.elRTTrialNum1.nativeElement).node();
    const responsiveRTTNplot2 = this.d3.select(this.elRTTrialNum2.nativeElement).node();
    const responsiveRTTNplot3 = this.d3.select(this.elRTTrialNum3.nativeElement).node();

    window.onresize = function () {
      const screenWidth = window.innerWidth;
      console.log('screen width change: ', screenWidth);
      mediumScreenLayout['title'] = { text: 'M - ' + screenWidth };
      mediumLargeScreenLayout['title'] = { text: 'ML - ' + screenWidth };
      mediumScreenPsychCurveLayout['title'] = { text: 'M - ' + screenWidth };
      mediumLargeScreenPsychCurveLayout['title'] = { text: 'ML - ' + screenWidth };
      defaultScreenLayout['title'] = { text: 'default - ' + screenWidth };
      if (screenWidth < 1440 && (screenWidth > 1200 || screenWidth === 1200)) {
        Plotly.update(responsiveRTCplot1, mediumLargeScreenDataStyle, mediumLargeScreenLayout);
        Plotly.update(responsiveRTCplot2, mediumLargeScreenDataStyle, mediumLargeScreenLayout);
        Plotly.update(responsiveRTCplot3, mediumLargeScreenDataStyle, mediumLargeScreenLayout);
        Plotly.update(responsiveRTTNplot1, mediumLargeScreenDataStyle, mediumLargeScreenLayout);
        Plotly.update(responsiveRTTNplot2, mediumLargeScreenDataStyle, mediumLargeScreenLayout);
        Plotly.update(responsiveRTTNplot3, mediumLargeScreenDataStyle, mediumLargeScreenLayout);
        Plotly.update(responsivePCplot1, mediumLargeScreenDataStyle, mediumLargeScreenPsychCurveLayout);
        Plotly.update(responsivePCplot2, mediumLargeScreenDataStyle, mediumLargeScreenPsychCurveLayout);
        Plotly.update(responsivePCplot3, mediumLargeScreenDataStyle, mediumLargeScreenPsychCurveLayout);
      } else if (screenWidth < 1200 && (screenWidth > 768 || screenWidth === 768)) {
        Plotly.update(responsiveRTCplot1, mediumScreenDataStyle, mediumScreenLayout);
        Plotly.update(responsiveRTCplot2, mediumScreenDataStyle, mediumScreenLayout);
        Plotly.update(responsiveRTCplot3, mediumScreenDataStyle, mediumScreenLayout);
        Plotly.update(responsiveRTTNplot1, mediumScreenDataStyle, mediumScreenLayout);
        Plotly.update(responsiveRTTNplot2, mediumScreenDataStyle, mediumScreenLayout);
        Plotly.update(responsiveRTTNplot3, mediumScreenDataStyle, mediumScreenLayout);
        Plotly.update(responsivePCplot1, mediumScreenDataStyle, mediumScreenPsychCurveLayout);
        Plotly.update(responsivePCplot2, mediumScreenDataStyle, mediumScreenPsychCurveLayout);
        Plotly.update(responsivePCplot3, mediumScreenDataStyle, mediumScreenPsychCurveLayout);
      // } else if (screenWidth > 1440 || screenWidth === 1440) {
      //   Plotly.relayout(responsiveRTCplot1, defaultScreenLayout);
      //   Plotly.relayout(responsiveRTCplot2, defaultScreenLayout);
      //   Plotly.relayout(responsiveRTCplot3, defaultScreenLayout);
      //   Plotly.relayout(responsivePCplot1, defaultScreenLayout);
      //   Plotly.relayout(responsivePCplot2, defaultScreenLayout);
      //   Plotly.relayout(responsivePCplot3, defaultScreenLayout);
      //   Plotly.relayout(responsiveRTTNplot1, defaultScreenLayout);
      //   Plotly.relayout(responsiveRTTNplot2, defaultScreenLayout);
      //   Plotly.relayout(responsiveRTTNplot3, defaultScreenLayout);
      } else {
        Plotly.update(responsiveRTCplot1, defaultScreenDataStyle, defaultScreenLayout);
        Plotly.update(responsiveRTCplot2, defaultScreenDataStyle, defaultScreenLayout);
        Plotly.update(responsiveRTCplot3, defaultScreenDataStyle, defaultScreenLayout);
        Plotly.update(responsiveRTTNplot1, defaultScreenDataStyle, defaultScreenLayout);
        Plotly.update(responsiveRTTNplot2, defaultScreenDataStyle, defaultScreenLayout);
        Plotly.update(responsiveRTTNplot3, defaultScreenDataStyle, defaultScreenLayout);
        Plotly.update(responsivePCplot1, defaultScreenDataStyle, defaultScreenLayout);
        Plotly.update(responsivePCplot2, defaultScreenDataStyle, defaultScreenLayout);
        Plotly.update(responsivePCplot3, defaultScreenDataStyle, defaultScreenLayout);
      }

    };
    // const elPsych1 = this.elPsych1.nativeElement;
    // const elRTContrast1 = this.elRTContrast1.nativeElement;
    // const elRTTrialNum1 = this.elRTTrialNum1.nativeElement;
    // const elPsych2 = this.elPsych2.nativeElement;
    // const elRTContrast2 = this.elRTContrast2.nativeElement;
    // const elRTTrialNum2 = this.elRTTrialNum2.nativeElement;
    // const elPsych3 = this.elPsych3.nativeElement;
    // const elRTContrast3 = this.elRTContrast3.nativeElement;
    // const elRTTrialNum3 = this.elRTTrialNum3.nativeElement;
    this.mousePlotsService.getDatePsychPlot({ 'subject_uuid': this.mouseInfo['subject_uuid'], '__order': 'session_date DESC'});
    this.datePsychPlotSubscription = this.mousePlotsService.getDatePsychPlotLoadedListener()
      .subscribe((psychCurveInfo: any) => {
        if (psychCurveInfo && psychCurveInfo.length > 0) {
          this.byDateResultPlotsAreAvailable = true;
          this.byDateResultPlotsAvailability.emit(this.byDateResultPlotsAreAvailable);
          this.datePsychPlotList = psychCurveInfo;
          const recent3 = psychCurveInfo.slice(0, 3);
          recent3.forEach((plot, index) => {
            this.recent3dates.push(plot['session_date']);
            const datePsychPlot = plot['plotting_data'];
            datePsychPlot['layout']['width'] = '500';
            datePsychPlot['layout']['height'] = '350';
            this.loadingPlots[index] = false;
            const plotConfig1 = Object.assign({}, this.plotConfig,
              { toImageButtonOptions:
                { filename: this.mouseInfo['subject_nickname'] + '_' + plot['session_date'] + '_psychometric_curve_plot'}});
            Plotly.newPlot(elementList[index].elPsych, datePsychPlot['data'], datePsychPlot['layout'], plotConfig1 );
          });
          if (screenSizeInitial < 1440 && (screenSizeInitial > 1200 || screenSizeInitial === 1200)) {
            Plotly.update(responsivePCplot1, mediumLargeScreenDataStyle, mediumLargeScreenPsychCurveLayout);
            Plotly.update(responsivePCplot2, mediumLargeScreenDataStyle, mediumLargeScreenPsychCurveLayout);
            Plotly.update(responsivePCplot3, mediumLargeScreenDataStyle, mediumLargeScreenPsychCurveLayout);
          } else if (screenSizeInitial < 1200 && (screenSizeInitial > 768 || screenSizeInitial === 768)) {
            Plotly.update(responsivePCplot1, mediumScreenDataStyle, mediumScreenPsychCurveLayout);
            Plotly.update(responsivePCplot2, mediumScreenDataStyle, mediumScreenPsychCurveLayout);
            Plotly.update(responsivePCplot3, mediumScreenDataStyle, mediumScreenPsychCurveLayout);
          }
          // console.log('psych curve done loading: ', this.loadingPlots);
          this.recent3datesLoaded.next(this.recent3dates);
        } else {
          this.loadingPlots = [false, false, false, false, false, false, false, false, false];
          this.byDateResultPlotsAreAvailable = false;
          this.byDateResultPlotsAvailability.emit(this.byDateResultPlotsAreAvailable);
          console.log('date psychometric curve unavailable');
        }
      });
    this.getRecent3DatesLoadedListener().subscribe((dates) => {
      this.mousePlotsService.getDateRTContrastPlot({ 'subject_uuid': this.mouseInfo['subject_uuid'], '__order': 'session_date DESC' });
      this.dateRTContrastPlotSubscription = this.mousePlotsService.getDateRTContrastPlotLoadedListener()
        .subscribe((DRTCplotInfo: any) => {
          if (DRTCplotInfo && DRTCplotInfo.length > 0) {
            this.dateRTCPlotList = DRTCplotInfo;
            const recent3 = DRTCplotInfo.slice(0, 3);
            this.recent3dates.forEach((date, idx) => {
              let RTCmatchFound = false;
              recent3.forEach((plot, index) => {

                if (plot['session_date'] === date) {

                  RTCmatchFound = true;
                  // console.log('session date match in contrast!!', plot['session_date'], 'at index', index);
                  this.loadingPlots[3 + idx] = false;
                  const dateRTCPlot = plot['plotting_data'];
                  dateRTCPlot['layout']['width'] = '';
                  dateRTCPlot['layout']['height'] = '350';
                  const plotConfig2 = Object.assign({}, this.plotConfig,
                    {
                      toImageButtonOptions:
                        { filename: this.mouseInfo['subject_nickname'] + '_' + plot['session_date'] + '_RT_contrast_plot' }
                    });
                  Plotly.newPlot(elementList[idx].elRTContrast, dateRTCPlot['data'], dateRTCPlot['layout'],  plotConfig2 );
                }
              });
              if (!RTCmatchFound) {
                this.loadingPlots[3 + idx] = false;
                Plotly.newPlot(elementList[idx].elRTContrast, [],
                  { title: { text: 'Reaction time - contrast plot unavailable' }, width: '', height: '350' }, this.plotConfig);
              }
            });
            if (screenSizeInitial < 1440 && (screenSizeInitial > 1200 || screenSizeInitial === 1200)) {
              Plotly.update(responsiveRTCplot1, mediumLargeScreenDataStyle, mediumLargeScreenLayout);
              Plotly.update(responsiveRTCplot2, mediumLargeScreenDataStyle, mediumLargeScreenLayout);
              Plotly.update(responsiveRTCplot3, mediumLargeScreenDataStyle, mediumLargeScreenLayout);
            } else if (screenSizeInitial < 1200 && (screenSizeInitial > 768 || screenSizeInitial === 768)) {
              Plotly.update(responsiveRTCplot1, mediumScreenDataStyle, mediumScreenLayout);
              Plotly.update(responsiveRTCplot2, mediumScreenDataStyle, mediumScreenLayout);
              Plotly.update(responsiveRTCplot3, mediumScreenDataStyle, mediumScreenLayout);
            }
          } else {
            this.loadingPlots[3] = false;
            this.loadingPlots[4] = false;
            this.loadingPlots[5] = false;
            console.log('date reaction time contrast plot unavailable');
          }
        });
      this.mousePlotsService.getDateRTTrialNumPlot({ 'subject_uuid': this.mouseInfo['subject_uuid'], '__order': 'session_date DESC' });
      this.dateRTTrialNumPlotSubscription = this.mousePlotsService.getDateRTTrialNumPlotLoadedListener()
        .subscribe((plotInfo: any) => {
          if (plotInfo && plotInfo.length > 0) {
            this.dateRTTPlotList = plotInfo;
            const recent3 = plotInfo.slice(0, 3);
            this.recent3dates.forEach((date, idx) => {
              let RTTNmatchFound = false;
              recent3.forEach((plot, index) => {
                if (plot['session_date'] === date) {
                  RTTNmatchFound = true;
                  // console.log('session date match in trialNum!', plot['session_date'], 'at index:', index, '& at idx:', idx);
                  const dateRTTPlot = plot['plotting_data'];
                  dateRTTPlot['layout']['width'] = '500';
                  dateRTTPlot['layout']['height'] = '350';
                  const plotConfig3 = Object.assign({}, this.plotConfig,
                    {
                      toImageButtonOptions:
                        { filename: this.mouseInfo['subject_nickname'] + '_' + plot['session_date'] + '_RT_trial_number_plot' }
                    });
                  this.loadingPlots[6 + idx] = false;
                  Plotly.newPlot(elementList[idx].elRTTrialNum, dateRTTPlot['data'], dateRTTPlot['layout'], plotConfig3 );
                }
              });
              if (!RTTNmatchFound) {
                this.loadingPlots[6 + idx] = false;
                Plotly.newPlot(elementList[idx].elRTTrialNum, [],
                  { title: { text: 'Reaction time - trial number plot unavailable' }, width: '', height: '350' }, this.plotConfig );
              }
            });
            if (screenSizeInitial < 1440 && (screenSizeInitial > 1200 || screenSizeInitial === 1200)) {
              Plotly.update(responsiveRTTNplot1, mediumLargeScreenDataStyle, mediumLargeScreenLayout);
              Plotly.update(responsiveRTTNplot2, mediumLargeScreenDataStyle, mediumLargeScreenLayout);
              Plotly.update(responsiveRTTNplot3, mediumLargeScreenDataStyle, mediumLargeScreenLayout);
            } else if (screenSizeInitial < 1200 && (screenSizeInitial > 768 || screenSizeInitial === 768)) {
              Plotly.update(responsiveRTTNplot1, mediumScreenDataStyle, mediumScreenLayout);
              Plotly.update(responsiveRTTNplot2, mediumScreenDataStyle, mediumScreenLayout);
              Plotly.update(responsiveRTTNplot3, mediumScreenDataStyle, mediumScreenLayout);
            }
          } else {
            this.loadingPlots[5] = false;
            this.loadingPlots[6] = false;
            this.loadingPlots[7] = false;
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
