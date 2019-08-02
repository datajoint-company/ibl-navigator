import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, DoCheck, HostListener} from '@angular/core';

import { Subscription } from 'rxjs';

import { CellListService } from './cell-list.service';

import { environment } from '../../environments/environment';
const BACKEND_URL = environment.backend_url;

// declare var Plotly: any;

@Component({
  selector: 'app-cell-list',
  templateUrl: './cell-list.component.html',
  styleUrls: ['./cell-list.component.css']
})
export class CellListComponent implements OnInit, OnDestroy, DoCheck {
  // d3 = Plotly.d3;
  cells: any;
  session: any;
  clickedClusterId: number;
  plot_data;
  plot_layout;
  plot_config;
  cellOnFocus;

  raster_data = [];
  raster_layout = [];
  raster_config = [];
  rasterPlotList;

  targetClusterRowInfo = []
  targetClusterId;
  targetClusterDepth;
  targetClusterAmp;
  targetProbeIndex;

  eventType;
  sortType;
  probeIndex;

  private cellListSubscription: Subscription;
  private rasterListSubscription: Subscription;
  @Input() sessionInfo: Object;
  @ViewChild('navTable') el_nav: ElementRef;

  constructor(public cellListService: CellListService) { }
  @HostListener('window:keyup', ['$event']) keyEvent(event) {
    console.log('listening to key event');
    console.log(event.target);
    if (event.key === 'Tab') {
      console.log('tab on table!');
      console.log(event);
      if (event.target.cells && event.target.cells.length === 4) {
        this.targetClusterRowInfo = [];
        for (const row of event.target.cells) {
          this.targetClusterRowInfo.push(row.innerText);
        }
        this.targetClusterId = parseInt(this.targetClusterRowInfo[0], 10);
        this.targetProbeIndex = parseInt(this.targetClusterRowInfo[1], 10);
        // this.targetClusterDepth = this.targetClusterRowInfo[2];
        // this.targetClusterAmp = this.targetClusterRowInfo[3];

      }
    }
   

  }
  ngOnInit() {
    // const element = this.el_nav.nativeElement;
    this.session = this.sessionInfo;
    this.cellListService.retrieveCellList(this.sessionInfo);
    this.cellListSubscription = this.cellListService.getCellListLoadedListener()
      .subscribe((cellListData) => {
        if (Object.entries(cellListData).length > 0) {
          this.cells = cellListData;
          this.cellOnFocus = this.cells[2];
          const x_data = [];
          const y_data = [];
          const id_data = [];
          const size_data = [];
          const color_data = [];
          for (let entry of Object.values(cellListData)) {
            id_data.push(entry['cluster_id']);
            size_data.push(entry['channel_id']);
            y_data.push(entry['cluster_depth']);
            x_data.push(entry['cluster_amp']);
            color_data.push(entry['cluster_id']);
          }
          // console.log('x_data is: ', x_data);
          // console.log('y_data is: ', y_data);
          // console.log('color_data is: ', color_data);
          // console.log('size_data is: ', size_data);
          this.plot_data = [{
            x: x_data,
            y: y_data,
            customdata: id_data,
            mode: 'markers',
            marker: {
              size: 15,
              color: 'rgba(255, 255, 255, 0.2',
              line: {
                color: 'rgba(132, 0, 0, 0.5)',
                width: 2
              }
            }
          }];

          this.plot_layout = {
            yaxis: {
              title: 'cluster depth (µm)'
            },
            hovermode: 'closest'
          };

          this.plot_config = {
            showLink: false,
            showSendToCloud: false,
            displaylogo: false,
            modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian',
                            'hoverCompareCartesian', 'toImage', 'toggleSpikelines'],
          };
        }
      });
    // initial setting for the raster viewer
    this.eventType = 'feedback';
    this.sortType = 'trial_id';
    this.targetClusterId = 0;
    this.probeIndex = 0;
    const queryInfo = {};
    queryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    queryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    queryInfo['probe_idx'] = this.probeIndex;
    queryInfo['cluster_revision'] = '0';
    queryInfo['event'] = this.eventType;
    queryInfo['sort_by'] = this.sortType;

