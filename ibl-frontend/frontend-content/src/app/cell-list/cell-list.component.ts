import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, DoCheck, HostListener} from '@angular/core';

import { Subscription } from 'rxjs';

import { CellListService } from './cell-list.service';

// declare var Plotly: any;

@Component({
  selector: 'app-cell-list',
  templateUrl: './cell-list.component.html',
  styleUrls: ['./cell-list.component.css']
})
export class CellListComponent implements OnInit, OnDestroy, DoCheck {
  cells: any;
  session: any;
  clickedClusterId: number;
  cellsByProbeIns = [];
  sortedCellsByProbeIns = [];
  probeIndices = [];

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
  psth_layout = [];
  psth_config = [];
  psthPlotList;
  psthTemplates = [];

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

  showController = true;

  private cellListSubscription: Subscription;
  private rasterListSubscription: Subscription;
  private psthListSubscription: Subscription;
  private rasterTemplateSubscription: Subscription;
  private psthTemplatesSubscription: Subscription;
  @Input() sessionInfo: Object;
  @ViewChild('navTable') el_nav: ElementRef;

  constructor(public cellListService: CellListService) { }
  @HostListener('window:keyup', ['$event']) keyEvent(event) {
    if (event.key === 'ArrowUp') {
      this.navigate_cell_plots({}, 'up');
    } else if (event.key === 'ArrowDown') {
      this.navigate_cell_plots({}, 'down');
    }
  }
  @HostListener('window:scroll', ['$event']) onWindowScroll(event) {
    // console.log('logging scroll event - ', event);
    if (window.pageYOffset > 640) {
      this.showController = true;
    } else {
      // this.showController = false;
    }
  }
  ngOnInit() {
    this.plot_config = {
      showLink: false,
      showSendToCloud: false,
      displaylogo: false,
      modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian',
        'hoverCompareCartesian', 'toImage', 'toggleSpikelines'],
    };

    console.log('window height: ', window.innerHeight);
    console.log('window screen height: ', window.screen.height);
    // const element = this.el_nav.nativeElement;
    this.session = this.sessionInfo;
    // initial setting for plots viewer
    this.eventType = 'feedback';
    this.sortType = 'trial_id';
    this.targetClusterId = 0;
    this.clickedClusterId = this.targetClusterId;
    this.probeIndex = 0;
    
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
          this.cellsByProbeIns = [];

