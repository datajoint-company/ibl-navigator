import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, DoCheck, HostListener} from '@angular/core';

import { Subscription } from 'rxjs';

import { CellListService } from './cell-list.service';

import { Sort } from '@angular/material/sort';

declare var Plotly: any;

@Component({
  selector: 'app-cell-list',
  templateUrl: './cell-list.component.html',
  styleUrls: ['./cell-list.component.css']
})
export class CellListComponent implements OnInit, OnDestroy, DoCheck {
  cells: any;
  session: any;
  clickedClusterId: number;
  clickedClusterIndex: number;
  cellsByProbeIns = [];
  sortedCellsByProbeIns = [];

  selectedGoodFilter = 0;

  plot_data;
  plot_layout;
  plot_config;
  cellOnFocus;

  rasterLookup = {};
  psthLookup = {};

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
  targetClusterDepth;
  targetClusterAmp;
  targetProbeIndex;

  eventType;
  sortType;
  probeIndex;
  probeIndices = [];

  gcfilter_types = {0: 'show all'};
  goodClusters = [];

  cluster_amp_data = [];
  cluster_depth_data = [];
  firing_rate_data = [];
  toPlot_x = 'cluster_amp';
  toPlot_y = 'cluster_depth';

  showController = false;

  raster_psth_config = {
    responsive: false,
    showLink: false,
    showSendToCloud: false,
    displaylogo: false,
    modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian',
      'hoverCompareCartesian', 'toImage', 'toggleSpikelines'],
    modeBarButtonsToAdd: [
      {
        name: 'toPngImage',
        title: 'download plot as png',
        icon: Plotly.Icons.download_png,
        click: function (gd) {
          const toPngImageButtonOptions = gd._context.toImageButtonOptions;
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
          const toSvgImageButtonOptions = gd._context.toImageButtonOptions;
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

  missing_raster_psth_config = {
    responsive: false,
    showLink: false,
    showSendToCloud: false,
    displaylogo: false,
    modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian',
      'hoverCompareCartesian', 'toImage', 'toggleSpikelines'],
  };



  private cellListSubscription: Subscription;
  private gcCriteriaSubscription: Subscription;
  private goodClusterSubscription: Subscription;
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
    if (window.pageYOffset > 640 || window.innerHeight > 1720) {
      this.showController = true;
    } else if (window.innerWidth > 1420) {
      this.showController = true;
    } else {
      this.showController = false;
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

    // console.log('window height: ', window.innerHeight);
    // console.log('window screen height: ', window.screen.height);
    // const element = this.el_nav.nativeElement;
    this.session = this.sessionInfo;
    // initial setting for plots viewer
    this.eventType = 'feedback';
    this.sortType = 'trial_id';
    this.clickedClusterId = 0;
    this.clickedClusterIndex = 0;
    this.probeIndex;


    this.cellListService.retrieveGCFilterTypes();
    this.gcCriteriaSubscription = this.cellListService.getGCCriteriaLoadedListener()
      .subscribe((criteria) => {
        if (Object.entries(criteria).length > 0) {
          for (let criterion of Object.values(criteria)) {
            this.gcfilter_types[criterion['criterion_id']] = criterion['criterion_description']
          }
        }
      })

    this.cellListService.retrieveCellList(this.sessionInfo);
    this.cellListSubscription = this.cellListService.getCellListLoadedListener()
      .subscribe((cellListData) => {
        if (Object.entries(cellListData).length > 0) {
          this.cells = cellListData;
          this.cellOnFocus = this.cells[2];
          // const cluster_amp_data = [];
          // const cluster_depth_data = [];
          // const firing_rate_data = [];
          this.cluster_amp_data = [];
          this.cluster_depth_data = [];
          this.firing_rate_data = [];
          const id_data = [];
          const size_data = [];
          const color_data = [];
          this.cellsByProbeIns = [];
          this.sortedCellsByProbeIns = [];

          let probeIndexListing = [];
          for (let entry of Object.values(cellListData)) {
            probeIndexListing.push(entry['probe_idx']);
          }
          this.probeIndex = Math.min(...probeIndexListing);

          for (let entry of Object.values(cellListData)) {
            if (!this.probeIndices.includes(entry['probe_idx'])) {
              this.probeIndices.push(entry['probe_idx']);
            }
            if (entry['probe_idx'] === this.probeIndex) {
              id_data.push(entry['cluster_id']);
              size_data.push(entry['channel_id']);
              this.cluster_depth_data.push(entry['cluster_depth']);
              this.cluster_amp_data.push(entry['cluster_amp']);
              this.firing_rate_data.push(entry['firing_rate']);
              color_data.push(entry['cluster_id']);
              this.cellsByProbeIns.push(entry);
              // this.sortedCellsByProbeIns.push(entry);
            }
          }
          this.sortedCellsByProbeIns = this.cellsByProbeIns;
          // console.log('sample data from cellsByProbeIns: ', this.cellsByProbeIns[3]);
          // console.log('sample data from sortedCellsByProbeIns: ', this.sortedCellsByProbeIns[3]);

          // console.log(`data by probe index(${this.probeIndex}): `, this.cellsByProbeIns);
          // console.log('cluster_amp_data is: ', cluster_amp_data);
          // console.log('cluster_depth_data is: ', cluster_depth_data);
          // console.log('color_data is: ', color_data);
          // console.log('size_data is: ', size_data);
          this.plot_data = [{
            // x: this.cluster_amp_data,
            // y: this.cluster_depth_data,
            x: this[`${this.toPlot_x}_data`],
            y: this[`${this.toPlot_y}_data`],
            customdata: {"id": id_data, "is_good_cluster": new Array(id_data.length).fill(true)},
            text: id_data,
            mode: 'markers',
            marker: {
              size: 15,
              color: 'rgba(255, 255, 255, 0.05)',
              line: {
                color: 'rgba(220, 140, 140, 0.6)',
                width: 1.7
              }
            }
          }];

          this.plot_layout = {
            // yaxis: {
            //   title: 'cluster depth (µm)',
            // },
            // xaxis: {
            //   title: 'cluster amp (µV)'
            // },
            updatemenus: [{
              y: 0.55,
              x: -0.1,
              yanchor: 'top',
              buttons: [{
                method: 'restyle',
                args: ['selected_y', 'cluster_depth'],
                label: 'cluster depth (µm)'
              }, {
                method: 'restyle',
                args: ['selected_y', 'cluster_amp'],
                label: 'cluster amp (µV)'
              }, {
                method: 'restyle',
                args: ['selected_y', 'firing_rate'],
                label: 'firing rate'
              }]
            },{
              x: 0.3,
              y: -0.15,
              direction: 'right',
              buttons: [{
                method: 'restyle',
                args: ['selected_x', 'cluster_amp'],
                label: 'cluster amp (µV)'
              }, {
                method: 'restyle',
                args: ['selected_x', 'cluster_depth'],
                label: 'cluster depth (µm)'
              }, {
                method: 'restyle',
                args: ['selected_x', 'firing_rate'],
                label: 'firing rate'
              }]
            }],
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
        // console.log('raster templates retrieved');
        for (const [index, temp] of Object.entries(templates)) {
          if (temp['template_idx'] === parseInt(index, 10)) {
            this.rasterTemplates.push(temp['raster_data_template']);
          }
        }
        this.cellListService.retrieveRasterList(queryInfo);
        this.rasterListSubscription = this.cellListService.getRasterListLoadedListener()
             .subscribe((rasterPlotList) => {
                this.updateRaster(rasterPlotList);
             });
    });

    const psthQueryInfo = {};
    psthQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    psthQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    psthQueryInfo['probe_idx'] = this.probeIndex;
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
            this.updatePSTH(psthPlotList);
          });
      });

  }

