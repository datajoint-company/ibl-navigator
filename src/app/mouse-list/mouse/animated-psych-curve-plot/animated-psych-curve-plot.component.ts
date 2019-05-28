import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { MousePlotsService } from '../mouse-plots.service';

declare var Plotly: any;

@Component({
  selector: 'app-animated-psych-curve-plot',
  templateUrl: './animated-psych-curve-plot.component.html',
  styleUrls: ['./animated-psych-curve-plot.component.css']
})
export class AnimatedPsychCurvePlotComponent implements OnInit {
  private AnimPCplotSubscription: Subscription;
  constructor(public mousePlotsService: MousePlotsService) { }
  @Input() mouseInfo: Object;
  @ViewChild('animatedPsychCurvePlot') element: ElementRef;
  ngOnInit() {
    const element = this.element.nativeElement;
    this.mousePlotsService.getAnimatedPCplot({ 'subject_uuid': this.mouseInfo['subject_uuid']});
    this.AnimPCplotSubscription = this.mousePlotsService.getAnimatedPCplotLoadedListener()
      .subscribe((plotInfo: any) => {
        if (plotInfo && plotInfo.length > 1) {
          const data = plotInfo[0]['plotting_data']['data'];
          const frames = [];
          for (let i = 0; i < plotInfo.length; i++) {
            frames.push({
              name: plotInfo[i]['session_start_time'],
              data: plotInfo[i]['plotting_data']['data']
            });
          }
          const layout = plotInfo[0]['plotting_data']['layout'];

          const sliderSteps = [];
          for (let i = 0; i < plotInfo.length; i++) {
            sliderSteps.push({
              method: 'animate',
              label: plotInfo[i]['session_start_time'].split('T')[0],
              args: [[plotInfo[i]['session_start_time']], {
                mode: 'immediate',
                transition: { duration: 200 },
                frame: { duration: 160, redraw: true },
              }]
            });
          }
          layout['height'] = '600';
          layout['width'] = '800';
          layout['plot_bgcolor'] = 'rgba(0, 0, 0, 0)';
          layout['paper_bgcolor'] = 'rgba(0, 0, 0, 0)';
          layout['title'] = { text: 'Session Psychometric Curve Progression' };
          layout['yaxis'] = {
            range: [-0.1, 1.1],
            autorange: false
          };
          layout['xaxis'] = {
            range: [-110, 110],
            autorange: false
          };
          layout['hovermode'] = 'closest';
          layout['updatemenus'] = [{
            x: 0,
            y: 0,
            yanchor: 'top',
            xanchor: 'left',
            showactive: false,
            direction: 'left',
            type: 'buttons',
            pad: { t: 87, r: 10 },
            buttons: [{
              method: 'animate',
              args: [null, {
                  mode: 'immediate',
                  fromcurrent: true,
                  transition: { duration: 200 },
                  frame: { duration: 160, redraw: true }
                }],
              // label: 'Play'
              label: '<span>\u25B6</span>'
              // label: '<span class="oi oi-media-play"></span>'
              }, {
              method: 'animate',
              args: [[null], {
                mode: 'immediate',
                transition: { duration: 0 },
                frame: { duration: 0, redraw: true }
              }],
                label: '&#10074;&#10074;'
              // label: '<span>\u23F8</span>'
              // label: '<span class="oi oi-media-pause"></span>'
              }]
          }];
          layout['sliders'] = [{
            pad: { l: 130, t: 55 },
            currentvalue: {
              visible: true,
              prefix: 'Session Date:',
              xanchor: 'center',
              font: { size: 16, color: '#666' }
            },
            steps: sliderSteps
          }];

          Plotly.plot(element, {
            data: data,
            layout: layout,
            frames: frames,
            config: {displayModeBar: false}
          });

        }
      });
  }

}
