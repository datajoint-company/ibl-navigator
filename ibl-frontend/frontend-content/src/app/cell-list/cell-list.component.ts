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
  rasterTemplates = [];

  psth_data = [];
  psth_layout = {};
  psth_config = {};

  testPlotData;
  testPlotLayout;

  targetClusterRowInfo = [];
  targetClusterId;
  targetClusterDepth;
  targetClusterAmp;
  targetProbeIndex;

  eventType;
  sortType;
  probeIndex;

  private cellListSubscription: Subscription;
  private rasterListSubscription: Subscription;
  private psthListSubscription: Subscription;
  private rasterTemplateSubscription: Subscription;
  @Input() sessionInfo: Object;
  @ViewChild('navTable') el_nav: ElementRef;

  constructor(public cellListService: CellListService) { }
  @HostListener('window:keyup', ['$event']) keyEvent(event) {
    console.log('listening to key event');
    console.log(event.key);
    if (event.key === 'ArrowUp') {
      console.log('arrow upped!');
      if (this.clickedClusterId - 1 > -1) {
        this.clickedClusterId -= 1;
        this.targetClusterId = this.clickedClusterId;
        console.log('plot data is: ', this.plot_data);
      }
      // console.log(event);
      // console.log('evene target children', event.target.children);
      // if (event.target.children && event.target.children[0].childElementCount === 4) {
      //   console.log('insde');
      //   this.targetClusterRowInfo = [];
      //   for (const row of event.target.children[0].children) { // TODO: traverse actual elements' innertext here
      //     this.targetClusterRowInfo.push(row.innerText);
      //   }
      //   this.targetClusterId = parseInt(this.targetClusterRowInfo[0], 10);
      //   this.targetProbeIndex = parseInt(this.targetClusterRowInfo[1], 10);

      // }
    } else if (event.key === 'ArrowDown') {
      console.log('arrow down or tab detected');
      console.log('this.clickedClusterId', this.clickedClusterId);
      if (this.clickedClusterId + 1) {
        this.clickedClusterId += 1;
        this.targetClusterId = this.clickedClusterId;
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
            text: id_data,
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
            xaxis: {
              title: 'cluster amp (µV)'
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

    
    this.cellListService.retrieveRasterTemplates();
    this.rasterTemplateSubscription = this.cellListService.getRasterTemplatesLoadedListener()
      .subscribe((templates) => {
        console.log('raster templates retrieved');
        for (const [index, temp] of Object.entries(templates)) {
          if (temp['template_idx'] === parseInt(index, 10)) {
            this.rasterTemplates.push(temp['raster_data_template']);
          }
        }
        let titleJoined = '';
        this.cellListService.retrieveRasterList(queryInfo);
        this.rasterListSubscription = this.cellListService.getRasterListLoadedListener()
          .subscribe((rasterPlotList) => {
            console.log('raster plot list - ', rasterPlotList);
            this.rasterPlotList = rasterPlotList;
            const timeA = new Date();
            for (const raster of Object.values(rasterPlotList)) {
              const currentTemplate = this.rasterTemplates[raster['template_idx']];
              const dataCopy = Object.assign([], currentTemplate['data']);
              dataCopy[0] = {
                y: raster['plot_ylim'],
                // y: [0, 147.2],
                x: ['-1', '1'],
                type: 'scatter',
                showlegend: false,
                mode: 'markers',
                marker: { opacity: '0'}
              };
              this.raster_data.push(dataCopy);
              // this.raster_data.push(currentTemplate['data']);

              const layoutCopy = Object.assign({}, currentTemplate['layout']);
              layoutCopy['images'] = [{
                // source: 'http://localhost:3333' + raster['plotting_data_link'],
                source: BACKEND_URL + raster['plotting_data_link'],
                y: raster['plot_ylim'][1],
                sizey: parseFloat(raster['plot_ylim'][1]) - parseFloat(raster['plot_ylim'][0]),
                layer: 'below',
                sizex: 2,
                sizing: 'stretch',
                x: '-1',
                xref: 'x',
                yref: 'y'
              }];
              // layoutCopy['images'][0]['source'] = 'http://' + raster['plotting_data_link'];
              titleJoined = currentTemplate.layout.title.text + raster['mark_label'];
              layoutCopy['title'] = {text: titleJoined};
              layoutCopy['yaxis'] = {range: raster['plot_ylim']};
              layoutCopy['width'] = 705;
              layoutCopy['height'] = 450;
              // layoutCopy['template'] = {};
              this.raster_layout.push(layoutCopy);
              this.raster_config.push({});
            }
            console.log('layout - ', this.raster_layout);
            console.log('data - ', this.raster_data);
      });
    });

    const psthQueryInfo = {};
    psthQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    psthQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    psthQueryInfo['probe_idx'] = this.probeIndex;
    psthQueryInfo['cluster_revision'] = '0';
    psthQueryInfo['event'] = this.eventType;
    psthQueryInfo['cluster_id'] = 0;
    console.log('querying for psth plots with: ', psthQueryInfo);
    this.cellListService.retrievePSTHList(psthQueryInfo);
    this.psthListSubscription = this.cellListService.getPSTHListLoadedListener()
      .subscribe((psthPlotList) => {
        console.log('psth plot list successfully retrieved: ', psthPlotList);
        this.psth_data = psthPlotList[0]['plotting_data']['data'];
        this.psth_layout = psthPlotList[0]['plotting_data']['layout'];
        this.psth_config = {};
      });

  }

  ngDoCheck() {
    console.log('do check ran');
    console.log('this.clicked cluster id: ', this.clickedClusterId);
    // console.log(this.plot_data[0]['x'].length);
    const markerColors = [];
    if (this.plot_data) {
      if (this.plot_data[0]['x'] && this.clickedClusterId > -1) {
        for (let i = 0; i < this.plot_data[0]['x'].length; i++) {
          if (this.clickedClusterId === i) {
            markerColors.push('rgba(0, 0, 0, 1)'); // black
          } else {
            markerColors.push('rgba(132, 0, 0, 0.5)'); // regular red
          }
        }
      } else {
        for (let i = 0; i < this.plot_data[0]['x'].length; i++) {
          markerColors.push('rgba(132, 0, 0, 0.5)'); // regular red
        }
      }
      this.plot_data[0]['marker']['line']['color'] = markerColors;
      // console.log('markerColors: ', markerColors);
    }

    // const psthQueryInfo = {};
    // psthQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    // psthQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    // psthQueryInfo['probe_idx'] = this.probeIndex;
    // psthQueryInfo['cluster_revision'] = '0';
    // psthQueryInfo['event'] = this.eventType;
    // psthQueryInfo['cluster_id'] = this.clickedClusterId;
    // this.cellListService.retrievePSTHList(psthQueryInfo);
    // this.psthListSubscription = this.cellListService.getPSTHListLoadedListener()
    //   .subscribe((psthPlot) => {
    //     this.psth_data = psthPlot[0]['plotting_data']['data'];
    //     this.psth_layout = psthPlot[0]['plotting_data']['layout'];
    //     this.psth_config = {};
    //   });
  }
  ngOnDestroy() {
    if (this.cellListSubscription) {
      this.cellListSubscription.unsubscribe();
    }
    if (this.rasterListSubscription) {
      this.rasterListSubscription.unsubscribe();
    }
    if (this.rasterTemplateSubscription) {
      this.rasterTemplateSubscription.unsubscribe();
    }
    if (this.psthListSubscription) {
      this.psthListSubscription.unsubscribe();
    }
  }

  clusterSelectedPlot(data) {
    const element = this.el_nav.nativeElement.children[1];
    console.log('cluster selected from cluster plot!');
    console.log(element);
    const rows = element.querySelectorAll('tr');
    console.log('printing rows');
    console.log(rows);
    this.targetClusterId = this.clickedClusterId;
    if (data['points'] && data['points'][0]['customdata']) {
      this.clickedClusterId = data['points'][0]['customdata'];
      rows[this.clickedClusterId].scrollIntoView({
                                      behavior: 'smooth',
                                      block: 'center'});
    }

  }

  clusterSelectedTable(cluster_id) {
    console.log('cluster selected from table!');
    const element = this.el_nav.nativeElement.children[1];
    console.log(cluster_id);
    const rows = element.querySelectorAll('tr');
    console.log('printing rows');
    console.log(rows);
    this.clickedClusterId = cluster_id;
    this.targetClusterId = this.clickedClusterId;
    const psthQueryInfo = {};
    psthQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    psthQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    psthQueryInfo['probe_idx'] = this.probeIndex;
    psthQueryInfo['cluster_revision'] = '0';
    psthQueryInfo['event'] = this.eventType;
    psthQueryInfo['cluster_id'] = cluster_id;
    this.cellListService.retrievePSTHList(psthQueryInfo);
    this.psthListSubscription = this.cellListService.getPSTHListLoadedListener()
      .subscribe((psthPlot) => {
        this.psth_data = psthPlot[0]['plotting_data']['data'];
        this.psth_layout = psthPlot[0]['plotting_data']['layout'];
        this.psth_config = {};
      });
  }

  navigate_cell_plots(event, direction) {
    console.log('going', direction, 'the list of cells');

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

          this.raster_data.push(this.rasterTemplates[raster['template_idx']]['data']);
          // this.raster_data.push(raster['plotting_data']['data']);
          const newLayout = this.rasterTemplates[raster['template_idx']]['layout'];
          newLayout['images'] = [{
                // source: 'http://localhost:3333' + raster['plotting_data_link'],
            source: BACKEND_URL + raster['plotting_data_link'],
                y: raster['plot_ylim'],
                sizey: raster['plot_ylim'][1] - raster['plot_ylim'][0],
                layer: 'below',
                sizex: '2',
                sizing: 'stretch',
                x: '-1',
                xref: 'x',
                yref: 'y'
              }];
          this.raster_layout.push(newLayout);
          // const layout = raster['plotting_data']['layout'];
          // /raster/efa5e878-6d7a-47ef-8ec8-ac7d6272cf22/2019-05-07T17:22:20/0/0/feedback/feedback - response/4.png
          // layout['images'][0]['source'] =  BACKEND_URL + `/raster/${subj_id}/${sstime}/${p_idx}/${c_rev}/${event}/${sorting}/${cluster_id}.png`;
          // 'http://localhost:3333/plotImg/raster/efa5e878-6d7a-47ef-8ec8-ac7d6272cf22/2019-05-07T17:22:20/response/trial_id.0.png';
          // this.raster_layout.push(layout);
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

          this.raster_data.push(this.rasterTemplates[raster['template_idx']]['data']);
          // this.raster_data.push(raster['plotting_data']['data']);
          const newLayout = this.rasterTemplates[raster['template_idx']]['layout'];
          newLayout['images'] = [{
            // source: 'http://localhost:3333' + raster['plotting_data_link'],
            source: BACKEND_URL + raster['plotting_data_link'],
            y: raster['plot_ylim'],
            sizey: raster['plot_ylim'][1] - raster['plot_ylim'][0],
            layer: 'below',
            sizex: '2',
            sizing: 'stretch',
            x: '-1',
            xref: 'x',
            yref: 'y'
          }];
          // newLayout['images'][0]['source'] = 'http://localhost:3333' + raster['plotting_data_link'];
          this.raster_layout.push(newLayout);
          // const layout = raster['plotting_data']['layout'];
          // /raster/efa5e878-6d7a-47ef-8ec8-ac7d6272cf22/2019-05-07T17:22:20/0/0/feedback/feedback - response/4.png
          // layout['images'][0]['source'] =
            // BACKEND_URL + `/raster/${subj_id}/${sstime}/${p_idx}/${c_rev}/${event}/${sorting}/${cluster_id}.png`;
          // 'http://localhost:3333/plotImg/raster/efa5e878-6d7a-47ef-8ec8-ac7d6272cf22/2019-05-07T17:22:20/response/trial_id.0.png';
          // this.raster_layout.push(layout);
          this.raster_config.push(raster['plotting_data']['config']);
        }
      });
  }

}