    this.cellListService.retrieveRasterList(queryInfo);
    this.rasterListSubscription = this.cellListService.getRasterListLoadedListener()
      .subscribe((rasterPlotList) => {
        console.log('rasterplot list data');
        console.log(rasterPlotList);
        this.rasterPlotList = rasterPlotList;
        const timeA = new Date()
        console.log('received from node server - now plotting');
        for (const raster of Object.values(rasterPlotList)) {
          const p_idx = raster['probe_idx'];
          const c_rev = raster['cluster_revision'];
          const sstime = raster['session_start_time'];
          const subj_id = raster['subject_uuid'];
          const event = raster['event'];
          const sorting = raster['sort_by'];
          const cluster_id = raster['cluster_id'];
          // this.raster_data.push(raster['plotting_data']['data']);
          const dataTemplate = [
            {
              "marker": {
                "opacity": "0"
              },
              "mode": "markers",
              "showlegend": false,
              "x": [
                "-1",
                "1"
              ],
              "y": [
                "0",
                5.222400000000001
              ],
              "type": "scatter"
            },
            {
              "legendgroup": "spike",
              "marker": {
                "color": "green",
                "opacity": 0.5,
                "size": "6"
              },
              "mode": "markers",
              "name": "spike time on left trials",
              "x": ["5"],
              "y": ["10"],
              "type": "scatter"
            },
            {
              "legendgroup": "spike",
              "marker": {
                "color": "blue",
                "opacity": 0.5,
                "size": "6"
              },
              "mode": "markers",
              "name": "spike time on right trials",
              "x": ["5"],
              "y": ["10"],
              "type": "scatter"
            },
            {
              "legendgroup": "spike",
              "marker": {
                "color": "red",
                "opacity": 0.5,
                "size": "6"
              },
              "mode": "markers",
              "name": "spike time on incorrect trials",
              "x": ["5"],
              "y": ["10"],
              "type": "scatter"
            }
          ];
          this.raster_data.push(dataTemplate);

          const layout = {
            "height": "450",
            "images": [
              {
                "layer": "below",
                "sizex": "2",
                "sizey": 5.222400000000001,
                "sizing": "stretch",
                'images': [{}],
                "x": "-1",
                "xref": "x",
                "y": 5.222400000000001,
                "yref": "y"
                }
            ],
            "margin": {
              "b": "40",
              "l": "50",
              "pad": "0",
              "r": "30",
              "t": "80"
            },
            "title": {
              "text": "Raster, aligned to response",
              "x": 0.21,
              "y": 0.87
            },
            "width": "705",
            "xaxis": {
              "range": ["-1", "1"],
              "showgrid": false,
              "title": {
                "text": "Time (sec)"
                }
            },
            "yaxis": {
              "range": ["0", 5.222400000000001],
              "showgrid": false,
              "title": {
                "text": "Trial idx"
                }
            },
            'template': {
              'data': {
                "scatter": [{ "marker": { "colorbar": { "outlinewidth": "0", "ticks": "" } }, "type": "scatter" }]
              },
              'layout': {
                "annotationdefaults": { "arrowcolor": "#2a3f5f", "arrowhead": "0", "arrowwidth": "1" },
                "colorscale": {
                  "diverging": [["0", "#8e0152"], [0.1, "#c51b7d"], [0.2, "#de77ae"], [0.3, "#f1b6da"], [0.4, "#fde0ef"], [0.5, "#f7f7f7"], [0.6, "#e6f5d0"], [0.7, "#b8e186"], [0.8, "#7fbc41"], [0.9, "#4d9221"], ["1", "#276419"]],
                  "sequential": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]],
                  "sequentialminus": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]]
                },
                "colorway": ["#636efa", "#EF553B", "#00cc96", "#ab63fa", "#FFA15A", "#19d3f3", "#FF6692", "#B6E880", "#FF97FF", "#FECB52"],
                "font": { "color": "#2a3f5f" },
                "geo": { "bgcolor": "white", "lakecolor": "white", "landcolor": "#E5ECF6", "showlakes": true, "showland": true, "subunitcolor": "white" },
                "hoverlabel": { "align": "left" },
                "hovermode": "closest",
                "mapbox": { "style": "light" },
                "paper_bgcolor": "white",
                "plot_bgcolor": "#E5ECF6",
                "polar": {
                  "angularaxis": { "gridcolor": "white", "linecolor": "white", "ticks": "" },
                  "bgcolor": "#E5ECF6",
                  "radialaxis": { "gridcolor": "white", "linecolor": "white", "ticks": "" }
                },
                "scene": {
                  "xaxis": { "backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": "2", "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white" },
                  "yaxis": { "backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": "2", "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white" },
                  "zaxis": { "backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": "2", "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white" }
                },
                "shapedefaults": {
                  "line": { "color": "#2a3f5f" }
                },
                "ternary": {
                  "aaxis": { "gridcolor": "white", "linecolor": "white", "ticks": "" },
                  "baxis": { "gridcolor": "white", "linecolor": "white", "ticks": "" },
                  "bgcolor": "#E5ECF6",
                  "caxis": { "gridcolor": "white", "linecolor": "white", "ticks": "" }
                },
                "title": { "x": 0.05 },
                "xaxis": { "automargin": true, "gridcolor": "white", "linecolor": "white", "ticks": "", "zerolinecolor": "white", "zerolinewidth": "2" },
                "yaxis": { "automargin": true, "gridcolor": "white", "linecolor": "white", "ticks": "", "zerolinecolor": "white", "zerolinewidth": "2" }

              }
            }
          };
          // const layout = raster['plotting_data_link']['layout'];
          // console.log('logging the soruce of image: ', layout['images'][0]['source']);
          // // /raster/efa5e878-6d7a-47ef-8ec8-ac7d6272cf22/2019-05-07T17:22:20/0/0/feedback/feedback - response/4.png
          layout['images'][0]['source'] =
            'http://' + raster['plotting_data_link'];
            // BACKEND_URL + `/raster/${subj_id}/${sstime}/${p_idx}/${c_rev}/${event}/${sorting}/${cluster_id}.png`;
            // 'http://localhost:3333/plotImg/raster/efa5e878-6d7a-47ef-8ec8-ac7d6272cf22/2019-05-07T17:22:20/response/trial_id/0.png';
          this.raster_layout.push(layout);
          this.raster_config.push({});
          console.log('rasterlayout - source: ', layout['images'][0]['source']);
          const timeB = new Date();
          const dur = timeB.getTime() - timeA.getTime();
          console.log('plotted one - ', dur, 'ms since receiving the data back');
        }
        
      });
  }

  ngDoCheck() {
    // this.clickedClusterId ++;

  }
  ngOnDestroy() {
    if (this.cellListSubscription) {
      this.cellListSubscription.unsubscribe();
    }
    if (this.rasterListSubscription) {
      this.rasterListSubscription.unsubscribe();
    }
  }

  clusterSelected(data) {
    const element = this.el_nav.nativeElement.children[1];
    console.log('cluster selected!');
    console.log(element);
    const rows = element.querySelectorAll('tr');
    console.log('printing rows');
    console.log(rows);
    if (data['points'] && data['points'][0]['customdata']) {
      this.clickedClusterId = data['points'][0]['customdata'];
      rows[this.clickedClusterId].scrollIntoView({
                                      behavior: 'smooth',
                                      block: 'center'});
    }

  }

  order_by_event(eventType) {
    console.log('event order selected!: ', eventType);
    this.eventType = eventType;
    const queryInfo = {};
    queryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    queryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    queryInfo['probe_idx'] = this.probeIndex;
    queryInfo['cluster_revision'] = '0';
    queryInfo['event'] = this.eventType;
    queryInfo['sort_by'] = this.sortType;
    this.raster_data = [];
    this.raster_layout = [];
    this.raster_config = [];
    this.cellListService.retrieveRasterList(queryInfo);
    this.rasterListSubscription = this.cellListService.getRasterListLoadedListener()
      .subscribe((rasterPlotList) => {
        console.log('rasterplot list data');
        console.log(rasterPlotList);
        this.rasterPlotList = rasterPlotList;
        for (const raster of Object.values(rasterPlotList)) {
          const p_idx = raster['probe_idx'];
          const c_rev = raster['cluster_revision'];
          const sstime = raster['session_start_time'];
          const subj_id = raster['subject_uuid'];
          const event = raster['event'];
          const sorting = raster['sort_by'];
          const cluster_id = raster['cluster_id'];
          this.raster_data.push(raster['plotting_data']['data']);
          const layout = raster['plotting_data']['layout'];
          // /raster/efa5e878-6d7a-47ef-8ec8-ac7d6272cf22/2019-05-07T17:22:20/0/0/feedback/feedback - response/4.png
          layout['images'][0]['source'] =
            BACKEND_URL + `/raster/${subj_id}/${sstime}/${p_idx}/${c_rev}/${event}/${sorting}/${cluster_id}.png`;
          // 'http://localhost:3333/plotImg/raster/efa5e878-6d7a-47ef-8ec8-ac7d6272cf22/2019-05-07T17:22:20/response/trial_id.0.png';
          this.raster_layout.push(layout);
          this.raster_config.push(raster['plotting_data']['config']);
        }
      });
  }

  order_by_sorting(sortType) {
    console.log('sort order selected!: ', sortType);
    this.sortType = sortType;
    const queryInfo = {};
    queryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    queryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    queryInfo['probe_idx'] = this.probeIndex;
    queryInfo['cluster_revision'] = '0';
    queryInfo['event'] = this.eventType;
    queryInfo['sort_by'] = this.sortType;
    this.raster_data = [];
    this.raster_layout = [];
    this.raster_config = [];
    this.cellListService.retrieveRasterList(queryInfo);
    this.rasterListSubscription = this.cellListService.getRasterListLoadedListener()
      .subscribe((rasterPlotList) => {
        console.log('rasterplot list data');
        console.log(rasterPlotList);
        this.rasterPlotList = rasterPlotList;
        for (const raster of Object.values(rasterPlotList)) {
          const p_idx = raster['probe_idx'];
          const c_rev = raster['cluster_revision'];
          const sstime = raster['session_start_time'];
          const subj_id = raster['subject_uuid'];
          const event = raster['event'];
          const sorting = raster['sort_by'];
          const cluster_id = raster['cluster_id'];
          this.raster_data.push(raster['plotting_data']['data']);
          const layout = raster['plotting_data']['layout'];
          // /raster/efa5e878-6d7a-47ef-8ec8-ac7d6272cf22/2019-05-07T17:22:20/0/0/feedback/feedback - response/4.png
          layout['images'][0]['source'] =
            BACKEND_URL + `/raster/${subj_id}/${sstime}/${p_idx}/${c_rev}/${event}/${sorting}/${cluster_id}.png`;
          // 'http://localhost:3333/plotImg/raster/efa5e878-6d7a-47ef-8ec8-ac7d6272cf22/2019-05-07T17:22:20/response/trial_id.0.png';
          this.raster_layout.push(layout);
          this.raster_config.push(raster['plotting_data']['config']);
        }
      });
  }

}
