import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, DoCheck, HostListener} from '@angular/core';

import { Subscription, Subject } from 'rxjs';

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

  fullRasterPurse = {};
  fullPSTHPurse = {};
  allRastersLoaded:boolean = false;
  allPSTHsLoaded:boolean = false;
  timeA;
  timeB;
  timeDiff;
  
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

  probeTrajInfo = {};


  depthRasterTrial;
  depthRasterTrialTemplates = {};

  depthRasterTrial_data = [];
  depthRasterTrial_layout = [];
  depthRasterTrial_config = [];
  depthRasterTrialLookup = {}; // for looking up plotting info like data/layout by probe index


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
  private probeTrajectorySubscription: Subscription;
  private depthRasterTrialSubscription: Subscription;

  private rasterListSubscription0: Subscription;
  private rasterListSubscription1: Subscription;
  private rasterListSubscription2: Subscription;
  private rasterListSubscription3: Subscription;
  private rasterListSubscription4: Subscription;
  private rasterListSubscription5: Subscription;
  private rasterListSubscription6: Subscription;
  private rasterListSubscription7: Subscription;
  private rasterListSubscription8: Subscription;
  private rasterListSubscription9: Subscription;
  private psthListSubscription0: Subscription;
  private psthListSubscription1: Subscription;
  private psthListSubscription2: Subscription;
  private psthListSubscription3: Subscription;

  private rasterTemplateSubscription: Subscription;
  private psthTemplatesSubscription: Subscription;
  private depthRasterTemplatesSubscription: Subscription

  private fullRasterSubscription: Subscription;
  private fullPSTHSubscription: Subscription;
  private fullRasterPSTHSubscription: Subscription;
  private fullRasterLoaded = new Subject();
  private fullPSTHLoaded = new Subject();
  private fullRasterPSTHLoaded = new Subject();
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
    this.timeA = new Date;
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
          // console.log('cells by probe insertion: ', this.cellsByProbeIns);
          

          // .then((fullPlots) => {
            // console.log('printing full plots returned from load all function: ', fullPlots);
            // console.log('------------')
            // console.log('full raster - : ', fullPlots[0])
            // console.log('=============')
            // console.log('this.probeIndex: ', this.probeIndex);
            // console.log('first probe of rasters: ', fullPlots[0][this.probeIndex])
            // console.log('this is the event/sort type: ', `${this.eventType}.${this.sortType}`);
            // let fullRasters = fullPlots[0]
            // let fullPSTHs = fullPlots[1]
            // console.log('should be the same as first probe of rasters: ', fullPlots[0][0]);
            // this.updateRaster(fullPlots[0.0][`${this.eventType}.${this.sortType}`]);
            // this.updateRaster(this.fullRasterPurse[this.probeIndex][`${this.eventType}.${this.sortType}`]);
            // this.updatePSTH(fullPlots[1][this.probeIndex][this.eventType]);
            // this.updatePSTH(this.fullPSTHPurse[this.probeIndex][this.eventType]);
          // });


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
          /////////////////////////////////////////old way/////////////////////////////////////////////////////
          const queryInfo = {};
          queryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
          queryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
          queryInfo['probe_idx'] = this.probeIndex;
          if (this.probeIndex || this.probeIndex === 0) {
            queryInfo['probe_idx'] = this.probeIndex;
          } else {
            // console.log('this.probeIndex was NOT ready for raster fetch...that is not good - coercing index to 0');
            queryInfo['probe_idx'] = 0;
          }
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
              // console.log('initial raster query: ', queryInfo);
              this.cellListService.retrieveRasterList(queryInfo);
              this.rasterListSubscription = this.cellListService.getRasterListLoadedListener()
                  .subscribe((rasterPlotList) => {
                      // console.log('initial fetch of rasters: ', rasterPlotList);
                      this.updateRaster(rasterPlotList);
                  });
          });

          const psthQueryInfo = {};
          psthQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
          psthQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
          if (this.probeIndex || this.probeIndex === 0) {
            psthQueryInfo['probe_idx'] = this.probeIndex;
          } else {
            // console.log('this.probeIndex was NOT ready for psth fetch...that is not good - coercing index to 0');
            psthQueryInfo['probe_idx'] = 0;
          }
          psthQueryInfo['event'] = this.eventType;

          this.cellListService.retrievePsthTemplates();
          this.psthTemplatesSubscription = this.cellListService.getPsthTemplatesLoadedListener()
            .subscribe((template) => {
              // console.log('psth template retrieved - ', template);
              for (const [index, temp] of Object.entries(template)) {
                if (temp['psth_template_idx'] === parseInt(index, 10)) {
                  this.psthTemplates.push(temp['psth_data_template']);
                }
              }
              // console.log('initial psth query: ', psthQueryInfo);
              this.cellListService.retrievePSTHList(psthQueryInfo);
              this.psthListSubscription = this.cellListService.getPSTHListLoadedListener()
                .subscribe((psthPlotList) => {
                  // console.log('initial fetch of psth: ', psthPlotList);
                  this.updatePSTH(psthPlotList);
                });
          });
          ///////////////////////////end of old way/////////////////////////////////////
          this.loadAllRaster_PSTH()

          /// filling probe trajectory info with initial probeIndex value////
          let probeTrajQueryInfo = {};
          probeTrajQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
          probeTrajQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
          probeTrajQueryInfo['probe_idx'] = this.probeIndex;
          this.cellListService.retrieveProbeTrajectory(probeTrajQueryInfo);
          this.probeTrajectorySubscription = this.cellListService.getProbeTrajectoryLoadedListener()
            .subscribe((probeTraj) => {
              if (probeTraj && probeTraj[0]) {

                this.probeTrajInfo['trajectory_source'] = probeTraj[0].insertion_data_source;
                this.probeTrajInfo['LM'] = probeTraj[0].x;
                this.probeTrajInfo['AP'] = probeTraj[0].y;
                this.probeTrajInfo['z'] = probeTraj[0].z;
                this.probeTrajInfo['depth'] = probeTraj[0].depth;
                this.probeTrajInfo['angle'] = probeTraj[0].theta;
                this.probeTrajInfo['phi'] = probeTraj[0].phi;
                this.probeTrajInfo['roll'] = probeTraj[0].roll;
                this.probeTrajInfo['provenance'] = probeTraj[0].provenance;
                if (probeTraj[0].x < 0) {
                  this.probeTrajInfo['hemisphere'] = 'left';
                } else if (probeTraj[0].x > 0) {
                  this.probeTrajInfo['hemisphere'] = 'right'
                }
                // console.log('probeTrajInfo: ', this.probeTrajInfo)
              } 
            });
          //////////// end of filling probe trajectory info ////////////////



          // begin grabbing trial depth rasters
          console.log('about to render depth raster trials')
          this.cellListService.getDepthRasterTemplates();
          this.depthRasterTemplatesSubscription = this.cellListService.getDepthRasterTemplatesLoadedListener()
            .subscribe((drtTemplates) => {
              for (let template of Object.values(drtTemplates)) {
                // console.log('template:', template)
                this.depthRasterTrialTemplates[template['depth_raster_template_idx']] = template['depth_raster_template']
              }
              console.log('templates for depth rasters retrieved: ', drtTemplates);
              
              this.cellListService.retrieveDepthRasterTrialPlot({
                'subject_uuid': this.sessionInfo['subject_uuid'],
                'session_start_time': this.sessionInfo['session_start_time'],
              });

            });
          
          this.depthRasterTrialSubscription = this.cellListService.getDepthRasterTrialLoadedListener()
            .subscribe((plotInfo) => {
              console.log('plotInfo fetched: ', plotInfo)
              this.depthRasterTrial = deepCopy(plotInfo);
              for (let plot of Object.values(plotInfo)) {
                console.log('plot', plot)
                if (!this.depthRasterTrialLookup[plot['probe_idx']]) {
                  this.depthRasterTrialLookup[plot['probe_idx']] = {}
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']] = {}
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]= {}
                } else if (!this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']]) {
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']] = {}
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]= {}
                } else if (!this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]) {
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]= {}
                }
                // this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]= {}
                this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'] = deepCopy(this.depthRasterTrialTemplates[plot['depth_raster_template_idx']]['data']);
                this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout'] = deepCopy(this.depthRasterTrialTemplates[plot['depth_raster_template_idx']]['layout']);

                if (plot['depth_raster_template_idx'] == 1) { // should be 1 all the time for trial depth rasters
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][0]['x'] = plot['plot_xlim'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][0]['y'] = plot['plot_ylim'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][1]['x'] = [plot['trial_start'], plot['trial_start']];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][1]['y'] = plot['plot_ylim'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][2]['x'] = [plot['trial_stim_on'], plot['trial_stim_on']];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][2]['y'] = plot['plot_ylim'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][3]['x'] = [plot['trial_feedback'], plot['trial_feedback']];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][3]['y'] = plot['plot_ylim'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][4]['x'] = [plot['trial_end'], plot['trial_end']];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][4]['y'] = plot['plot_ylim'];
                  
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout']['xaxis']['range'] = plot['plot_xlim'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout']['yaxis']['range'] = plot['plot_ylim'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout']['title']['text'] = plot['plot_title'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout']['images'][0]['source'] =  plot['plotting_data_link'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout']['images'][0]['sizex'] = plot['plot_xlim'][1] - plot['plot_xlim'][0];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout']['images'][0]['sizey'] = plot['plot_ylim'][1] - plot['plot_ylim'][0];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout']['images'][0]['x'] = plot['plot_xlim'][0];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout']['images'][0]['y'] = plot['plot_ylim'][1];
                
                } else {
                  console.error('trying to build depth raster trial plot with full driftmap template')
                }
              }
              console.log('depthRasterTrialLookup: ', this.depthRasterTrialLookup);
            });
          
          


         
        }
      });

      this.fullRasterSubscription = this.getFullRasterLoadedListener()
        .subscribe((rasterToPlot) => {
          // console.log('logging raster subscription content to initially plot: ', rasterToPlot);
          // console.log('type of rasterToPlot: ', typeof rasterToPlot)
          // this.updateRaster(rasterToPlot);
          // this.updateRaster(fullRasterPurse[this.probeIndex][`${this.eventType}.${this.sortType}`]);
        });

      this.fullPSTHSubscription = this.getFullPSTHLoadedListener()
        .subscribe((PSTHtoPlot) => {
          // console.log('logging PSTH content to initially plot: ', PSTHtoPlot);
          // this.updatePSTH(PSTHtoPlot);
          // this.updatePSTH(fullPSTHPurse[this.probeIndex][this.eventType]);
        });

    // if (this.fullRasterPurse[0].length) {
    //   this.updateRaster(this.fullRasterPurse[this.probeIndex][`${this.eventType}.${this.sortType}`]);
    // } else {
    //   console.log('rasterlist not ready yet')
    // }
    // if (this.fullPSTHPurse[0].length) {
    //   this.updatePSTH(this.fullPSTHPurse[this.probeIndex][this.eventType]);
    // } else {
    //   console.log("psth list not ready yet")
    // }
    

    // const queryInfo = {};
    // queryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    // queryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    // queryInfo['probe_idx'] = this.probeIndex;
    // if (this.probeIndex || this.probeIndex === 0) {
    //   queryInfo['probe_idx'] = this.probeIndex;
    // } else {
    //   console.log('this.probeIndex was NOT ready for raster fetch...that is not good - coercing index to 0');
    //   queryInfo['probe_idx'] = 0;
    // }
    // queryInfo['event'] = this.eventType;
    // queryInfo['sort_by'] = this.sortType;

    // this.cellListService.retrieveRasterTemplates();
    // this.rasterTemplateSubscription = this.cellListService.getRasterTemplatesLoadedListener()
    //   .subscribe((templates) => {
    //     // console.log('raster templates retrieved');
    //     for (const [index, temp] of Object.entries(templates)) {
    //       if (temp['template_idx'] === parseInt(index, 10)) {
    //         this.rasterTemplates.push(temp['raster_data_template']);
    //       }
    //     }
    //     console.log('initial raster query: ', queryInfo);
    //     this.cellListService.retrieveRasterList(queryInfo);
    //     this.rasterListSubscription = this.cellListService.getRasterListLoadedListener()
    //          .subscribe((rasterPlotList) => {
    //             console.log('initial fetch of rasters: ', rasterPlotList);
    //             this.updateRaster(rasterPlotList);
    //          });
    // });

    // const psthQueryInfo = {};
    // psthQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    // psthQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    // if (this.probeIndex || this.probeIndex === 0) {
    //   psthQueryInfo['probe_idx'] = this.probeIndex;
    // } else {
    //   console.log('this.probeIndex was NOT ready for psth fetch...that is not good - coercing index to 0');
    //   psthQueryInfo['probe_idx'] = 0;
    // }
    // psthQueryInfo['event'] = this.eventType;

    // this.cellListService.retrievePsthTemplates();
    // this.psthTemplatesSubscription = this.cellListService.getPsthTemplatesLoadedListener()
    //   .subscribe((template) => {
    //     // console.log('psth template retrieved - ', template);
    //     for (const [index, temp] of Object.entries(template)) {
    //       if (temp['psth_template_idx'] === parseInt(index, 10)) {
    //         this.psthTemplates.push(temp['psth_data_template']);
    //       }
    //     }
    //     console.log('initial psth query: ', psthQueryInfo);
    //     this.cellListService.retrievePSTHList(psthQueryInfo);
    //     this.psthListSubscription = this.cellListService.getPSTHListLoadedListener()
    //       .subscribe((psthPlotList) => {
    //         console.log('initial fetch of psth: ', psthPlotList);
    //         this.updatePSTH(psthPlotList);
    //       });
    //  });

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
    if (this.rasterListSubscription0) {
      this.rasterListSubscription0.unsubscribe();
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

    // requesting probe trajectory for selected probe 
    let probeTrajQueryInfo = {};
    probeTrajQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    probeTrajQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    probeTrajQueryInfo['probe_idx'] = this.probeIndex;
    this.cellListService.retrieveProbeTrajectory(probeTrajQueryInfo);
    this.probeTrajectorySubscription = this.cellListService.getProbeTrajectoryLoadedListener()
      .subscribe((probeTraj) => {
          this.probeTrajInfo = {};
        // console.log('probe trajectories retrieved - ', probeTraj)
        if (probeTraj && probeTraj[0]) {
          this.probeTrajInfo['trajectory_source'] = probeTraj[0].insertion_data_source;
          this.probeTrajInfo['LM'] = probeTraj[0].x;
          this.probeTrajInfo['AP'] = probeTraj[0].y;
          this.probeTrajInfo['z'] = probeTraj[0].z;
          this.probeTrajInfo['depth'] = probeTraj[0].depth;
          this.probeTrajInfo['angle'] = probeTraj[0].theta;
          this.probeTrajInfo['phi'] = probeTraj[0].phi;
          this.probeTrajInfo['roll'] = probeTraj[0].roll;
          this.probeTrajInfo['provenance'] = probeTraj[0].provenance;
          if (probeTraj[0].x < 0) {
            this.probeTrajInfo['hemisphere'] = 'left';
          } else if (probeTraj[0].x > 0) {
            this.probeTrajInfo['hemisphere'] = 'right'
          }
        }
        
      });

    // reorganizing data for plotting with new selected probe
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
          // console.log("clickedClusterId matched! - row['innerText']: ", parseInt(row['innerText'].split('	')[0], 10));
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
    this.sortType = 'trial_id';
    this.eventType = eventType;
    // const queryInfo = {};
    // queryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    // queryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    // queryInfo['probe_idx'] = this.probeIndex;
    // queryInfo['event'] = this.eventType;
    // queryInfo['sort_by'] = this.sortType;
    this.rasterLookup = {};
    // console.log('sort by event - updating rasters with: ', this.fullRasterPurse[this.probeIndex][`${this.eventType}.${this.sortType}`])
    this.updateRaster(this.fullRasterPurse[this.probeIndex][`${this.eventType}.${this.sortType}`]);
    // this.cellListService.retrieveRasterList(queryInfo);
    // this.rasterListSubscription = this.cellListService.getRasterListLoadedListener()
    //   .subscribe((rasterPlotList) => {
    //     this.updateRaster(rasterPlotList);
    //   });


    // const psthQueryInfo = {};
    // psthQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    // psthQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    // psthQueryInfo['probe_idx'] = this.probeIndex;
    // psthQueryInfo['event'] = this.eventType;
    this.psth_data = [];
    this.psth_layout = [];
    this.psth_config = [];
    // console.log('sort by event - updating psth with: ', this.fullPSTHPurse[this.probeIndex][this.eventType])
    this.updatePSTH(this.fullPSTHPurse[this.probeIndex][this.eventType]);
    // this.cellListService.retrievePSTHList(psthQueryInfo);
    // this.psthListSubscription = this.cellListService.getPSTHListLoadedListener()
    //   .subscribe((psthPlotList) => {
    //     this.updatePSTH(psthPlotList);
    //   });
  }

  order_by_sorting(sortType) {
    // console.log('logging sortType: ', sortType);
    this.sortType = sortType;
    // const queryInfo = {};
    // queryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    // queryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    // queryInfo['probe_idx'] = this.probeIndex;
    // queryInfo['event'] = this.eventType;
    // queryInfo['sort_by'] = this.sortType;
    this.rasterLookup = {};
    this.raster_data = [];
    this.raster_layout = [];
    this.raster_config = [];
    // console.log('rasterType: ', `${this.eventType}.${this.sortType}`)
    // console.log('updating rasters with: ', this.fullRasterPurse[this.probeIndex][`${this.eventType}.${this.sortType}`])
    this.updateRaster(this.fullRasterPurse[this.probeIndex][`${this.eventType}.${this.sortType}`]);
    // this.cellListService.retrieveRasterList(queryInfo);
    // this.rasterListSubscription = this.cellListService.getRasterListLoadedListener()
    //   .subscribe((rasterPlotList) => {
    //     this.updateRaster(rasterPlotList);
    //   });
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
      // this.psthLookup[psth['cluster_id']]['data'][0] = {
      //   y: psth['psth_left'] ? psth['psth_left'].split(',') : [],
      //   x: psth['psth_time'] ? psth['psth_time'].split(',') : [],
      //   name: 'left trials',
      //   mode: 'lines',
      //   marker: { size: 6, color: 'green' }
      // };
      // this.psthLookup[psth['cluster_id']]['data'][1] = {
      //   y: psth['psth_right'] ? psth['psth_right'].split(',') : [],
      //   x: psth['psth_time'] ? psth['psth_time'].split(',') : [],
      //   name: 'right trials',
      //   mode: 'lines',
      //   marker: { size: 6, color: 'blue' }
      // };
      // this.psthLookup[psth['cluster_id']]['data'][2] = {
      //   y: psth['psth_incorrect'] ? psth['psth_incorrect'].split(',') : [],
      //   x: psth['psth_time'] ? psth['psth_time'].split(',') : [],
      //   name: 'incorrect trials',
      //   mode: 'lines',
      //   marker: { size: 6, color: 'red' }
      // };
      // this.psthLookup[psth['cluster_id']]['data'][3] = {
      //   y: psth['psth_all'] ? psth['psth_all'].split(',') : [],
      //   x: psth['psth_time'] ? psth['psth_time'].split(',') : [],
      //   name: 'all trials',
      //   mode: 'lines',
      //   marker: { size: 6, color: 'black' }
      // };
      for (let templateType of Object.entries(this.psthLookup[psth['cluster_id']]['data'])) {
        // console.log('templateType: ', templateType);
        this.psthLookup[psth['cluster_id']]['data'][parseInt(templateType[0], 10)]['x'] = psth['psth_time'].split(',');
        switch (templateType[0]) {
          case '0':
            // templateType[1]['y'] = psth['psth_left'];
            this.psthLookup[psth['cluster_id']]['data'][0]['y'] = psth['psth_left_upper'].split(',');
            break;
          case '1':
            // templateType[1]['y'] = psth['psth_left_upper'];
            this.psthLookup[psth['cluster_id']]['data'][1]['y'] = psth['psth_left'].split(',');
            break;
          case '2':
            this.psthLookup[psth['cluster_id']]['data'][2]['y'] = psth['psth_left_lower'].split(',');
            break;
          case '3':
            this.psthLookup[psth['cluster_id']]['data'][3]['y'] = psth['psth_right_upper'].split(',');
            break;
          case '4':
            this.psthLookup[psth['cluster_id']]['data'][4]['y'] = psth['psth_right'].split(',');
            break;
          case '5':
            this.psthLookup[psth['cluster_id']]['data'][5]['y'] = psth['psth_right_lower'].split(',');
            break;
          case '6':
            this.psthLookup[psth['cluster_id']]['data'][6]['y'] = psth['psth_incorrect_upper'].split(',');
            break;
          case '7':
            this.psthLookup[psth['cluster_id']]['data'][7]['y'] = psth['psth_incorrect'].split(',');
            break;
          case '8':
            this.psthLookup[psth['cluster_id']]['data'][8]['y'] = psth['psth_incorrect_lower'].split(',');
            break;
          case '9':
            this.psthLookup[psth['cluster_id']]['data'][9]['y'] = psth['psth_all_upper'].split(',');
            break;
          case '10':
            this.psthLookup[psth['cluster_id']]['data'][10]['y'] = psth['psth_all'].split(',');
            break;
          case '11':
            this.psthLookup[psth['cluster_id']]['data'][11]['y'] = psth['psth_all_lower'].split(',');
            break;
        }
      }
      

      this.psthLookup[psth['cluster_id']]['layout']['title']['text'] = `PSTH, aligned to ${psth['event']} time`;
      this.psthLookup[psth['cluster_id']]['layout']['xaxis']['range'] = psth['psth_x_lim'] ? psth['psth_x_lim'].split(',') : [];
      this.psthLookup[psth['cluster_id']]['layout']['width'] = 770;
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
        // this.psthLookup[cluster['cluster_id']]['layout']['height'] = 420;
        // this.psthLookup[cluster['cluster_id']]['layout']['width'] = 658;
        // this.psthLookup[cluster['cluster_id']]['layout']['height'] = 370;
        // this.psthLookup[cluster['cluster_id']]['layout']['width'] = 800;
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
    // console.log('logging rasterTemplates: ', this.rasterTemplates);
    this.rasterPlotList = rasterPlotList;
    // console.log('raster plot list: ', rasterPlotList)
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
      // this.rasterLookup[raster['cluster_id']]['layout']['yaxis'] = {
      //   range: [raster['plot_ylim'][0].toString(), raster['plot_ylim'][1].toString()]
      // };
      this.rasterLookup[raster['cluster_id']]['layout']['yaxis']['range'] = [raster['plot_ylim'][0].toString(), raster['plot_ylim'][1].toString()]
      this.rasterLookup[raster['cluster_id']]['layout']['width'] = 658;
      this.rasterLookup[raster['cluster_id']]['layout']['height'] = 420;

      if (this.sortType === 'trial_id') {
        // this.rasterLookup[raster['cluster_id']]['data'][1]['showlegend'] = false;
        // this.rasterLookup[raster['cluster_id']]['data'][2]['showlegend'] = false;
        // this.rasterLookup[raster['cluster_id']]['data'][3]['showlegend'] = false;
        this.rasterLookup[raster['cluster_id']]['layout']['width'] = 530;
      }

      if (this.sortType === 'contrast') {
        // console.log('raster.plot_contrast_tick_pos: ', raster['plot_contrast_tick_pos']);
        // console.log('raster.plot_contrasts: ', raster['plot_contrasts']);
        
        this.rasterLookup[raster['cluster_id']]['layout']['yaxis2']['tickvals'] = raster['plot_contrast_tick_pos'];
        this.rasterLookup[raster['cluster_id']]['layout']['yaxis2']['ticktext'] = raster['plot_contrasts'];
        // console.log("this.rasterLookup[raster['cluster_id']]['layout']['yaxis2']: ", this.rasterLookup[raster['cluster_id']]['layout']['yaxis2']);
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

  loadAllRaster_PSTH() {
    let fullPlots;
    let fullRasterPlots = {};
    let fullPSTHPlots = {};
    // let rasterListSubscription: Subscription;
    // console.log('this.probeIndices: ', this.probeIndices);
    // event types: 'feedback' and 'stim on'
    // sort types: 'trial_id', 'feedback - stim on', 'feedback type', 'contrast'
    let rastersToLoad = ['feedback.trial_id', 'feedback.feedback type', 'stim on.trial_id', 'stim on.feedback - stim on', 'stim on.contrast']
    const rasterQueryInfo = {};
    rasterQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    rasterQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    let count = 0
    
    for (let probe of this.probeIndices) {
      

      this.fullRasterPurse[probe] = {};
      fullRasterPlots[probe] = {};
      rasterQueryInfo['probe_idx'] = probe;
      
      for (let rasterType of rastersToLoad) {
        rasterQueryInfo['event'] = rasterType.split('.')[0];
        rasterQueryInfo['sort_by'] = rasterType.split('.')[1];
        // console.log('rasterQueryInfo: ', rasterQueryInfo);
        this.cellListService[`retrieveRasterList${count}`](rasterQueryInfo);
        
        this[`rasterListSubscription${count}`] = this.cellListService[`getRasterListLoadedListener${count}`]()
          .subscribe((rasterPlotList) => {
            this.fullRasterPurse[probe][rasterType] = rasterPlotList;
            fullRasterPlots[probe][rasterType] = rasterPlotList
            // console.log('Object.values(this.fullRasterPurse[probe]).length: ',  Object.values(this.fullRasterPurse[probe]).length)
            // console.log(rasterPlotList);
            if (Object.values(this.fullRasterPurse).length == this.probeIndices.length && Object.values(this.fullRasterPurse[probe]).length == rastersToLoad.length) {
            // if (Object.values(fullRasterPlots).length == this.probeIndices.length && Object.values(fullRasterPlots[probe]).length == rastersToLoad.length) {

              // console.log('rasters are done loading - downloaded number of probes - ', Object.values(this.fullRasterPurse).length, ' - length of full raster purse: ', Object.values(this.fullRasterPurse[probe]).length);
              this.allRastersLoaded = true;
              if (this.allPSTHsLoaded && this.allRastersLoaded) {
                // console.log('all done (raster side)')
                // console.log(this.timeB - this.timeA)
                this.timeDiff = this.timeB - this.timeA;
                fullPlots = [this.fullRasterPurse, this.fullPSTHPurse];
                // console.log('updating Raster with: ', this.fullRasterPurse[this.probeIndex][`${this.eventType}.${this.sortType}`]);
                // console.log('updating Raster with: ', fullRasterPlots[this.probeIndex][`${this.eventType}.${this.sortType}`]);
                // console.log('updating PSTH with: ', fullPSTHPlots[this.probeIndex][this.eventType]);
                // console.log('probe index = ', this.probeIndex, ' - eventType = ', this.eventType, ' - sortType = ', this.sortType);
                // this.updatePSTH(fullPSTHPlots[this.probeIndex][this.eventType]);
                // this.updateRaster(fullRasterPlots[this.probeIndex][`${this.eventType}.${this.sortType}`]);
                // this.updatePSTH(this.fullPSTHPurse[this.probeIndex][this.eventType]);
                // this.updateRaster(this.fullRasterPurse[this.probeIndex][`${this.eventType}.${this.sortType}`]);
                // console.log('printing fullRasterPurse: ', this.fullRasterPurse);
                // console.log('printing fullPSTHPurse: ', this.fullPSTHPurse);
                // this.fullPSTHLoaded.next(fullPSTHPlots[this.probeIndex][this.eventType]);
                // this.fullRasterLoaded.next(fullRasterPlots[this.probeIndex][`${this.eventType}.${this.sortType}`]);
                // this.fullPSTHLoaded.next(this.fullPSTHPurse[this.probeIndex][this.eventType]);
                // this.fullRasterLoaded.next(this.fullRasterPurse[this.probeIndex][`${this.eventType}.${this.sortType}`]);
              } else {
                // console.log('all rasters are loaded, but not psth')
                // console.log('Rasters: ', this.allRastersLoaded);
                // console.log('PSTHs: ', this.allPSTHsLoaded);
              }
            }
          });
        count++
      }
    }
    
    

    let psthsToLoad = ['feedback', 'stim on'];
    const psthQueryInfo = {};
    psthQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    psthQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    let psthCount = 0
    for (let probe of this.probeIndices) {
      this.fullPSTHPurse[probe] = {};
      fullPSTHPlots[probe] = {}
      psthQueryInfo['probe_idx'] = probe;
      for (let ind in psthsToLoad) {
        psthQueryInfo['event'] = psthsToLoad[ind];
        this.cellListService[`retrievePSTHList${psthCount}`](psthQueryInfo);
        this[`psthListSubscription${psthCount}`] = this.cellListService[`getPSTHListLoadedListener${psthCount}`]()
          .subscribe((psthPlotList) => {
            this.fullPSTHPurse[probe][psthsToLoad[ind]] = psthPlotList;
            fullPSTHPlots[probe][psthsToLoad[ind]] = psthPlotList;
            if (Object.values(this.fullPSTHPurse).length == this.probeIndices.length && Object.values(this.fullPSTHPurse[probe]).length == psthsToLoad.length) {
              // console.log('psths are done loading - downloaded number of probes: ', Object.values(this.fullPSTHPurse).length, '- full psth purse length - ', Object.values(this.fullPSTHPurse[probe]).length);
              this.allPSTHsLoaded = true;
              if (this.allPSTHsLoaded && this.allRastersLoaded) {
                this.timeB = new Date;
                // console.log('all done (psth side)')
                // console.log(this.timeB - this.timeA)
                this.timeDiff = this.timeB - this.timeA;
                fullPlots = [this.fullRasterPurse, this.fullPSTHPurse];
                // console.log('updating PSTH with: ', this.fullPSTHPurse[this.probeIndex][this.eventType]);
                // console.log('updating PSTH with: ', fullPSTHPlots[this.probeIndex][this.eventType]);
                // console.log('updating Raster with: ', fullRasterPlots[this.probeIndex][`${this.eventType}.${this.sortType}`]);
                // console.log('probe index - ', this.probeIndex, 'eventType - ', this.eventType);
                // this.updatePSTH(psthPlotList);
                // this.updatePSTH(fullPSTHPlots[this.probeIndex][this.eventType]);
                // this.updateRaster(fullRasterPlots[this.probeIndex][`${this.eventType}.${this.sortType}`]);
                // this.updatePSTH(this.fullPSTHPurse[this.probeIndex][this.eventType]);
                // this.updateRaster(this.fullRasterPurse[this.probeIndex][`${this.eventType}.${this.sortType}`]);
                // console.log('printing fullPSTHPurse: ', this.fullPSTHPurse);
                // console.log('printing fullRasterPurse: ', this.fullRasterPurse);
                // this.fullPSTHLoaded.next(fullPSTHPlots[this.probeIndex][this.eventType]);
                // this.fullRasterLoaded.next(fullRasterPlots[this.probeIndex][`${this.eventType}.${this.sortType}`]);
                // this.fullPSTHLoaded.next(this.fullPSTHPurse[this.probeIndex][this.eventType]);
                // this.fullRasterLoaded.next(this.fullRasterPurse[this.probeIndex][`${this.eventType}.${this.sortType}`]);
              } else {
                // console.log('all psths are loaded, but not raster')
                // console.log('Rasters: ', this.allRastersLoaded);
                // console.log('PSTHs: ', this.allPSTHsLoaded);
              }
            }
          });
        psthCount++
      }
    }
    // return fullPlots;
  }

  
  getFullRasterLoadedListener() {
    // console.log('inside the full raster loaded listener');
    return this.fullRasterLoaded.asObservable();
  }
  getFullPSTHLoadedListener() {
    // console.log('inside the full PSTH loaded listener');
    return this.fullPSTHLoaded.asObservable();
  }

}

function deepCopy(obj) {
  try {
    // console.log('trying to deepcopy the obj -', obj);
    return JSON.parse(JSON.stringify(obj));
  }
  catch(err) {
    console.error(err);
    return obj
    
  }
  // return JSON.parse(JSON.stringify(obj));
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