  ngDoCheck() {
    // console.log('do check ran');
    // console.log('this.clicked cluster id: ', this.clickedClusterId);
    const markerColors = [];
    if (this.plot_data && this.plot_data[0]) {
      if (this.plot_data[0]['x'] && this.clickedClusterIndex > -1) {
        // console.log('clicked index: ', this.clickedClusterIndex)
        // console.log('clicked id: ', this.clickedClusterId)
        for (let i = 0; i < this.plot_data[0]['x'].length; i++) {
          // if (this.clickedClusterIndex === i) {
          if (this.clickedClusterId === i) {
            markerColors.push('rgba(0, 0, 0, 1)'); // black
          } else {
            
            if (this.plot_data[0]['customdata.is_good_cluster'] && this.plot_data[0]['customdata.is_good_cluster'][i]) {
              markerColors.push('rgba(220, 140, 140, 0.4)'); // regular red
            } else if (this.plot_data[0]['customdata.is_good_cluster']) {
              markerColors.push('rgba(0, 0, 0, 0.2)'); // gray
            } else {
              markerColors.push('rgba(220, 140, 140, 0.4)'); // regular red
            }
          }
        }
      } else {
        for (let i = 0; i < this.plot_data[0]['x'].length; i++) {
          if (this.plot_data[0]['customdata.is_good_cluster'] && this.plot_data[0]['customdata.is_good_cluster'][i]) {
            markerColors.push('rgba(220, 140, 140, 0.4)'); // regular red
          } else if (this.plot_data[0]['customdata.is_good_cluster']) {
            markerColors.push('rgba(0, 0, 0, 0.2)'); // gray
          } else {
            markerColors.push('rgba(220, 140, 140, 0.4)'); // regular red
          }
        }
      }
      this.plot_data[0]['marker']['line']['color'] = markerColors;
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
    if (this.gcCriteriaSubscription) {
      this.gcCriteriaSubscription.unsubscribe();
    }
  }

  probe_selected(probeInsNum) {
    // console.log('probe insertions selected: ', probeInsNum);
    // const cluster_amp_data = [];
    // const cluster_depth_data = [];
    // const firing_rate_data = [];
    this.cluster_amp_data = [];
    this.cluster_depth_data = [];
    this.firing_rate_data = [];
    const id_data = [];
    const size_data = [];
    const color_data = [];
    this.plot_data = [];
    this.cellsByProbeIns = [];
    this.sortedCellsByProbeIns = [];
    this.probeIndex = parseInt(probeInsNum, 10);
    // console.log('probeInsNum type: ', typeof probeInsNum)
    for (let entry of Object.values(this.cells)) {
      if (entry['probe_idx'] === parseInt(probeInsNum, 10)) {
        // console.log('inputting new data for probe: ', probeInsNum);
        id_data.push(entry['cluster_id']);
        size_data.push(entry['channel_id']);
        this.cluster_depth_data.push(entry['cluster_depth']);
        this.cluster_amp_data.push(entry['cluster_amp']);
        this.firing_rate_data.push(entry['firing_rate']);
        color_data.push(entry['cluster_id']);
        this.cellsByProbeIns.push(entry);
        // this.sortedCellsByProbeIns.push(entry);
      }
    }
    // console.log(`data by probe index(${this.probeIndex}): `, this.cellsByProbeIns);
    this.sortedCellsByProbeIns = this.cellsByProbeIns;

    this.plot_data = [{
      // x: this.cluster_amp_data,
      // y: this.cluster_depth_data,
      x: this[`${this.toPlot_x}_data`],
      y: this[`${this.toPlot_y}_data`],
      customdata: {"id": id_data, "is_good_cluster": new Array(id_data.length).fill(true)},
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
    this.clickedClusterId = 0;
    // console.log('plot data for probe (' + probeInsNum + ') is - ', this.plot_data);
    this.order_by_event(this.eventType);

    if (this.selectedGoodFilter) {
      this.gcfilter_selected(this.selectedGoodFilter);
    }
  }

  gcfilter_selected(filterID) {
    // console.log('gcfilter: ', filterID);
    // console.log('type of filter: ', typeof filterID);
    // console.log('selected filter criterion id: ', filterID);
    this.selectedGoodFilter = parseInt(filterID, 10);
    let goodFilterQueryInfo = {};
    goodFilterQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    goodFilterQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    goodFilterQueryInfo['probe_idx'] = this.probeIndex;
    goodFilterQueryInfo['criterion_id'] = parseInt(filterID, 10);
    // console.log('querying for good cluster with: ', goodFilterQueryInfo);
    if (goodFilterQueryInfo['criterion_id']) {
      this.cellListService.retrieveGoodClusters(goodFilterQueryInfo);
    this.goodClusterSubscription = this.cellListService.getGoodClustersLoadedListener()
      .subscribe((goodClusterList) => {
        if (Object.entries(goodClusterList).length > 0) {
          // console.log('good clusters retrieved! length: ', goodClusterList.length);
          this.goodClusters = [];
          const id_data = [];
          const is_good_data = [];
          const color_data = [];
          // this.cellsByProbeIns = [];
          this.plot_data[0]['customdata'] = {};
          this.plot_data[0]['marker']['line']['color'] = [];
          for (let entry of Object.values(goodClusterList)) {
            if (entry['probe_idx'] === this.probeIndex) {
              id_data.push(entry['cluster_id']);
              color_data.push(entry['cluster_id']);
              is_good_data.push(entry['is_good']);
              if (entry['is_good']) {
                color_data.push('rgba(132, 0, 0, 0.5)');
                this.goodClusters.push(entry['cluster_id']);
              } else {
                color_data.push('rgba(0, 0, 0, 0.2)')
              }
              // this.cellsByProbeIns.push(entry);
            }
          }
          // this.sortedCellsByProbeIns = this.cellsByProbeIns;

          this.plot_data[0]['customdata.id'] = id_data;
          this.plot_data[0]['customdata.is_good_cluster'] = is_good_data;
          this.plot_data[0]['marker.line.color'] = color_data;
          
          this.clickedClusterId = 0;
          this.order_by_event(this.eventType);
        }
      })

    } else {
      this.goodClusters = [];
      const id_data = [];
      const is_good_data = [];
      const color_data = [];
      this.plot_data[0]['customdata'] = {};
      this.plot_data[0]['marker']['line']['color'] = [];
      // this.cellsByProbeIns = [];
      for (let entry of Object.values(this.cells)) {
        if (entry['probe_idx'] === this.probeIndex) {
          id_data.push(entry['cluster_id']);
          color_data.push(entry['cluster_id']);
          is_good_data.push(1);
          // this.cellsByProbeIns.push(entry);
          color_data.push('rgba(132, 0, 0, 0.5)');
          
        }
      }

      this.plot_data[0]['customdata.id'] = id_data;
      this.plot_data[0]['customdata.is_good_cluster'] = is_good_data;
      this.plot_data[0]['marker.line.color'] = color_data;

      this.clickedClusterId = 0;
      this.order_by_event(this.eventType);
    }
    
  }

  clusterSelectedPlot(data) {
    const element = this.el_nav.nativeElement.children[1];
    const rows = element.querySelectorAll('tr');
    // console.log("data['points'][0] in clusterSelectedPlot: ", data['points'][0]);
    // console.log("data['points'][0]['text'] in clusterSelectedPlot: ", data['points'][0]['text']);
    // console.log("type of data['points'][0]['text']: ", typeof data['points'][0]['text']);
    if (data['points'] && data['points'][0]['text']) {
      this.clickedClusterId = data['points'][0]['text'];

      let rowIndex = 0;
      for (const row of rows) {
        if (this.clickedClusterId === parseInt(row['innerText'].split('	')[0], 10)) {
          console.log("clickedClusterId matched! - row['innerText']: ", parseInt(row['innerText'].split('	')[0], 10));
          this.clickedClusterIndex = rowIndex;
          row.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
        rowIndex += 1;
      }
    }

  }

  clusterSelectedTable(cluster_id) {
    // for (const [index, cluster] of Object.entries(this.cellsByProbeIns)) {
    for (const [index, cluster] of Object.entries(this.sortedCellsByProbeIns)) {
      if (cluster['cluster_id'] === cluster_id) {
        this.clickedClusterIndex = parseInt(index, 10);
        this.clickedClusterId = cluster_id;
      }
    }
    // this.clickedClusterId = cluster_id;

  }

  navigate_cell_plots(event, direction) {
    // console.log('going', direction, 'the list of cells');
    if (direction === 'up') {
      if (this.clickedClusterIndex - 1 > -1) {
        this.clickedClusterIndex -= 1;
      }
    }
    if (direction === 'down') {
      if (this.clickedClusterIndex + 1 < this.plot_data[0]['x'].length) {
        this.clickedClusterIndex += 1;
      }
    }
    // this.clickedClusterId = this.cellsByProbeIns[this.clickedClusterIndex]['cluster_id'];
    this.clickedClusterId = this.sortedCellsByProbeIns[this.clickedClusterIndex]['cluster_id'];
  }

  restylePlot(data) {
    // console.log('restyling the plot: ', data);
    if (data[0]['selected_y']) {
      let selected_plot = data[0]['selected_y'];
      this.plot_data[0].y = this[`${selected_plot}_data`];
      this.toPlot_y = selected_plot;
    } else if (data[0]['selected_x']) {
      let selected_plot = data[0]['selected_x'];
      this.plot_data[0].x = this[`${selected_plot}_data`];
      this.toPlot_x = selected_plot;
    }
  }

  order_by_event(eventType) {
    // console.log('event order selected!: ', eventType);
    this.eventType = eventType;
    const queryInfo = {};
    queryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    queryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    queryInfo['probe_idx'] = this.probeIndex;
    queryInfo['event'] = this.eventType;
    queryInfo['sort_by'] = this.sortType;
    this.rasterLookup = {};
    this.cellListService.retrieveRasterList(queryInfo);
    this.rasterListSubscription = this.cellListService.getRasterListLoadedListener()
      .subscribe((rasterPlotList) => {
        // console.log('updating raster - rasterLookup should be empty: ', this.rasterLookup);
        this.updateRaster(rasterPlotList);
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
        this.updatePSTH(psthPlotList);
      });
  }

  order_by_sorting(sortType) {
    console.log('logging sortType: ', sortType);
    this.sortType = sortType;
    const queryInfo = {};
    queryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    queryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    queryInfo['probe_idx'] = this.probeIndex;
    queryInfo['event'] = this.eventType;
    queryInfo['sort_by'] = this.sortType;
    this.rasterLookup = {};
    this.raster_data = [];
    this.raster_layout = [];
    this.raster_config = [];
    this.cellListService.retrieveRasterList(queryInfo);
    this.rasterListSubscription = this.cellListService.getRasterListLoadedListener()
      .subscribe((rasterPlotList) => {
        this.updateRaster(rasterPlotList);
      });
  }

  updatePSTH(psthPlotList) {
    // console.log('psth plot list - ', psthPlotList);
    this.psthPlotList = psthPlotList;
    for (const psth of psthPlotList) {
      const currentTemplate = deepCopy(this.psthTemplates[psth['psth_template_idx']]);
      const psthConfigCopy = { ...this.raster_psth_config };
      psthConfigCopy['toImageButtonOptions'] = {
        filename: `PSTHplot_${this.session['session_start_time']}(cluster_${psth['cluster_id']})`,
        scale: 1
      };
      this.psthLookup[psth['cluster_id']] = {
        data: currentTemplate['data'],
        layout: currentTemplate['layout'],
        config: psthConfigCopy
        // config: this.raster_psth_config,
      };
      this.psthLookup[psth['cluster_id']]['data'][0] = {
        y: psth['psth_left'] ? psth['psth_left'].split(',') : [],
        x: psth['psth_time'] ? psth['psth_time'].split(',') : [],
        name: 'left trials',
        mode: 'lines',
        marker: { size: 6, color: 'green' }
      };
      this.psthLookup[psth['cluster_id']]['data'][1] = {
        y: psth['psth_right'] ? psth['psth_right'].split(',') : [],
        x: psth['psth_time'] ? psth['psth_time'].split(',') : [],
        name: 'right trials',
        mode: 'lines',
        marker: { size: 6, color: 'blue' }
      };
      this.psthLookup[psth['cluster_id']]['data'][2] = {
        y: psth['psth_incorrect'] ? psth['psth_incorrect'].split(',') : [],
        x: psth['psth_time'] ? psth['psth_time'].split(',') : [],
        name: 'incorrect trials',
        mode: 'lines',
        marker: { size: 6, color: 'red' }
      };
      this.psthLookup[psth['cluster_id']]['data'][3] = {
        y: psth['psth_all'] ? psth['psth_all'].split(',') : [],
        x: psth['psth_time'] ? psth['psth_time'].split(',') : [],
        name: 'all trials',
        mode: 'lines',
        marker: { size: 6, color: 'black' }
      };

      this.psthLookup[psth['cluster_id']]['layout']['title']['text'] = `PSTH, aligned to ${psth['event']} time`;
      this.psthLookup[psth['cluster_id']]['layout']['xaxis']['range'] = psth['psth_x_lim'] ? psth['psth_x_lim'].split(',') : [];
      this.psthLookup[psth['cluster_id']]['layout']['width'] = 658;
      this.psthLookup[psth['cluster_id']]['layout']['height'] = 420;

    }

    const dummyData = {
      marker: {
        opacity: '0'
      },
      mode: 'markers',
      type: 'scatter',
      x: ['-1', '1'],
      y: ['0', '3']
    };

    const dummyLayout = {
      height: 420,
      width: 658,
      margin: {
        b: 40,
        l: 50,
        r: 30,
        t: 80,
        pad: 0
      }
    };
    // for (const cluster of this.cellsByProbeIns) {
    for (const cluster of this.sortedCellsByProbeIns) {
      if (!this.psthLookup[cluster['cluster_id']]) {
        this.psthLookup[cluster['cluster_id']] = {
          data: this.psthLookup[Object.keys(this.psthLookup)[0]] ? deepCopy(this.psthLookup[Object.keys(this.psthLookup)[0]]['data']) : dummyData,
          layout: this.psthLookup[Object.keys(this.psthLookup)[0]] ?
                  deepCopy(this.psthLookup[Object.keys(this.psthLookup)[0]]['layout']) : dummyLayout,
          config: this.missing_raster_psth_config
        };
        this.psthLookup[cluster['cluster_id']]['layout']['height'] = 420;
        this.psthLookup[cluster['cluster_id']]['layout']['width'] = 658;
        this.psthLookup[cluster['cluster_id']]['layout']['xaxis'] = {
          range: ['-1', '1'],
          type: 'linear'
        };
        this.psthLookup[cluster['cluster_id']]['layout']['yaxis'] = {
          range: ['0', '3'],
          type: 'linear'
        };
        this.psthLookup[cluster['cluster_id']]['layout']['images'] = [{
          source: '/assets/images/plot_unavailable.png',
          layer: 'below',
          sizex: 2,
          sizey: 3,
          sizing: 'stretch',
          x: '-1',
          y: '3',
          xref: 'x',
          yref: 'y'
        }];
        this.psthLookup[cluster['cluster_id']]['layout']['title'] = {
          text : 'Missing PSTH Plot'
        };
      } else {
        // console.log('else for cluster_id: ', cluster['cluster_id']);
        // console.log(`rasterLookup[${cluster['cluster_id']}]: `, this.rasterLookup[cluster['cluster_id']]);
      }
    }
    // console.log('psth lookup: ', this.psthLookup);
  }

  updateRaster(rasterPlotList) {
    console.log('logging rasterTemplates: ', this.rasterTemplates);
    this.rasterPlotList = rasterPlotList;
    console.log('raster plot list: ', rasterPlotList)
    for (const raster of rasterPlotList) {
      const currentTemplate = deepCopy(this.rasterTemplates[raster['template_idx']]);
      const rasterConfigCopy = { ...this.raster_psth_config };
      rasterConfigCopy['toImageButtonOptions'] = {
        filename: `rasterplot_${this.session['session_start_time']}(cluster_${raster['cluster_id']})`,
        scale: 1
      };
      this.rasterLookup[raster['cluster_id']] = {
        data: currentTemplate['data'],
        layout: currentTemplate['layout'],
        config: rasterConfigCopy,
        // config: this.raster_psth_config
      };
      this.rasterLookup[raster['cluster_id']]['data'][0]['y'] = raster['plot_ylim'];
      if (raster['mark_label']) {
        this.rasterLookup[raster['cluster_id']]['data'][4]['name'] =
          this.rasterLookup[raster['cluster_id']]['data'][4]['name'].replace('event', raster['mark_label']);
        this.rasterLookup[raster['cluster_id']]['data'][5]['name'] =
          this.rasterLookup[raster['cluster_id']]['data'][5]['name'].replace('event', raster['mark_label']);
        this.rasterLookup[raster['cluster_id']]['data'][6]['name'] =
          this.rasterLookup[raster['cluster_id']]['data'][6]['name'].replace('event', raster['mark_label']);
      }
      let image_link = raster['plotting_data_link'];
      if (image_link === '') {
        image_link = '/assets/images/plot_unavailable.png';
      }

      this.rasterLookup[raster['cluster_id']]['layout']['images'] = [{
        source: image_link,
        y: raster['plot_ylim'][1],
        sizey: parseFloat(raster['plot_ylim'][1]) - parseFloat(raster['plot_ylim'][0]),
        layer: 'below',
        sizex: 2,
        sizing: 'stretch',
        x: '-1',
        xref: 'x',
        yref: 'y'
      }];
      const titleJoined = `${currentTemplate.layout.title.text}${raster['event']}`;
      this.rasterLookup[raster['cluster_id']]['layout']['title'] = {
        text: titleJoined,
        x: currentTemplate.layout.title.x,
        y: currentTemplate.layout.title.y,
      };
      this.rasterLookup[raster['cluster_id']]['layout']['yaxis'] = {
        range: [raster['plot_ylim'][0].toString(), raster['plot_ylim'][1].toString()]
      };
      this.rasterLookup[raster['cluster_id']]['layout']['width'] = 658;
      this.rasterLookup[raster['cluster_id']]['layout']['height'] = 420;

      if (this.sortType === 'trial_id') {
        // this.rasterLookup[raster['cluster_id']]['data'][1]['showlegend'] = false;
        // this.rasterLookup[raster['cluster_id']]['data'][2]['showlegend'] = false;
        // this.rasterLookup[raster['cluster_id']]['data'][3]['showlegend'] = false;
        this.rasterLookup[raster['cluster_id']]['layout']['width'] = 530;
      }
    }

    // console.log('logginng cellsByProbeINs:', this.cellsByProbeIns);
    // for (const cluster of this.cellsByProbeIns) {
    for (const cluster of this.sortedCellsByProbeIns) {
      if (!this.rasterLookup[cluster['cluster_id']]) {
        if (this.rasterLookup[Object.keys(this.rasterLookup)[0]]) {
          this.rasterLookup[cluster['cluster_id']] = {
            data: deepCopy(this.rasterLookup[Object.keys(this.rasterLookup)[0]]['data']),
            layout: deepCopy(this.rasterLookup[Object.keys(this.rasterLookup)[0]]['layout']),
            config: this.missing_raster_psth_config
          };
          // this.rasterLookup[cluster['cluster_id']]['data'][0]['showlegend'] = false;
          // this.rasterLookup[cluster['cluster_id']]['data'][1]['showlegend'] = false;
          // this.rasterLookup[cluster['cluster_id']]['data'][2]['showlegend'] = false;
          // this.rasterLookup[cluster['cluster_id']]['data'][3]['showlegend'] = false;

          this.rasterLookup[cluster['cluster_id']]['layout']['height'] = 420;
          this.rasterLookup[cluster['cluster_id']]['layout']['width'] = 658;
          this.rasterLookup[cluster['cluster_id']]['layout']['xaxis'] = {
            range: ['-1', '1'],
            type: 'linear'
          };
          this.rasterLookup[cluster['cluster_id']]['layout']['yaxis'] = {
            range: ['0', '3'],
            type: 'linear'
          };
          this.rasterLookup[cluster['cluster_id']]['layout']['images'][0] = {
            source: '/assets/images/plot_unavailable.png',
            layer: 'below',
            sizex: 2,
            sizey: 3,
            x: '1',
            y: '3',
            sizing: 'stretch',
            xref: 'x',
            yref: 'y'
          };
          this.rasterLookup[cluster['cluster_id']]['layout']['title']['text'] = 'Missing Raster Plot';

        }
        
      } else {
        // console.log('else for cluster_id: ', cluster['cluster_id']);
        // console.log(`rasterLookup[${cluster['cluster_id']}]: `, this.rasterLookup[cluster['cluster_id']]);
      }
    }
      // console.log('raster look up: ', this.rasterLookup);
    }

    sortData(sort: Sort) {
      // console.log('sorting activated: ', sort);
      // const data = this.cellsByProbeIns.slice();
      const data = this.sortedCellsByProbeIns.slice();
      if (!sort.active || sort.direction === '') {
        this.sortedCellsByProbeIns = data;
        return;
      }

      this.sortedCellsByProbeIns = data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'cluster_id': return compare(a.cluster_id, b.cluster_id, isAsc);
          case 'cluster_depth': return compare(a.cluster_depth, b.cluster_depth, isAsc);
          case 'cluster_amp': return compare(a.cluster_amp, b.cluster_amp, isAsc);
          case 'firing_rate': return compare(a.firing_rate, b.firing_rate, isAsc);
          default: return 0;
        }
      });
    }
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

