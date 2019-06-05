import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { MousePlotsService } from '../mouse-plots.service';
import { AllSessionsService } from 'src/app/session-list/all-sessions.service';

declare var Plotly: any;

@Component({
  selector: 'app-animated-psych-curve-plot',
  templateUrl: './animated-psych-curve-plot.component.html',
  styleUrls: ['./animated-psych-curve-plot.component.css']
})
export class AnimatedPsychCurvePlotComponent implements OnInit {
  currentFrame;
  current_frame_session_info;
  showInfo;
  private AnimPCplotSubscription: Subscription;
  private sessionQuerySubscription: Subscription;
  constructor(public mousePlotsService: MousePlotsService, public allSessionsService: AllSessionsService) { }
  @Input() mouseInfo: Object;
  @ViewChild('animatedPsychCurvePlot') element: ElementRef;
  ngOnInit() {
    this.showInfo = false;
    const initialScreenSize = window.innerWidth;
    const element = this.element.nativeElement;
    this.mousePlotsService.getAnimatedPCplot({ 'subject_uuid': this.mouseInfo['subject_uuid']});
    this.AnimPCplotSubscription = this.mousePlotsService.getAnimatedPCplotLoadedListener()
      .subscribe((plotInfo: any) => {
        if (plotInfo && plotInfo.length > 1) {
          let data = [];
          // const data = plotInfo[plotInfo.length - 1]['plotting_data']['data'];
          if (plotInfo[0]['plotting_data']['data'].length < 4) {
            data = [
              {
                marker: {
                  color: 'orange',
                  size: '6'
                },
                mode: 'markers',
                name: 'p_left = 0.2, data',
                x: [],
                y: [],
                type: 'scatter'
              },
              {
                marker: {
                  color: 'orange'
                },
                name: 'p_left = 0.2 model fits',
                x: [],
                y: [],
                type: 'scatter'
              },
              plotInfo[0]['plotting_data']['data'][0],
              plotInfo[0]['plotting_data']['data'][1],
              {
                marker: {
                  color: 'cornflowerblue',
                  size: '6'
                },
                mode: 'markers',
                name: 'p_left = 0.8, data',
                x: [],
                y: [],
                type: 'scatter'
              },
              {
                marker: {
                  color: 'cornflowerblue'
                },
                name: 'p_left = 0.8 model fits',
                x: [],
                y: [],
                type: 'scatter'
              }
            ];

          } else if (plotInfo[0]['plotting_data']['data'].length < 6) {
            data = [
              plotInfo[0]['plotting_data']['data'][0],
              plotInfo[0]['plotting_data']['data'][1],
              {
                marker: {
                  color: 'black',
                  size: '6'
                },
                mode: 'markers',
                name: 'p_left = 0.5, data',
                x: [],
                y: [],
                type: 'scatter'
              },
              {
                marker: {
                  color: 'black'
                },
                name: 'p_left = 0.5 model fits',
                x: [],
                y: [],
                type: 'scatter'
              },
              plotInfo[0]['plotting_data']['data'][2],
              plotInfo[0]['plotting_data']['data'][3],
            ];
          } else {
            data = plotInfo[0]['plotting_data']['data'];
          }
          // const data = [
          //   {
          //       marker: {
          //         color: 'orange',
          //         size: '6'
          //       },
          //       mode: 'markers',
          //       name: 'p_left = 0.2, data',
          //       x: [],
          //       y: [],
          //       type: 'scatter'
          //     },
          //     {
          //       marker: {
          //         color: 'orange'
          //       },
          //       name: 'p_left = 0.2 model fits',
          //       x: [],
          //       y: [],
          //       type: 'scatter'
          //     },
          //     {
          //       marker: {
          //         color: 'black',
          //         size: '6'
          //       },
          //       mode: 'markers',
          //       name: 'p_left = 0.5, data',
          //       x: [],
          //       y: [],
          //       type: 'scatter'
          //     },
          //     {
          //       marker: {
          //         color: 'black'
          //       },
          //       name: 'p_left = 0.5 model fits',
          //       x: [],
          //       y: [],
          //       type: 'scatter'
          //     },
          //   {
          //       marker: {
          //         color: 'cornflowerblue',
          //         size: '6'
          //       },
          //       mode: 'markers',
          //       name: 'p_left = 0.8, data',
          //       x: [],
          //       y: [],
          //       type: 'scatter'
          //     },
          //     {
          //       marker: {
          //         color: 'cornflowerblue'
          //       },
          //       name: 'p_left = 0.8 model fits',
          //       x: [],
          //       y: [],
          //       type: 'scatter'
          //     }
          // ];
          const frames = [];
          for (let i = 0; i < plotInfo.length; i++) {
            const filledData = [{}, {}, {}, {}, {}, {}];
            if (plotInfo[i]['plotting_data']['data'].length < 4) {
              console.log('filling missing data - length: ', plotInfo[i]['plotting_data']['data'].length);
              console.log('data getting filled: ', plotInfo[i]['plotting_data']['data']);
              if (plotInfo[i]['plotting_data']['data'][0]['marker']['color'] === 'black') {
                console.log('only has p_left = 0.5 - black data');
                filledData[0] = {
                  marker: {
                    color: 'orange',
                    size: '6'
                  },
                  mode: 'markers',
                  name: 'p_left = 0.2, data',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
                filledData[1] = {
                  marker: {
                    color: 'orange'
                  },
                  name: 'p_left = 0.2 model fits',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
                filledData[2] = plotInfo[i]['plotting_data']['data'][0];
                filledData[3] = plotInfo[i]['plotting_data']['data'][1];
                filledData[4] = {
                  marker: {
                    color: 'cornflowerblue',
                    size: '6'
                  },
                  mode: 'markers',
                  name: 'p_left = 0.8, data',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
                filledData[5] = {
                  marker: {
                    color: 'cornflowerblue'
                  },
                  name: 'p_left = 0.8 model fits',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
              } else if (plotInfo[i]['plotting_data']['data'][0]['marker']['color'] === 'orange') {
                console.log('only has p_left = 0.2 - orange data');
                filledData[0] = plotInfo[i]['plotting_data']['data'][0];
                filledData[1] = plotInfo[i]['plotting_data']['data'][1];
                filledData[2] = {
                  marker: {
                    color: 'black',
                    size: '6'
                  },
                  mode: 'markers',
                  name: 'p_left = 0.5, data',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
                filledData[3] = {
                  marker: {
                    color: 'black'
                  },
                  name: 'p_left = 0.5 model fits',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
                filledData[4] = {
                  marker: {
                    color: 'cornflowerblue',
                    size: '6'
                  },
                  mode: 'markers',
                  name: 'p_left = 0.8, data',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
                filledData[5] = {
                  marker: {
                    color: 'cornflowerblue'
                  },
                  name: 'p_left = 0.8 model fits',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
              } else {
                console.log('only has p_left = 0.8 - blue data');
                filledData[0] = {
                  marker: {
                    color: 'orange',
                    size: '6'
                  },
                  mode: 'markers',
                  name: 'p_left = 0.2, data',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
                filledData[1] = {
                  marker: {
                    color: 'orange'
                  },
                  name: 'p_left = 0.2 model fits',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
                filledData[2] = {
                  marker: {
                    color: 'black',
                    size: '6'
                  },
                  mode: 'markers',
                  name: 'p_left = 0.5, data',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
                filledData[3] = {
                  marker: {
                    color: 'black'
                  },
                  name: 'p_left = 0.5 model fits',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
                filledData[4] = plotInfo[i]['plotting_data']['data'][0];
                filledData[5] = plotInfo[i]['plotting_data']['data'][1];
              }


              frames.push({
                name: plotInfo[i]['session_start_time'],
                data: filledData
              });
              console.log('filled data:', filledData);
            } else if (plotInfo[i]['plotting_data']['data'].length < 6) {
              console.log('filling missing data - length: ', plotInfo[i]['plotting_data']['data'].length);
              console.log('data getting filled: ', plotInfo[i]['plotting_data']['data']);

              if (plotInfo[i]['plotting_data']['data'][0]['marker']['color'] !== 'black' &&
                plotInfo[i]['plotting_data']['data'][2]['marker']['color'] !== 'black') {
                filledData[0] = plotInfo[i]['plotting_data']['data'][0];
                filledData[1] = plotInfo[i]['plotting_data']['data'][1];
                filledData[2] = {
                  marker: {
                    color: 'black',
                    size: '6'
                  },
                  mode: 'markers',
                  name: 'p_left = 0.5, data',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
                filledData[3] = {
                  marker: {
                    color: 'black'
                  },
                  name: 'p_left = 0.5 model fits',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
                filledData[4] = plotInfo[i]['plotting_data']['data'][2];
                filledData[5] = plotInfo[i]['plotting_data']['data'][3];
              } else if (plotInfo[i]['plotting_data']['data'][0]['marker']['color'] !== 'orange' &&
                plotInfo[i]['plotting_data']['data'][2]['marker']['color'] !== 'orange') {
                filledData[0] = {
                  marker: {
                    color: 'orange',
                    size: '6'
                  },
                  mode: 'markers',
                  name: 'p_left = 0.2, data',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
                filledData[1] = {
                  marker: {
                    color: 'orange'
                  },
                  name: 'p_left = 0.2 model fits',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
                filledData[2] = plotInfo[i]['plotting_data']['data'][0];
                filledData[3] = plotInfo[i]['plotting_data']['data'][1];
                filledData[4] = plotInfo[i]['plotting_data']['data'][2];
                filledData[5] = plotInfo[i]['plotting_data']['data'][3];
              } else if (plotInfo[i]['plotting_data']['data'][0]['marker']['color'] !== 'cornflowerblue' &&
                plotInfo[i]['plotting_data']['data'][2]['marker']['color'] !== 'cornflowerblue') {
                filledData[0] = plotInfo[i]['plotting_data']['data'][0];
                filledData[1] = plotInfo[i]['plotting_data']['data'][1];
                filledData[2] = plotInfo[i]['plotting_data']['data'][2];
                filledData[3] = plotInfo[i]['plotting_data']['data'][3];
                filledData[4] = {
                  marker: {
                    color: 'cornflowerblue',
                    size: '6'
                  },
                  mode: 'markers',
                  name: 'p_left = 0.8, data',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
                filledData[5] = {
                  marker: {
                    color: 'cornflowerblue'
                  },
                  name: 'p_left = 0.8 model fits',
                  x: [],
                  y: [],
                  type: 'scatter'
                };
              }

              frames.push({
                name: plotInfo[i]['session_start_time'],
                data: filledData
              });
              console.log('filled data:', filledData);
            } else {
              frames.push({
                name: plotInfo[i]['session_start_time'],
                data: plotInfo[i]['plotting_data']['data']
              });
            }
          }
          console.log('frames: ', frames);
          const layout = plotInfo[0]['plotting_data']['layout'];

          const sliderSteps = [];
          for (let i = 0; i < plotInfo.length; i++) {
            sliderSteps.push({
              method: 'animate',
              label: plotInfo[i]['session_start_time'].split('T')[0],
              value: plotInfo[i]['session_start_time'],
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
          layout['yaxis']['range'] = [-0.05, 1.05];
          layout['yaxis']['autorange'] = false;
          layout['xaxis']['range'] = [-110, 110];
          layout['xaxis']['autorange'] = false;
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
            }
          ];
          layout['sliders'] = [{
            pad: { l: 130, t: 65 },
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

          const layout2 = {};
          const layout3 = {};
          layout2['width'] = '741';
          layout2['height'] = '494';

          layout3['width'] = '600';
          layout3['height'] = '475';
          if (initialScreenSize < 1200 && (initialScreenSize > 1024 || initialScreenSize === 1024)) {
            Plotly.relayout(element, layout2);
          } else if (initialScreenSize < 1024) {
            Plotly.relayout(element, layout3);
          }
          element.on('plotly_animatingframe', () => {
            this.showInfo = false;
            this.currentFrame = this.element.nativeElement._fullLayout._currentFrame;
          });
          element.on('plotly_animated', () => {
            console.log('animation stopped');
            this.allSessionsService.retrieveSessions({ 'subject_uuid': this.mouseInfo['subject_uuid'], 'session_start_time': this.currentFrame });
            this.sessionQuerySubscription = this.allSessionsService.getNewSessionsLoadedListener()
              .subscribe(sessionInfo => {
                this.current_frame_session_info = sessionInfo[0];
             });
            const lookupInfo = setTimeout(() => {
              if (!this.showInfo) {
                this.showInfo = true;
              }
            }, 500);
          });
          // see if GIF download is possible
          // const images = [];
          // element.on('plotly_animated', () => {
          //   Plotly.toImage(element).then((img) => {
          //     images.push(img);
          //     console.log('image added!');
          //   });
          //   console.log('plot was animated!');
          // });
          // Plotly.animate(element);
          // Plotly.fileSaver()
          // Plotly.downloadImage(element, opts)
        }
      });
  }

  jump2session() {
    console.log('fetching session uuid for');
    console.log('mouse id: ', this.mouseInfo['subject_uuid']);
    console.log('session_start_time of: ', this.element.nativeElement._fullLayout._currentFrame);
    this.currentFrame = this.element.nativeElement._fullLayout._currentFrame;
    if (!this.currentFrame) {
      alert('run the animation/move the slider to choose a session');
      return;
    }
    this.allSessionsService.retrieveSessions({'subject_uuid': this.mouseInfo['subject_uuid'], 'session_start_time': this.currentFrame});
    this.sessionQuerySubscription = this.allSessionsService.getNewSessionsLoadedListener()
      .subscribe(sessionInfo => {
        console.log('session retrieved! ID: ', sessionInfo[0]['session_uuid']);
        console.log(sessionInfo);
        this.current_frame_session_info = sessionInfo[0];
      });
  }

}