          for (let entry of Object.values(cellListData)) {
            if (!this.probeIndices.includes(entry['probe_idx'])) {
              this.probeIndices.push(entry['probe_idx']);
            }
            if (entry['probe_idx'] === this.probeIndex) {
              id_data.push(entry['cluster_id']);
              size_data.push(entry['channel_id']);
              y_data.push(entry['cluster_depth']);
              x_data.push(entry['cluster_amp']);
              color_data.push(entry['cluster_id']);
              this.cellsByProbeIns.push(entry);
            }
          }
          console.log('probe indices: ', this.probeIndices);
          console.log(`data by probe index(${this.probeIndex}): `, this.cellsByProbeIns);
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
              color: 'rgba(255, 255, 255, 0.2)',
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

          
        }
      });
    

    const queryInfo = {};
    queryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    queryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    queryInfo['probe_idx'] = this.probeIndex;
    // queryInfo['cluster_revision'] = '0';
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
            console.log('initial raster plot list - ', rasterPlotList);
            console.log('initial raster plot with query: ', queryInfo);
            this.rasterPlotList = rasterPlotList;
            for (const cluster of Object.values(this.cellsByProbeIns)) {
              for (const raster of Object.values(rasterPlotList)) {
                if (cluster['cluster_id'] === raster['cluster_id']) {
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
                  if (raster['mark_label']) {
                    dataCopy[4]['name'] = dataCopy[4]['name'].replace('event', raster['mark_label']);
                    dataCopy[5]['name'] = dataCopy[5]['name'].replace('event', raster['mark_label']);
                    dataCopy[6]['name'] = dataCopy[6]['name'].replace('event', raster['mark_label']);
                  }
                  this.raster_data.push(dataCopy);
                  // this.raster_data.push(currentTemplate['data']);

                  const layoutCopy = Object.assign({}, currentTemplate['layout']);
                  layoutCopy['images'] = [{
                    // source: 'http://localhost:3333' + raster['plotting_data_link'],
                    source: raster['plotting_data_link'],
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
                  titleJoined = `${currentTemplate.layout.title.text}${raster['event']}`;
                  layoutCopy['title'] = {
                    text: titleJoined,
                    x: currentTemplate.layout.title.x,
                    y: currentTemplate.layout.title.y,
                  };
                  layoutCopy['yaxis'] = {range: [raster['plot_ylim'][0].toString(), raster['plot_ylim'][1].toString()]};
                  // layoutCopy['yaxis'] = { range: [0, 0] };
                  console.log('plot ylim - ', raster['plot_ylim']);
                  layoutCopy['width'] = 658;
                  layoutCopy['height'] = 420;
                  // layoutCopy['template'] = {};
                  this.raster_layout.push(layoutCopy);
                  // this.raster_config.push(this.plot_config);
                  this.raster_config.push({});
                  console.log('this.plot_config is ', this.plot_config);
                } else { // in case of missing plot
                  this.raster_data.push({
                    type: 'scatter',
                    showlegend: false});
                  this.raster_layout.push({
                    title: {
                      text: 'missing raster plot',
                    },
                    images: {
                      source: '/assets/images/plot_unavailable.png',
                      layer: 'below',
                      sizex: 2,
                      sizing: 'stretch',
                      x: '-1',
                      xref: 'x',
                      yref: 'y'
                    }});
                  this.raster_config.push(this.plot_config);
                }
              }
            }
            console.log('raster layout on nginit - ', this.raster_layout);
            console.log('raster data on nginit - ', this.raster_data);
            console.log('raster config on init - ', this.raster_config);
      });
    });

    const psthQueryInfo = {};
    psthQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    psthQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    psthQueryInfo['probe_idx'] = this.probeIndex;
    // psthQueryInfo['cluster_revision'] = '0';
    psthQueryInfo['event'] = this.eventType;

    this.cellListService.retrievePsthTemplates();
    this.psthTemplatesSubscription = this.cellListService.getPsthTemplatesLoadedListener()
      .subscribe((template) => {
        // console.log('psth template retrieved');
        for (const [index, temp] of Object.entries(template)) {
          if (temp['psth_template_idx'] === parseInt(index, 10)) {
            this.psthTemplates.push(temp['psth_data_template']);
          }
        }
        this.cellListService.retrievePSTHList(psthQueryInfo);
        this.psthListSubscription = this.cellListService.getPSTHListLoadedListener()
          .subscribe((psthPlotList) => {
            // console.log('psth plot list - ', psthPlotList);
            this.psthPlotList = psthPlotList;
            for (const cluster of Object.values(this.cellsByProbeIns)) {
              for (const psth of Object.values(psthPlotList)) {
                if (psth['cluster_id'] === cluster['cluster_id']) {
                  const currentTemplate = this.psthTemplates[psth['psth_template_idx']];
                  const dataCopy = Object.assign([], currentTemplate['data']);
                  // data = [left, right, incorrect, all]
                  dataCopy[0] = {
                    y: psth['psth_left'].split(','),
                    x: psth['psth_time'].split(','),
                    name: 'left trials',
                    mode: 'lines',
                    marker: { size: 6, color: 'green'}
                  };
                  dataCopy[1] = {
                    y: psth['psth_right'].split(','),
                    x: psth['psth_time'].split(','),
                    name: 'right trials',
                    mode: 'lines',
                    marker: { size: 6, color: 'blue' }
                  };
                  dataCopy[2] = {
                    y: psth['psth_incorrect'].split(','),
                    x: psth['psth_time'].split(','),
                    name: 'incorrect trials',
                    mode: 'lines',
                    marker: { size: 6, color: 'red' }
                  };
                  dataCopy[3] = {
                    y: psth['psth_all'].split(','),
                    x: psth['psth_time'].split(','),
                    name: 'all trials',
                    mode: 'lines',
                    marker: { size: 6, color: 'black' }
                  };
                  this.psth_data.push(dataCopy);

                  const layoutCopy = Object.assign({}, currentTemplate['layout']);
                  layoutCopy['title']['text'] = `PSTH, aligned to ${psth['event']} time`;
                  layoutCopy['xaxis']['range'] = psth['psth_x_lim'].split(',');
                  layoutCopy['width'] = 658;
                  layoutCopy['height'] = 420;
                  this.psth_layout.push(layoutCopy);
                  this.psth_config.push(this.plot_config);
                } else {
                  this.psth_data.push({});
                  this.psth_layout.push({});
                  this.psth_config.push(this.plot_config);
                }
              }
            }
            // console.log('psth layout - ', this.psth_layout);
            // console.log('psth data - ', this.psth_data);
            console.log('psth config: ', this.psth_config);
          });
      });

  }

  ngDoCheck() {
    // console.log('do check ran');
    // console.log('this.clicked cluster id: ', this.clickedClusterId);
    const markerColors = [];
    if (this.plot_data && this.plot_data[0]) {
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
    if (this.psthTemplatesSubscription) {
      this.psthTemplatesSubscription.unsubscribe();
    }
    if (this.psthListSubscription) {
      this.psthListSubscription.unsubscribe();
    }
  }

  probe_selected(probeInsNum) {
    console.log('probe insertions selected: ', probeInsNum);
    const x_data = [];
    const y_data = [];
    const id_data = [];
    const size_data = [];
    const color_data = [];
    this.plot_data = [];
    this.cellsByProbeIns = [];
    this.probeIndex = parseInt(probeInsNum, 10);
    console.log('probeInsNum type: ', typeof probeInsNum)
    for (let entry of Object.values(this.cells)) {
      if (entry['probe_idx'] === parseInt(probeInsNum, 10)) {
        console.log('inputting new data for probe: ', probeInsNum);
        id_data.push(entry['cluster_id']);
        size_data.push(entry['channel_id']);
        y_data.push(entry['cluster_depth']);
        x_data.push(entry['cluster_amp']);
        color_data.push(entry['cluster_id']);
        this.cellsByProbeIns.push(entry);
      }
    }
    console.log(`data by probe index(${this.probeIndex}): `, this.cellsByProbeIns);
    this.sortedCellsByProbeIns = this.cellsByProbeIns;

    this.plot_data = [{
      x: x_data,
      y: y_data,
      customdata: id_data,
      text: id_data,
      mode: 'markers',
      marker: {
        size: 15,
        color: 'rgba(255, 255, 255, 0.2)',
        line: {
          color: 'rgba(132, 0, 0, 0.5)',
          width: 2
        }
      }
    }];
    this.targetClusterId = 0;
    this.clickedClusterId = this.targetClusterId;
    console.log('plot data for probe (' + probeInsNum + ') is - ', this.plot_data);
  
    this.order_by_event(this.eventType);
  }

  clusterSelectedPlot(data) {
    const element = this.el_nav.nativeElement.children[1];
    const rows = element.querySelectorAll('tr');
    this.targetClusterId = this.clickedClusterId;
    if (data['points'] && data['points'][0]['customdata']) {
      this.clickedClusterId = data['points'][0]['customdata'];
      rows[this.clickedClusterId].scrollIntoView({
                                      behavior: 'smooth',
                                      block: 'center'});
    }

  }

  clusterSelectedTable(cluster_id) {
    const element = this.el_nav.nativeElement.children[1];
    // console.log(cluster_id);
    const rows = element.querySelectorAll('tr');
    this.clickedClusterId = cluster_id;
    this.targetClusterId = this.clickedClusterId;

  }

  navigate_cell_plots(event, direction) {
    // console.log('going', direction, 'the list of cells');
    if (direction === 'up') {
      if (this.clickedClusterId - 1 > -1) {
        this.clickedClusterId -= 1;
        this.targetClusterId = this.clickedClusterId;
      }
    }
    if (direction === 'down') {
      if (this.clickedClusterId + 1 < this.plot_data[0]['x'].length + 1) {
        this.clickedClusterId += 1;
        this.targetClusterId = this.clickedClusterId;
      }
    }
  }

  order_by_event(eventType) {
    // console.log('event order selected!: ', eventType);
    this.eventType = eventType;
    const queryInfo = {};
    queryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    queryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    queryInfo['probe_idx'] = this.probeIndex;
    // queryInfo['cluster_revision'] = '0';
    queryInfo['event'] = this.eventType;
    queryInfo['sort_by'] = this.sortType;
    this.raster_data = [];
    this.raster_layout = [];
    this.raster_config = [];
    this.cellListService.retrieveRasterList(queryInfo);
    this.rasterListSubscription = this.cellListService.getRasterListLoadedListener()
      .subscribe((rasterPlotList) => {
        this.rasterPlotList = rasterPlotList;
        for (const raster of Object.values(rasterPlotList)) {

          this.raster_data.push(this.rasterTemplates[raster['template_idx']]['data']);
          const newLayout = this.rasterTemplates[raster['template_idx']]['layout'];
          newLayout['images'] = [{
            source: raster['plotting_data_link'],
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
          this.raster_config.push(this.plot_config);
        }
        console.log('raster layout on order by event - ', this.raster_layout);
      });

    const psthQueryInfo = {};
    psthQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    psthQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    psthQueryInfo['probe_idx'] = this.probeIndex;
    psthQueryInfo['event'] = this.eventType;
    this.psth_data = [];
    this.psth_layout = [];
    this.psth_config = [];
    this.cellListService.retrievePSTHList(psthQueryInfo);
    this.psthListSubscription = this.cellListService.getPSTHListLoadedListener()
      .subscribe((psthPlotList) => {
        this.psthPlotList = psthPlotList;
        for (const psth of Object.values(psthPlotList)) {

          const newData = this.psthTemplates[psth['psth_template_idx']]['data'];
          newData[0]['y'] = psth['psth_left'].split(',');
          newData[0]['x'] = psth['psth_time'].split(',');
          newData[1]['y'] = psth['psth_right'].split(',');
          newData[1]['x'] = psth['psth_time'].split(',');
          newData[2]['y'] = psth['psth_incorrect'].split(',');
          newData[2]['x'] = psth['psth_time'].split(',');
          newData[3]['y'] = psth['psth_all'].split(',');
          newData[3]['x'] = psth['psth_time'].split(',');

          const newLayout = this.psthTemplates[psth['psth_template_idx']]['layout'];
          newLayout['title']['text'] = `PSTH, aligned to ${psth['event']} time`;
          newLayout['xaxis']['range'] = psth['psth_x_lim'].split(',');
          this.psth_data.push(newData);
          this.psth_layout.push(newLayout);
          this.psth_config.push(this.plot_config);
        }
      });
  }

  order_by_sorting(sortType) {
    // console.log('sort order selected!: ', sortType);
    this.sortType = sortType;
    const queryInfo = {};
    queryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    queryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    queryInfo['probe_idx'] = this.probeIndex;
    // queryInfo['cluster_revision'] = '0';
    queryInfo['event'] = this.eventType;
    queryInfo['sort_by'] = this.sortType;
    this.raster_data = [];
    this.raster_layout = [];
    this.raster_config = [];
    this.cellListService.retrieveRasterList(queryInfo);
    this.rasterListSubscription = this.cellListService.getRasterListLoadedListener()
      .subscribe((rasterPlotList) => {
        // console.log('rasterplot list data');
        // console.log(rasterPlotList);
        this.rasterPlotList = rasterPlotList;
        for (const raster of Object.values(rasterPlotList)) {

          this.raster_data.push(this.rasterTemplates[raster['template_idx']]['data']);
          const newLayout = this.rasterTemplates[raster['template_idx']]['layout'];
          newLayout['images'] = [{
            // source: 'http://localhost:3333' + raster['plotting_data_link'],
            source: raster['plotting_data_link'],
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

          this.raster_config.push(this.plot_config);
        }
      });
  }

}
