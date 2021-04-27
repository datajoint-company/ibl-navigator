import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, DoCheck, HostListener } from '@angular/core';

import { Subscription, Subject } from 'rxjs';

import { CellListService } from './cell-list.service';

import { Sort } from '@angular/material/sort';

import { SuperGif } from '@wizpanda/super-gif';

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


  plot_layout_DBR;
  plot_layout_processed;
  plot_data_processed;
  annotationField;
  depthBrainRegionDataPts;

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
  fullNavPlotData;

  targetClusterRowInfo = [];
  targetClusterDepth;
  targetClusterAmp;
  targetProbeIndex;

  eventType; // for currently selected event type
  eventList = ['stim on', 'feedback', 'movement']; // all types of event used for flipping through (raster)/psth/depthPETH
  eventList_new = ['stim on', 'feedback', 'movement'];
  sortType;
  probeIndex;
  probeIndices = [];
  coronalSections: Array<Object>; // contains coronal sections object with the link to S3
  coronalSectionProbeList = []; // extracted just the corresponding probe indexes for easier rendering 
  probeInfo = {}; // for retrieve probe label names for the selected probe

  gcfilter_types = {0: 'show all'};
  goodClusters = [];

  cluster_amp_data = [];
  cluster_depth_data = [];
  firing_rate_data = [];
  toPlot_x = 'cluster_amp';
  toPlot_y = 'cluster_depth';

  probeTrajInfo = {};
  depthPETH;
  depthPethTemplates = {};
  depthPethLookup = {};

  spikeAmpTimeLookup = {};
  spikeAmpTime;
  satTemplate = [];
  autocorrelogramLookup = {};
  autocorrelogram;
  acgTemplate = [];
  waveformLookup = {};
  waveform;
  wfTemplate = [];


  depthRasterTrial;
  depthRasterTrialTemplates = {};

  depthRasterTrialLookup = {}; // for looking up plotting info like data/layout by probe index
  depthRasterTrialLookupA = {};
  depthRasterTrialLookupB = {};

  sliderDepthRasterTrialLookup = {};
  sliderDepthRasterTrialLookupA = {};
  sliderDepthRasterTrialLookupB = {};
  contrastMinLookup = {};
  contrastMinLookupA = {};
  contrastMinLookupB = {};
  slidersSetting = {};
  slidersSettingA = {};
  slidersSettingB = {};
  selectedTrialType = "Correct Left Contrast"; // initialize with correct left
  selectedTrialContrast;
  featuredTrialId;
  featuredTrialIdB;
  availableTrialContrasts = [];

  showController = false;
  minimizeController = false;

  depthPETHtimeA;
  depthPETHtimeB;
  depthPETHtimeC;

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

  depthPETH_config = {
    responsive: false,
    showLink: false,
    showSendToCloud: false,
    displaylogo: false,
    modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian',
      'hoverCompareCartesian', 'toImage', 'toggleSpikelines', 'autoScale2d'],
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


  rasterEventLacksMovement:boolean;
  psthEventLacksMovement:boolean;
  depthPethEventLacksMovement:boolean;

  private cellListSubscription: Subscription;
  private gcCriteriaSubscription: Subscription;
  private goodClusterSubscription: Subscription;
  private rasterListSubscription: Subscription;
  private psthListSubscription: Subscription;
  private probeTrajectorySubscription: Subscription;
  private depthBrainRegionsSubscription: Subscription;
  private depthRasterTrialSubscription: Subscription;
  private depthPethSubscription: Subscription;
  private spikeAmpTimeSubscription: Subscription;
  private acgSubscription: Subscription;
  private waveformSubscription: Subscription;
  private coronalSectionsSubscription: Subscription;

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
  private rasterListSubscription10: Subscription;
  private rasterListSubscription11: Subscription;
  private rasterListSubscription12: Subscription;
  private rasterListSubscription13: Subscription;
  private rasterListSubscription14: Subscription;
  private rasterListSubscription15: Subscription;
  private rasterListSubscription16: Subscription;
  private rasterListSubscription17: Subscription;
  private psthListSubscription0: Subscription;
  private psthListSubscription1: Subscription;
  private psthListSubscription2: Subscription;
  private psthListSubscription3: Subscription;
  private psthListSubscription4: Subscription;
  private psthListSubscription5: Subscription;
  private psthListSubscription6: Subscription;
  private psthListSubscription7: Subscription;

  private rasterTemplateSubscription: Subscription;
  private psthTemplatesSubscription: Subscription;
  private depthRasterTemplatesSubscription: Subscription;
  private depthPethTemplateSubscription: Subscription;
  private satTemplateSubscription: Subscription;
  private acgTemplateSubscription: Subscription;
  private wfTemplateSubscription: Subscription;

  private fullRasterSubscription: Subscription;
  private fullPSTHSubscription: Subscription;
  private fullRasterPSTHSubscription: Subscription;
  private fullRasterLoaded = new Subject();
  private fullPSTHLoaded = new Subject();
  private fullRasterPSTHLoaded = new Subject();
  @Input() sessionInfo: Object;
  @ViewChild('navTable') el_nav: ElementRef;
  // @ViewChild('brainGIF') brain_gif: ElementRef;
  // spinningBrain;

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
    // console.log('window: ', window)
    // console.log('document: ', document.documentElement.scrollHeight)
    // console.log('Height-pageYOffset: ', document.documentElement.scrollHeight  - window.pageYOffset)
    // console.log('window.innerHeight: ', window.innerHeight)
    // console.log('window.pageYOffset: ', window.pageYOffset)
    if (this.depthRasterTrialLookup[this.probeIndex]) {
      if ((window.pageYOffset > 640 || window.innerHeight > 1720) && document.documentElement.scrollHeight - window.pageYOffset > 1300) {
        this.showController = true;
      } else if (window.innerWidth > 1420 && window.pageYOffset > 640 && document.documentElement.scrollHeight - window.pageYOffset > 1300) {
        this.showController = true;
      } else {
        this.showController = false;
      }
    } else {
      if (window.pageYOffset > 640 || window.innerHeight > 1720) {
        this.showController = true;
      } else if (window.innerWidth > 1420 && window.pageYOffset > 640) {
        this.showController = true;
      } else {
        this.showController = false;
      }
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
    this.session = this.sessionInfo;
    // initial setting for plots viewer
    this.eventType = 'stim on';
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
  
    /** 
    * Fetch probe information for the session so probe label can be displayed instead of probe index
    * @param sessionInfo primary keys for session
    **/  
    this.cellListService.retrieveProbeInfo(this.sessionInfo).subscribe((probes: Array<any>) => {
      this.probeInfo = probes
    })

    /**
    * Fetch list of available coronal sections for the particular session
    * @param sessionInfo primary keys for session
    **/
    this.cellListService.retrieveCoronalSections(this.sessionInfo)
    this.coronalSectionsSubscription = this.cellListService.getCoronalSectionsLoadedListener()
      .subscribe((coronalSections: Array<Object>) => {
        // once coronal sections come back successfully, store and extract just the probe indexes for rendering
        this.coronalSections = coronalSections;
        for (let section of coronalSections) {
          this.coronalSectionProbeList.push(section['probe_idx'])
        }
      });

    this.cellListService.retrieveCellList(this.sessionInfo);
    this.cellListSubscription = this.cellListService.getCellListLoadedListener()
      .subscribe((cellListData) => {
        if (Object.entries(cellListData).length > 0) {
          this.cells = cellListData;
          this.cellOnFocus = this.cells[2];
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
            }
          }
          this.sortedCellsByProbeIns = this.cellsByProbeIns;

          this.plot_data = [
            {
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
              },
              showlegend: false,
              
            },
            {
              name: 'Good Cluster',
              x: [null],
              y: [null],
              mode: 'markers',
              marker: {
                size: 15,
                color: 'rgba(255, 255, 255, 0.05)',
                line: {
                  color: 'rgba(220, 140, 140, 0.6)',
                  width: 1.7
                }
              },
              showlegend: true,
            },
            {
              name: 'Selected Cluster',
              x: [null],
              y: [null],
              mode: 'markers',
              marker: {
                size: 15,
                color: 'rgba(255, 255, 255, 0.05)',
                line: {
                  color: 'rgba(0, 0, 0, 1)',
                  width: 1.7
                }
              },
              showlegend: true,

            },
            {
              name: 'Bad Cluster',
              x: [null],
              y: [null],
              mode: 'markers',
              marker: {
                size: 15,
                color: 'rgba(255, 255, 255, 0.05)',
                line: {
                  color: 'rgba(0, 0, 0, 0.2)',
                  width: 1.7
                }
              },
              showlegend: false,

            }
          ];

          this.plot_layout = {
            updatemenus: [{
              y: 0.55,
              x: -0.1,
              yanchor: 'top',
              buttons: [{
                method: 'restyle',
                args: ['selected_y', 'cluster_depth'],
                label: 'cluster depth (µm)'
              }, 
              {
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
              y: -0.25,
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
            hovermode: 'closest',
            showlegend: true,
            legend: {orientation: "h"},
            width: '700'

          };


          this.plot_layout_DBR = {
            // updatemenus: [{
            //   y: 0.55,
            //   x: -0.1,
            //   yanchor: 'top',
            //   buttons: [{
            //     method: 'restyle',
            //     args: ['selected_y', 'cluster_depth'],
            //     label: 'cluster depth (µm)'
            //   },  
            //   {
            //     method: 'restyle',
            //     args: ['selected_y', 'cluster_amp'],
            //     label: 'cluster amp (µV)'
            //   }, {
            //     method: 'restyle',
            //     args: ['selected_y', 'firing_rate'],
            //     label: 'firing rate'
            //   }]
            // },{
            //   x: 0.3,
            //   y: -0.25,
            //   direction: 'right',
            //   buttons: [{
            //     method: 'restyle',
            //     args: ['selected_x', 'cluster_amp'],
            //     label: 'cluster amp (µV)'
            //   }, {
            //     method: 'restyle',
            //     args: ['selected_x', 'cluster_depth'],
            //     label: 'cluster depth (µm)'
            //   }, {
            //     method: 'restyle',
            //     args: ['selected_x', 'firing_rate'],
            //     label: 'firing rate'
            //   }]
            // }],
            hovermode: 'closest',
            showlegend: true,
            legend: {orientation: "h"},
            barmode: 'stack', 
            height: '500', 
            width: '730',
            grid: {
              rows: 1,
              columns: 2,
              subplots: [['x1y', 'x2y']]
            },
            xaxis: {
              domain: [0, 0.12],
              anchor: 'x1'
            },
            xaxis2: {
              domain: [0.23, 1],
              anchor: 'x2'
            },

          };
         

          // initially set the navigation plot to show the depth brain region
          
          this.plot_layout_processed = deepCopy(this.plot_layout_DBR);
          /////////////////////////////////////////old way - but still in use /////////////////////////////////////////////////////
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
          // and using the same query info to get the brain regions //
          let probeTrajQueryInfo = {};
          probeTrajQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
          probeTrajQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
          probeTrajQueryInfo['probe_idx'] = this.probeIndex;
          this.cellListService.retrieveProbeTrajectory(probeTrajQueryInfo);
          // this.cellListService.retrieveDepthBrainRegions(probeTrajQueryInfo);
          this.probeTrajectorySubscription = this.cellListService.getProbeTrajectoryLoadedListener()
            .subscribe((probeTraj) => {
              if (probeTraj && probeTraj[0]) {
                // trajectory_source was formerly pulled from data_source table but now from provenance table as provenance_description
                // this.probeTrajInfo['trajectory_source'] = probeTraj[0].insertion_data_source; 
                this.probeTrajInfo['trajectory_source'] = probeTraj[0].provenance_description; // 
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
          this.updateDepthBrainRegionInfo(probeTrajQueryInfo)

          //////////// end of filling probe trajectory and brain region info ////////////////

          /////++++++///// start of grabbing depth PETH plot info /////++++++/////
          this.cellListService.getDepthPethTemplate();
          this.depthPethTemplateSubscription = this.cellListService.getDepthPethTemplateLoadedListener()
            .subscribe((dpTemplates) => {
              // console.log('depth PETH templates retrieved: ', dpTemplates[0]);
              this.depthPethTemplates[dpTemplates[0]['depth_peth_template_idx']] = deepCopy(dpTemplates[0]['depth_peth_template'])
              // console.log('got the depthPETHtemplate - starting timer for depth PETH data')
              this.depthPETHtimeA = new Date()
              this.cellListService.retrieveDepthPethPlot({
                'subject_uuid': this.sessionInfo['subject_uuid'],
                'session_start_time': this.sessionInfo['session_start_time'],
                'probe_idx': this.probeIndex
              });
            });
          for (let event of this.eventList) {
            this.depthPethLookup[event] = {}
          }
          this.depthPethSubscription = this.cellListService.getDepthPethLoadedListener()
            .subscribe((plotInfo) => {
              this.depthPETHtimeB = new Date()
              // console.log('retrieved depth PETH data - took ', this.depthPETHtimeB-this.depthPETHtimeA, 'ms')
              this.depthPETH = deepCopy(plotInfo);
              // console.log('depth PETH retrieved for session: ', plotInfo);
              for (let plot of Object.values(plotInfo)) {
                // console.log("this.depthPethTemplates[plot['depth_peth_template_idx']]: ", this.depthPethTemplates)
                this.depthPethLookup[plot['event']]['data'] = deepCopy(this.depthPethTemplates[plot['depth_peth_template_idx']]['data'])
                this.depthPethLookup[plot['event']]['layout'] = deepCopy(this.depthPethTemplates[plot['depth_peth_template_idx']]['layout'])
                let depth_peth_config_copy = {...this.depthPETH_config};
                depth_peth_config_copy['toImageButtonOptions'] = {
                  filename: `depthPETH_${this.sessionInfo['subject_nickname']}_${plot['event']}`,
                  scale: 1
                }

                this.depthPethLookup[plot['event']]['data'][0]['x'] = [plot['plot_xlim'][0]-0.2, plot['plot_xlim'][0]-0.1]
                this.depthPethLookup[plot['event']]['data'][0]['y'] = [plot['plot_ylim'][0]-0.2]
                this.depthPethLookup[plot['event']]['data'][0]['z'] = plot['z_range']
                this.depthPethLookup[plot['event']]['data'][0]['colorscale'] = plot['color_scale']

                this.depthPethLookup[plot['event']]['layout']['images'][0]['source'] = plot['plotting_data_link']
                this.depthPethLookup[plot['event']]['layout']['images'][0]['sizex'] = plot['plot_xlim'][1] - plot['plot_xlim'][0]
                this.depthPethLookup[plot['event']]['layout']['images'][0]['sizey'] = plot['plot_ylim'][1] - plot['plot_ylim'][0]
                this.depthPethLookup[plot['event']]['layout']['images'][0]['x'] = plot['plot_xlim'][0]
                this.depthPethLookup[plot['event']]['layout']['images'][0]['y'] = plot['plot_ylim'][1]
                this.depthPethLookup[plot['event']]['layout']['xaxis']['range'] = plot['plot_xlim']
                this.depthPethLookup[plot['event']]['layout']['yaxis']['range'] = plot['plot_ylim']
                this.depthPethLookup[plot['event']]['layout']['title']['text'] = `Depth PETH, aligned to ${plot['event']} time`
              
                this.depthPethLookup[plot['event']]['layout']['width'] = this.depthPethTemplates[plot['depth_peth_template_idx']]['layout']['width'] * 0.85;
                this.depthPethLookup[plot['event']]['layout']['height'] = this.depthPethTemplates[plot['depth_peth_template_idx']]['layout']['height'] * 0.85;

                this.depthPethLookup[plot['event']]['config'] = depth_peth_config_copy
              }
              // console.log('this.DepthPethLookup: ', this.depthPethLookup)
              if (this.depthPethLookup['movement'] && Object.keys(this.depthPethLookup['movement']).length == 0) {
                this.depthPethEventLacksMovement = true;
              } else {
                this.depthPethEventLacksMovement = false;
              }
              // console.log('depthPethEventLacksMovement: ', this.depthPethEventLacksMovement);
              this.depthPETHtimeC = new Date()
              // console.log('depth PETH done plotting - took: ', this.depthPETHtimeC-this.depthPETHtimeB, 'ms')
            });


          /////+++++++///// end of grabbing depth PETH plot info /////++++++/////

          //==//==//==//==// Begin quality control plots (acg, sat, waveform) //==//==//==//==//
          const qcPlotsQuery = {
            'subject_uuid': this.sessionInfo['subject_uuid'],
            'session_start_time': this.sessionInfo['session_start_time'],
            'probe_idx': this.probeIndex
          }
          // -- / -- / -- / Spike Amp Time / -- / -- / -- //
          this.cellListService.getSpikeAmpTimeTemplate();
          this.satTemplateSubscription = this.cellListService.getSpikeAmpTimeTemplateLoadedListener()
            .subscribe(satTemplate => {
              this.satTemplate[satTemplate[0]['spike_amp_time_template_idx']] = satTemplate[0]['spike_amp_time_template']
              // console.log('spike amp time template: ', this.satTemplate);
              this.cellListService.retrieveSpikeAmpTimePlot(qcPlotsQuery);
            });

          this.spikeAmpTimeSubscription = this.cellListService.getSpikeAmpTimeLoadedListener()
            .subscribe(spikeAmpTime => {
              this.updateSpikeAmpTimePlot(spikeAmpTime);
            });
          // -- / -- / -- / Autocorrelogram / -- / -- / -- //
          this.cellListService.getAutocorrelogramTemplate();
          this.acgTemplateSubscription = this.cellListService.getACGTemplateLoadedListener()
            .subscribe(acgTemplate => {
              this.acgTemplate[acgTemplate[0]['acg_template_idx']] = acgTemplate[0]['acg_template']
              // console.log('autocorrelogram template: ', this.acgTemplate);
              this.cellListService.retrieveAutocorrelogramPlot(qcPlotsQuery);
            });

          this.acgSubscription = this.cellListService.getACGLoadedListener()
            .subscribe(autocorrelogram => {
              this.updateAutocorrelogramPlot(autocorrelogram);
            });

          // -- / -- / -- / Waveform / -- / -- / -- //
          this.cellListService.getWaveformTemplate();
          this.wfTemplateSubscription = this.cellListService.getWaveformTemplateLoadedListener()
            .subscribe(waveformTemplate => {
              this.wfTemplate[waveformTemplate[0]['waveform_template_idx']] = waveformTemplate[0]['waveform_template']
              // console.log('waveform template: ', this.wfTemplate);
              this.cellListService.retrieveWaveformPlot(qcPlotsQuery);
            });

          this.waveformSubscription = this.cellListService.getWaveformLoadedListener()
            .subscribe(waveform => {
              this.updateWaveformPlot(waveform);
            });

          //==//==//==//==// end quality control plots (acg, sat, waveform) //==//==//==//==//

          // begin grabbing trial depth rasters
          // console.log('about to render depth raster trials')
          this.cellListService.getDepthRasterTemplates();
          this.depthRasterTemplatesSubscription = this.cellListService.getDepthRasterTemplatesLoadedListener()
            .subscribe((drtTemplates) => {
              for (let template of Object.values(drtTemplates)) {
                // console.log('template for depth raster trials', template)
                this.depthRasterTrialTemplates[template['depth_raster_template_idx']] = template['depth_raster_template']
              }
              // console.log('templates for depth rasters trial retrieved: ', drtTemplates);
              
              this.cellListService.retrieveDepthRasterTrialPlot({
                'subject_uuid': this.sessionInfo['subject_uuid'],
                'session_start_time': this.sessionInfo['session_start_time'],
              });

            });
          
          this.depthRasterTrialSubscription = this.cellListService.getDepthRasterTrialLoadedListener()
            .subscribe((plotInfo) => {
              // console.log('plotInfo fetched: ', plotInfo)
              this.depthRasterTrial = deepCopy(plotInfo);
              for (let plot of Object.values(plotInfo)) {
                // == // == [start] setting up lookup for original pattern == // == // == // == //
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
                this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'] = deepCopy(this.depthRasterTrialTemplates[plot['depth_raster_template_idx']]['data']);
                this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout'] = deepCopy(this.depthRasterTrialTemplates[plot['depth_raster_template_idx']]['layout']);
                // == // == [end] setting up lookup for original pattern == // == // == // == //

                // == // == [start] setting up lookup for pattern A == // == // == // == //
                if (!this.depthRasterTrialLookupA[plot['probe_idx']]) {
                  this.depthRasterTrialLookupA[plot['probe_idx']] = {}
                  this.depthRasterTrialLookupA[plot['probe_idx']][plot['trial_type']] = []
                } else if (!this.depthRasterTrialLookupA[plot['probe_idx']][plot['trial_type']]) {
                  this.depthRasterTrialLookupA[plot['probe_idx']][plot['trial_type']] = []
                } 
                this.depthRasterTrialLookupA[plot['probe_idx']][plot['trial_type']].push({});
                
                this.depthRasterTrialLookupA[plot['probe_idx']][plot['trial_type']][this.depthRasterTrialLookupA[plot['probe_idx']][plot['trial_type']].length - 1][plot['trial_contrast']] = {'data': deepCopy(this.depthRasterTrialTemplates[plot['depth_raster_template_idx']]['data']),
                                                                                                                                                                                         'layout':  deepCopy(this.depthRasterTrialTemplates[plot['depth_raster_template_idx']]['layout']),
                                                                                                                                                                                         'trial_id': plot['trial_id']};
                // console.log("this.depthRasterTrialLookupA: ", this.depthRasterTrialLookupA)
                // == // == [end] setting up lookup for pattern A == // == // == // == //

                // == // == [start] setting up lookup for pattern B == // == // == // == //
                if (!this.depthRasterTrialLookupB[plot['probe_idx']]) {
                  this.depthRasterTrialLookupB[plot['probe_idx']] = {}
                  this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']] = {}
                  this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]= []

                  this.depthRasterTrialLookupB[plot['probe_idx']]['All Trial Types'] = {};
                  this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']]['All Trial Contrasts'] = []
                } else if (!this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']]) {
                  this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']] = {}
                  this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]= []
                  this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']]['All Trial Contrasts'] = []
                } else if (!this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]) {
                  this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]= []
                }

                this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']].push({});
                this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']][this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']].length - 1][plot['trial_id']] = {'data': deepCopy(this.depthRasterTrialTemplates[plot['depth_raster_template_idx']]['data']), 
                                                                                                                                                                                                                                        'layout': deepCopy(this.depthRasterTrialTemplates[plot['depth_raster_template_idx']]['layout'])};
                this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']]['All Trial Contrasts'].push({});
                this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']]['All Trial Contrasts'][this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']]['All Trial Contrasts'].length - 1][plot['trial_id']] = {'data': deepCopy(this.depthRasterTrialTemplates[plot['depth_raster_template_idx']]['data']), 
                                                                                                                                                                                                                                        'layout': deepCopy(this.depthRasterTrialTemplates[plot['depth_raster_template_idx']]['layout'])};
                
                
                if (!this.depthRasterTrialLookupB[plot['probe_idx']]['All Trial Types']['All Trial Contrasts']) {
                  this.depthRasterTrialLookupB[plot['probe_idx']]['All Trial Types']['All Trial Contrasts'] = [];

                }
                this.depthRasterTrialLookupB[plot['probe_idx']]['All Trial Types']['All Trial Contrasts'].push({});
                this.depthRasterTrialLookupB[plot['probe_idx']]['All Trial Types']['All Trial Contrasts'][this.depthRasterTrialLookupB[plot['probe_idx']]['All Trial Types']['All Trial Contrasts'].length - 1][plot['trial_id']] = {'data': deepCopy(this.depthRasterTrialTemplates[plot['depth_raster_template_idx']]['data']), 
                                                                                                                                                            'layout': deepCopy(this.depthRasterTrialTemplates[plot['depth_raster_template_idx']]['layout'])};
                if (!this.depthRasterTrialLookupB[plot['probe_idx']]['All Trial Types'][plot['trial_contrast']]) {
                  this.depthRasterTrialLookupB[plot['probe_idx']]['All Trial Types'][plot['trial_contrast']] = [];
                }    
                this.depthRasterTrialLookupB[plot['probe_idx']]['All Trial Types'][plot['trial_contrast']].push({});
                this.depthRasterTrialLookupB[plot['probe_idx']]['All Trial Types'][plot['trial_contrast']][this.depthRasterTrialLookupB[plot['probe_idx']]['All Trial Types'][plot['trial_contrast']].length - 1][plot['trial_id']] = {'data': deepCopy(this.depthRasterTrialTemplates[plot['depth_raster_template_idx']]['data']), 
                                                                                                                                                            'layout': deepCopy(this.depthRasterTrialTemplates[plot['depth_raster_template_idx']]['layout'])};                   
                
                // == // == [end] setting up lookup for pattern B == // == // == // == //


                if (plot['depth_raster_template_idx'] == 1) { // should be 1 all the time for trial depth rasters
                  // == // == // [start] filling in for original lookup // == // == // == // == //
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][0]['x'] = plot['plot_xlim'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][0]['y'] = plot['plot_ylim'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][1]['x'] = [plot['trial_stim_on'], plot['trial_stim_on']];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][1]['y'] = plot['plot_ylim'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][2]['x'] = [plot['trial_movement'], plot['trial_movement']];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][2]['y'] = plot['plot_ylim'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][3]['x'] = [plot['trial_feedback'], plot['trial_feedback']];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][3]['y'] = plot['plot_ylim'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][4]['x'] = [plot['trial_stim_off'], plot['trial_stim_off']];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data'][4]['y'] = plot['plot_ylim'];
                  // adding trial_id to plot info even though it won't get plotted;
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['data']['customdata'] = plot['trial_id'];
                  
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout']['xaxis']['range'] = plot['plot_xlim'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout']['yaxis']['range'] = plot['plot_ylim'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout']['title']['text'] = plot['plot_title'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout']['images'][0]['source'] =  plot['plotting_data_link'];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout']['images'][0]['sizex'] = plot['plot_xlim'][1] - plot['plot_xlim'][0];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout']['images'][0]['sizey'] = plot['plot_ylim'][1] - plot['plot_ylim'][0];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout']['images'][0]['x'] = plot['plot_xlim'][0];
                  this.depthRasterTrialLookup[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]['layout']['images'][0]['y'] = plot['plot_ylim'][1];
                  // == // == // [end] filling in for original lookup // == // == // == // == //

                  // == // == // [start] filling in for lookup pattern [A] // == // == // == // == //
                  for (let toPlot of this.depthRasterTrialLookupA[plot['probe_idx']][plot['trial_type']]) {
                    // console.log('toPlot A: ', toPlot);
                    // console.log('plot[trial_contrast]: ', plot['trial_contrast'])
                    if (toPlot[plot['trial_contrast']] && toPlot[plot['trial_contrast']]['trial_id'] == plot['trial_id']) {
                      // console.log('toPlot - trial_id: ', toPlot[plot['trial_contrast']]['trial_id']);
                      toPlot[plot['trial_contrast']]['data'][0]['x'] = plot['plot_xlim'];
                      toPlot[plot['trial_contrast']]['data'][0]['y'] = plot['plot_ylim'];
                      toPlot[plot['trial_contrast']]['data'][1]['x'] = [plot['trial_stim_on'], plot['trial_stim_on']];
                      toPlot[plot['trial_contrast']]['data'][1]['y'] = plot['plot_ylim'];
                      toPlot[plot['trial_contrast']]['data'][2]['x'] = [plot['trial_movement'], plot['trial_movement']];
                      toPlot[plot['trial_contrast']]['data'][2]['y'] = plot['plot_ylim'];
                      toPlot[plot['trial_contrast']]['data'][3]['x'] = [plot['trial_feedback'], plot['trial_feedback']];
                      toPlot[plot['trial_contrast']]['data'][3]['y'] = plot['plot_ylim'];
                      toPlot[plot['trial_contrast']]['data'][4]['x'] = [plot['trial_stim_off'], plot['trial_stim_off']];
                      toPlot[plot['trial_contrast']]['data'][4]['y'] = plot['plot_ylim'];
                      
                      toPlot[plot['trial_contrast']]['layout']['xaxis']['range'] = plot['plot_xlim'];
                      toPlot[plot['trial_contrast']]['layout']['yaxis']['range'] = plot['plot_ylim'];
                      toPlot[plot['trial_contrast']]['layout']['title']['text'] = plot['plot_title'];
                      toPlot[plot['trial_contrast']]['layout']['images'][0]['source'] =  plot['plotting_data_link'];
                      toPlot[plot['trial_contrast']]['layout']['images'][0]['sizex'] = plot['plot_xlim'][1] - plot['plot_xlim'][0];
                      toPlot[plot['trial_contrast']]['layout']['images'][0]['sizey'] = plot['plot_ylim'][1] - plot['plot_ylim'][0];
                      toPlot[plot['trial_contrast']]['layout']['images'][0]['x'] = plot['plot_xlim'][0];
                      toPlot[plot['trial_contrast']]['layout']['images'][0]['y'] = plot['plot_ylim'][1];
                    }
                  }
                  // console.log('depthRasterTrialLookup A filled: ', this.depthRasterTrialLookupA)
                  // == // == // [end] filling in for lookup pattern [A] // == // == // == // == //

                  // == // == // [start] filling in for lookup pattern [B] // == // == // == // == //
                  for (let toPlotB of this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']][plot['trial_contrast']]) {
                    if (Number(Object.keys(toPlotB)[0]) == plot['trial_id']) {
                      toPlotB[plot['trial_id']]['data'][0]['x'] = plot['plot_xlim'];
                      toPlotB[plot['trial_id']]['data'][0]['y'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['data'][1]['x'] = [plot['trial_stim_on'], plot['trial_stim_on']];
                      toPlotB[plot['trial_id']]['data'][1]['y'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['data'][2]['x'] = [plot['trial_movement'], plot['trial_movement']];
                      toPlotB[plot['trial_id']]['data'][2]['y'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['data'][3]['x'] = [plot['trial_feedback'], plot['trial_feedback']];
                      toPlotB[plot['trial_id']]['data'][3]['y'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['data'][4]['x'] = [plot['trial_stim_off'], plot['trial_stim_off']];
                      toPlotB[plot['trial_id']]['data'][4]['y'] = plot['plot_ylim'];
                      
                      toPlotB[plot['trial_id']]['layout']['xaxis']['range'] = plot['plot_xlim'];
                      toPlotB[plot['trial_id']]['layout']['yaxis']['range'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['layout']['title']['text'] = plot['plot_title'];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['source'] =  plot['plotting_data_link'];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['sizex'] = plot['plot_xlim'][1] - plot['plot_xlim'][0];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['sizey'] = plot['plot_ylim'][1] - plot['plot_ylim'][0];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['x'] = plot['plot_xlim'][0];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['y'] = plot['plot_ylim'][1];
                    }
                  }
                  for (let toPlotB of this.depthRasterTrialLookupB[plot['probe_idx']][plot['trial_type']]['All Trial Contrasts']) {
                    if (Number(Object.keys(toPlotB)[0]) == plot['trial_id']) {
                      toPlotB[plot['trial_id']]['data'][0]['x'] = plot['plot_xlim'];
                      toPlotB[plot['trial_id']]['data'][0]['y'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['data'][1]['x'] = [plot['trial_stim_on'], plot['trial_stim_on']];
                      toPlotB[plot['trial_id']]['data'][1]['y'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['data'][2]['x'] = [plot['trial_movement'], plot['trial_movement']];
                      toPlotB[plot['trial_id']]['data'][2]['y'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['data'][3]['x'] = [plot['trial_feedback'], plot['trial_feedback']];
                      toPlotB[plot['trial_id']]['data'][3]['y'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['data'][4]['x'] = [plot['trial_stim_off'], plot['trial_stim_off']];
                      toPlotB[plot['trial_id']]['data'][4]['y'] = plot['plot_ylim'];
                      
                      toPlotB[plot['trial_id']]['layout']['xaxis']['range'] = plot['plot_xlim'];
                      toPlotB[plot['trial_id']]['layout']['yaxis']['range'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['layout']['title']['text'] = plot['plot_title'];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['source'] =  plot['plotting_data_link'];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['sizex'] = plot['plot_xlim'][1] - plot['plot_xlim'][0];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['sizey'] = plot['plot_ylim'][1] - plot['plot_ylim'][0];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['x'] = plot['plot_xlim'][0];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['y'] = plot['plot_ylim'][1];
                    }
                  }
                  for (let toPlotB of this.depthRasterTrialLookupB[plot['probe_idx']]['All Trial Types'][plot['trial_contrast']]) {
                    if (Number(Object.keys(toPlotB)[0]) == plot['trial_id']) {
                      toPlotB[plot['trial_id']]['data'][0]['x'] = plot['plot_xlim'];
                      toPlotB[plot['trial_id']]['data'][0]['y'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['data'][1]['x'] = [plot['trial_stim_on'], plot['trial_stim_on']];
                      toPlotB[plot['trial_id']]['data'][1]['y'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['data'][2]['x'] = [plot['trial_movement'], plot['trial_movement']];
                      toPlotB[plot['trial_id']]['data'][2]['y'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['data'][3]['x'] = [plot['trial_feedback'], plot['trial_feedback']];
                      toPlotB[plot['trial_id']]['data'][3]['y'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['data'][4]['x'] = [plot['trial_stim_off'], plot['trial_stim_off']];
                      toPlotB[plot['trial_id']]['data'][4]['y'] = plot['plot_ylim'];
                      
                      toPlotB[plot['trial_id']]['layout']['xaxis']['range'] = plot['plot_xlim'];
                      toPlotB[plot['trial_id']]['layout']['yaxis']['range'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['layout']['title']['text'] = plot['plot_title'];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['source'] =  plot['plotting_data_link'];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['sizex'] = plot['plot_xlim'][1] - plot['plot_xlim'][0];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['sizey'] = plot['plot_ylim'][1] - plot['plot_ylim'][0];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['x'] = plot['plot_xlim'][0];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['y'] = plot['plot_ylim'][1];
                    }
                  }
                  for (let toPlotB of this.depthRasterTrialLookupB[plot['probe_idx']]['All Trial Types']['All Trial Contrasts']) {
                    if (Number(Object.keys(toPlotB)[0]) == plot['trial_id']) {
                      toPlotB[plot['trial_id']]['data'][0]['x'] = plot['plot_xlim'];
                      toPlotB[plot['trial_id']]['data'][0]['y'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['data'][1]['x'] = [plot['trial_stim_on'], plot['trial_stim_on']];
                      toPlotB[plot['trial_id']]['data'][1]['y'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['data'][2]['x'] = [plot['trial_movement'], plot['trial_movement']];
                      toPlotB[plot['trial_id']]['data'][2]['y'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['data'][3]['x'] = [plot['trial_feedback'], plot['trial_feedback']];
                      toPlotB[plot['trial_id']]['data'][3]['y'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['data'][4]['x'] = [plot['trial_stim_off'], plot['trial_stim_off']];
                      toPlotB[plot['trial_id']]['data'][4]['y'] = plot['plot_ylim'];
                      
                      toPlotB[plot['trial_id']]['layout']['xaxis']['range'] = plot['plot_xlim'];
                      toPlotB[plot['trial_id']]['layout']['yaxis']['range'] = plot['plot_ylim'];
                      toPlotB[plot['trial_id']]['layout']['title']['text'] = plot['plot_title'];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['source'] =  plot['plotting_data_link'];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['sizex'] = plot['plot_xlim'][1] - plot['plot_xlim'][0];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['sizey'] = plot['plot_ylim'][1] - plot['plot_ylim'][0];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['x'] = plot['plot_xlim'][0];
                      toPlotB[plot['trial_id']]['layout']['images'][0]['y'] = plot['plot_ylim'][1];
                    }
                  }
                  
                  // == // == // [end] filling in for lookup pattern [B] // == // == // == // == //
                
                } else {
                  console.error('trying to build depth raster trial plot with full driftmap template')
                }
              }
              // console.log("this.depthRasterTrialLookupB after complete fill-in: ", this.depthRasterTrialLookupB)
              this.sliderDepthRasterTrialLookup = deepCopy(this.depthRasterTrialLookup);
              this.sliderDepthRasterTrialLookupA = deepCopy(this.depthRasterTrialLookupA);
              this.sliderDepthRasterTrialLookupB = deepCopy(this.depthRasterTrialLookupB);
           
              // let trialTypeKeys = ['Correct Left Contrast', 'Correct Right Contrast', 'Incorrect Left Contrast', 'Incorrect Right Contrast', 'Correct All',]; // probably should fetch from the PlottingEphys.TrialType table
              let trialTypeKeys = ['Correct Left Contrast', 'Correct Right Contrast', 'Incorrect Left Contrast', 'Incorrect Right Contrast', 'Correct All', 'All Trial Types'];
              for (let probe of this.probeIndices) {
                for (let trialType of trialTypeKeys) {
                  // console.log('!!!!!!!!!!!!!', trialType.toUpperCase(), '!!!!!!!!!!!')
                  if (this.depthRasterTrialLookupB[probe] && this.depthRasterTrialLookupB[probe][trialType]) {
                    // console.log('this.depthRasterTrialLookupB[probe][trialType]: ', this.depthRasterTrialLookupB[probe][trialType])
                    this.slidersSettingA[trialType] = [];
                    this.slidersSettingB[trialType] = [];
                    this.slidersSetting[trialType] = [];

                    // uses the old lookup without the all trial types//
                    let contrastKeys;
                    if (trialType !== 'All Trial Types') {
                      this.contrastMinLookup[trialType] = Math.min(...Object.keys(this.depthRasterTrialLookup[probe][trialType]).map(Number)); // getting the lowest number of contrasts for initial display
                      contrastKeys = (Object.keys(this.depthRasterTrialLookup[probe][trialType]).map(Number)).sort((a,b) => a-b);

                    } else {
                      contrastKeys = Object.keys(this.depthRasterTrialLookupB[probe][trialType]).filter(eachContrast=> {
                        if (Number(eachContrast) || eachContrast == '0') {
                          return eachContrast; // return Number(eachContrast) ?
                        }
                      });
                      contrastKeys = contrastKeys.map(Number)
                      this.contrastMinLookup[trialType] = Math.min(...contrastKeys)
                      contrastKeys = contrastKeys.map(Number).sort((a,b) => a-b);
                    }
                    contrastKeys.push('All Trial Contrasts')
                    
                    
                    // console.log('new contrast Keys: ', contrastKeys)
                    // pattern A - assuming one sample trial raster for a trial contrast, all trial raster plots shoved into trial type - ordered by trial contrast
                    // let contrastKeysA = []
                    // for (let plotByTrialType of this.depthRasterTrialLookupA[probe][trialType]) {
                    //   contrastKeysA.push(Object.keys(plotByTrialType)[0])
                    // }
                    // this.contrastMinLookupA[trialType] = Math.min(...contrastKeysA.map(Number)); // getting the lowest number of contrasts for initial display
                    // contrastKeysA = (contrastKeysA).map(Number).sort((a,b) => a-b);
            
                    // pattern B - assuming there are multiple trial rasters for a trial contrast, each contrast will have many trial rasters - ordered by trial id
                    // this.contrastMinLookupB[trialType] = Math.min(...Object.keys(this.depthRasterTrialLookupB[probe][trialType]).map(Number)); // getting the lowest number of contrasts for initial display
                    // let contrastKeysB = (Object.keys(this.depthRasterTrialLookupB[probe][trialType]).map(Number)).sort((a,b) => a-b);

                    for (let trialContrast of contrastKeys) {
                      // //+*+*+*+*+*+*+*+*+*+// Sliding by trial IDs - (A) way in for now with single trial to show per contrast -- [START] //+*+*+*+*+*+*+*+*+*+*+//
                      // // fillup the sliders setting first, then re-add later
                      // if (!this.slidersSettingA[trialType][0]) {
                      //   this.slidersSettingA[trialType] = [{
                      //     pad: {t: 55},
                      //     currentvalue: {
                      //       xanchor: 'left',
                      //       prefix: 'Contrast [Trial ID]: ',
                      //       font: {
                      //         size: 14
                      //       }
                      //     }
                      //   }]
                      // }
                      // if (this.slidersSettingA[trialType][0]['steps'] && this.slidersSettingA[trialType][0]['steps'].length > 0) {
                      //   //sliders steps have already started to fill up
                      //   this.slidersSettingA[trialType][0]['steps'].push({
                      //     label: `${trialContrast} [${this.depthRasterTrialLookup[probe][trialType][trialContrast]['data']['customdata']}]`,
                      //     // label: this.depthRasterTrialLookup[probe][trialType][trialContrast]['data']['customdata'],
                      //     value: trialContrast,
                      //     // value: this.depthRasterTrialLookup[probe][trialType][trialContrast]['data']['customdata'],
                      //     method: 'update',
                      //     args: [deepCopy(this.depthRasterTrialLookup[probe][trialType][trialContrast]['data']), deepCopy(this.depthRasterTrialLookup[probe][trialType][trialContrast]['layout'])]
                      //   })

                      // } else {
                      //   // sliders steps have not been initiated yet
                      //   this.slidersSettingA[trialType][0]['steps'] = []
                      //   this.slidersSettingA[trialType][0]['steps'].push({
                      //     label: `${trialContrast} [${this.depthRasterTrialLookup[probe][trialType][trialContrast]['data']['customdata']}]`,
                      //     // label: this.depthRasterTrialLookup[probe][trialType][trialContrast]['data']['customdata'],
                      //     value: trialContrast,
                      //     // value: this.depthRasterTrialLookup[probe][trialType][trialContrast]['data']['customdata'],
                      //     method: 'update',
                      //     args: [deepCopy(this.depthRasterTrialLookup[probe][trialType][trialContrast]['data']), deepCopy(this.depthRasterTrialLookup[probe][trialType][trialContrast]['layout'])]

                      //   })
                      // }
                      
                      //+*+*+*+*+*+*++ Sliding by trial IDs - (A) way in for now with single trial to show per contrast -- [END] +*+*+*+*+*+*+*+*+//

                      ///////////// Sliding by trial IDs - (B) way in the future with multiple trials to show per contrast -- [START] //////////////
                      // first making container for the sliderDepthRaster Trial Lookup pattern B
                      // console.log('*** For Type: ', trialType, '***** Contrast: ', trialContrast, ' ***')
                      for (let eachTrial of this.depthRasterTrialLookupB[probe][trialType][trialContrast]) {
                        let trialID = Object.keys(eachTrial)[0]
                        if (this.sliderDepthRasterTrialLookupB[probe][trialType][trialContrast]['data']) {
                          this.sliderDepthRasterTrialLookupB[probe][trialType][trialContrast] = {};
                        }
                        this.sliderDepthRasterTrialLookupB[probe][trialType][trialContrast][trialID] = deepCopy(eachTrial[trialID])
                      }
                      
                      // fillup the sliders setting first, then readd later
                      if (!this.slidersSettingB[trialType]) {
                        this.slidersSettingB[trialType] = {trialContrast: []}
                      }
                      if (!this.slidersSettingB[trialType][trialContrast] || !this.slidersSettingB[trialType][trialContrast][0]) {
                        this.slidersSettingB[trialType][trialContrast] = [{
                          pad: {t: 55},
                          currentvalue: {
                            xanchor: 'left',
                            prefix: 'Trial ID: ',
                            font: {
                              size: 14
                            }
                          }
                        }]
                      }

                      // console.log('byTrialID in LookupB: ', this.depthRasterTrialLookupB[probe][trialType][trialContrast]) // array that has {51(trial_id): {data:{(filled)}, layout: {(filled)}}}
                      // console.log('byTrialID in LookupB length: ', this.depthRasterTrialLookupB[probe][trialType][trialContrast].length) // 1 for every setup at the moment - expected to increase
                      this.depthRasterTrialLookupB[probe][trialType][trialContrast].map(plot => {
                        // console.log('Object.keys(plot)[0]: ', Object.keys(plot)[0]) // trial ID
                        // console.log('Object.values(plot)[0]: ', Object.values(plot)[0]) // plot obj with data&layout
                        if (this.slidersSettingB[trialType][trialContrast][0]['steps'] && this.slidersSettingB[trialType][trialContrast][0]['steps'].length > 0) {
                          //sliders steps have already started to fill up
                          this.slidersSettingB[trialType][trialContrast][0]['steps'].push({
                            label: Object.keys(plot)[0],
                            value: trialContrast,
                            method: 'update',
                            args: [deepCopy(Object.values(plot)[0]['data']), deepCopy(Object.values(plot)[0]['layout'])]
                          })
                        
                        } else {
                          // sliders steps have not been initiated yet
                          this.slidersSettingB[trialType][trialContrast][0]['steps'] = []
                          this.slidersSettingB[trialType][trialContrast][0]['steps'].push({
                            label: Object.keys(plot)[0],
                            value: trialContrast,
                            method: 'update',
                            args: [deepCopy(Object.values(plot)[0]['data']), deepCopy(Object.values(plot)[0]['layout'])]
                          })
                    
                        }
                      })

                      /////////////// Sliding by trial IDs - (B) way in the future with multiple trials to show per contrast -- [END] ///////////////////

                      //==//==//==//== Sliding by trial contrasts - OLD way -- [START] //==//==//==//==//==//==//==//==//
                    
                      // // fillup the sliders setting first, then re-add later
                      // if (!this.slidersSetting[trialType][0]) {
                      //   this.slidersSetting[trialType] = [{
                      //     pad: {t: 55},
                      //     currentvalue: {
                      //       xanchor: 'right',
                      //       prefix: 'Trial Contrast: ',
                      //       font: {
                      //         color: '#ffffff',
                      //         size: 0
                      //       }
                      //     }
                      //   }]
                      // }
                      // if (this.slidersSetting[trialType][0]['steps'] && this.slidersSetting[trialType][0]['steps'].length > 0) {
                      //   //sliders steps have already started to fill up
                      //   this.slidersSetting[trialType][0]['steps'].push({
                      //     label: trialContrast,
                      //     value: this.depthRasterTrialLookup[probe][trialType][trialContrast]['data']['customdata'],
                      //     method: 'update',
                      //     args: [deepCopy(this.depthRasterTrialLookup[probe][trialType][trialContrast]['data']), deepCopy(this.depthRasterTrialLookup[probe][trialType][trialContrast]['layout'])]
                      //   })

                      // } else {
                      //   // sliders steps have not been initiated yet
                      //   this.slidersSetting[trialType][0]['steps'] = []
                      //   this.slidersSetting[trialType][0]['steps'].push({
                      //     label: trialContrast,
                      //     value: this.depthRasterTrialLookup[probe][trialType][trialContrast]['data']['customdata'],
                      //     method: 'update',
                      //     args: [deepCopy(this.depthRasterTrialLookup[probe][trialType][trialContrast]['data']), deepCopy(this.depthRasterTrialLookup[probe][trialType][trialContrast]['layout'])]

                      //   })
                      // }
                        

                      
                      //==//==//==//==/==// Sliding by trial contrasts - OLD way -- [END] //==//==//==//==//==//==//==//

                    }
                    // now fill in the sliders setup to each of the contrast key type plot 
                    // console.log('setup sliders setting - should be all filled up - ', this.slidersSetting);
                    for (let trialContrast of contrastKeys) {
                      // this.sliderDepthRasterTrialLookup[probe][trialType][trialContrast]['layout']['sliders'] = this.slidersSetting[trialType];
                      // this.sliderDepthRasterTrialLookup[probe][trialType][trialContrast]['layout']['sliders'] = this.slidersSettingA[trialType];
                      
                      for (let eachTrial of this.depthRasterTrialLookupB[probe][trialType][trialContrast]) {
                        let eachTrialID = Object.keys(eachTrial)[0];
                        // console.log('eachTrial: ', eachTrial)
                        // console.log('trial ID per contast in lookup B: ', eachTrialID);
                        // console.log('trialContrast: ', trialContrast, '\ntrialType: ', trialType, '\nprobe: ', probe)
                        this.sliderDepthRasterTrialLookupB[probe][trialType][trialContrast][eachTrialID]['layout']['sliders'] = this.slidersSettingB[trialType][trialContrast];
                      }

                    }
                  }
                  // console.log("..............[END]..............")
                }
              }
              // console.log('slidersSettingA: ', this.slidersSettingA);
              // console.log('$$$$$$ sliderSettingB: ', this.slidersSettingB)
              // console.log('sliderDepthTrialLookupB: ', this.sliderDepthRasterTrialLookupB)
              // console.log('this.contrastMinLookup: ', this.contrastMinLookup)


              // set initial plot to render on page
              this.selectedTrialContrast = this.contrastMinLookup[this.selectedTrialType];
              if (this.depthRasterTrialLookup[this.probeIndex]) {
                this.featuredTrialId = this.depthRasterTrialLookup[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast]['data']['customdata']
                this.availableTrialContrasts = Object.keys(this.depthRasterTrialLookup[this.probeIndex][this.selectedTrialType]).map(Number).sort((a,b) => a-b);

              }
              if (this.depthRasterTrialLookupB[this.probeIndex]) {
                this.featuredTrialIdB = Object.keys(this.depthRasterTrialLookupB[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast][0]).map(Number).sort((a,b) => a-b)[0]
              }
              this.availableTrialContrasts.push('All Trial Contrasts')
              // console.log('availableTrialContrasts: ', this.availableTrialContrasts);
              // console.log('sliderDepthTrialLookup: ', this.sliderDepthRasterTrialLookup)
              // console.log('featuredTiralIdB: ', this.featuredTrialIdB)
              // console.log('sliderDepthTrialLookup object keys: ', Object.keys(this.sliderDepthRasterTrialLookup[this.probeIndex][this.selectedTrialType]))
              // console.log("###sliderDepthRasterTrialLookupB[probeIndex][selectedTrialType][selectedTrialContrast][featuredTrialId]: ", this.sliderDepthRasterTrialLookupB[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast][this.featuredTrialId])

            }); 
            
            
        }
      });
  }

  // *****************
  // End of ngOnInit
  // *****************


  ngDoCheck() {
    // console.log('do check ran');
    // console.log('this.clicked cluster id: ', this.clickedClusterId);
    const markerColors = [];
    if (this.plot_data_processed && this.plot_data_processed[0]) {
     /// new with the added brain depth region color plot
      if (this.plot_data_processed && this.plot_data_processed[this.plot_data_processed.length - 4]) {
        if (this.plot_data_processed[this.plot_data_processed.length - 4]['x'] && this.clickedClusterIndex > -1) {
          for (let i = 0; i < this.plot_data_processed[this.plot_data_processed.length - 4]['x'].length; i++) {
            // console.log('clicked cluster id is: ', this.clickedClusterId, '--- on round i: ', i)
            if (this.clickedClusterId === i) {
              markerColors.push('rgba(0, 0, 0, 1)'); // black
            } else {
              
              if (this.plot_data_processed[this.plot_data_processed.length - 4]['customdata.is_good_cluster'] && this.plot_data_processed[this.plot_data_processed.length - 4]['customdata.is_good_cluster'][i]) {
                markerColors.push('rgba(220, 140, 140, 0.4)'); // regular red
              } else if (this.plot_data_processed[this.plot_data_processed.length - 4]['customdata.is_good_cluster']) {
                markerColors.push('rgba(0, 0, 0, 0.2)'); // gray
              } else {
                markerColors.push('rgba(220, 140, 140, 0.4)'); // regular red
              }
            }
          }
        } else {
          for (let i = 0; i < this.plot_data_processed[this.plot_data_processed.length - 4]['x'].length; i++) {
            if (this.plot_data_processed[this.plot_data_processed.length - 4]['customdata.is_good_cluster'] && this.plot_data_processed[this.plot_data_processed.length - 4]['customdata.is_good_cluster'][i]) {
              markerColors.push('rgba(220, 140, 140, 0.4)'); // regular red
            } else if (this.plot_data[0]['customdata.is_good_cluster']) {
              markerColors.push('rgba(0, 0, 0, 0.2)'); // gray
            } else {
              markerColors.push('rgba(220, 140, 140, 0.4)'); // regular red
            }
          }
        }
        this.plot_data_processed[this.plot_data_processed.length - 4]['marker']['line']['color'] = markerColors;
        // console.log('marker colors; ', markerColors)
      }
    } else {
      if (this.plot_data && this.plot_data[0]) {
        if (this.plot_data[0]['x'] && this.clickedClusterIndex > -1) {
          for (let i = 0; i < this.plot_data[0]['x'].length; i++) {
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
    if (this.depthRasterTemplatesSubscription) {
      this.depthRasterTemplatesSubscription.unsubscribe();
    }
    if (this.depthPethTemplateSubscription) {
      this.depthPethTemplateSubscription.unsubscribe();
    }
    if (this.satTemplateSubscription) {
      this.satTemplateSubscription.unsubscribe();
    }
    if (this.acgTemplateSubscription) {
      this.acgTemplateSubscription.unsubscribe();
    }
    if (this.wfTemplateSubscription) {
      this.wfTemplateSubscription.unsubscribe();
    }
    if (this.fullRasterSubscription) {
      this.fullRasterSubscription.unsubscribe();
    }
    if (this.fullPSTHSubscription) {
      this.fullPSTHSubscription.unsubscribe();
    }
    if (this.fullRasterPSTHSubscription) {
      this.fullRasterPSTHSubscription.unsubscribe();
    }
  }


  // loadSpinningBrain(probeInsNum=0) {
  //   console.log('attempting to load spinning brain super gif for probe insertion: ', probeInsNum)
  //   let brainImage = this.brain_gif.nativeElement
  //   this.spinningBrain = new SuperGif(brainImage, {autoPlay: true, maxWidth: 360})
  //   this.spinningBrain.load(() => {
  //     console.log('spinning brain in SuperGIF mode should now be loaded...')
  //   })
  // }


  probe_selected(probeInsNum) {
    // this.loadSpinningBrain(probeInsNum)
    // console.log('probe change requested - ', probeInsNum)
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

    

    // requesting probe trajectory for selected probe 
    let probeTrajQueryInfo = {};
    probeTrajQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    probeTrajQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    probeTrajQueryInfo['probe_idx'] = this.probeIndex;
    this.cellListService.retrieveProbeTrajectory(probeTrajQueryInfo);
    this.probeTrajectorySubscription = this.cellListService.getProbeTrajectoryLoadedListener()
      .subscribe((probeTraj) => {
        this.probeTrajInfo = {};
        if (probeTraj && probeTraj[0]) {
          // this.probeTrajInfo['trajectory_source'] = probeTraj[0].insertion_data_source;
          this.probeTrajInfo['trajectory_source'] = probeTraj[0].provenance_description;
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
          // console.log('probeTrajInfo2: ', this.probeTrajInfo)
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
      }
    }
    // console.log(`data by probe index(${this.probeIndex}): `, this.cellsByProbeIns);
    this.sortedCellsByProbeIns = this.cellsByProbeIns;

    this.plot_data = [
      {
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
        },
        showlegend: false,
      },
      {
        name: 'Good Cluster',
        x: [null],
        y: [null],
        mode: 'markers',
        marker: {
          size: 15,
          color: 'rgba(255, 255, 255, 0.05)',
          line: {
            color: 'rgba(220, 140, 140, 0.6)',
            width: 1.7
          }
        },
        showlegend: true,
      },
      {
        name: 'Selected Cluster',
        x: [null],
        y: [null],
        mode: 'markers',
        marker: {
          size: 15,
          color: 'rgba(255, 255, 255, 0.05)',
          line: {
            color: 'rgba(0, 0, 0, 1)',
            width: 1.7
          }
        },
        showlegend: true,

      },
      {
        name: 'Bad Cluster',
        x: [null],
        y: [null],
        mode: 'markers',
        marker: {
          size: 15,
          color: 'rgba(255, 255, 255, 0.05)',
          line: {
            color: 'rgba(0, 0, 0, 0.2)',
            width: 1.7
          }
        },
        showlegend: false,

      }
    ];

    this.clickedClusterId = 0;
    this.order_by_event(this.eventType);

    if (this.selectedGoodFilter) {
      this.gcfilter_selected(this.selectedGoodFilter);
      this.plot_data[3]['showlegend'] = true;
    } else {
      this.plot_data[3]['showlegend'] = false;
    }

    this.updateDepthBrainRegionInfo(probeTrajQueryInfo)

    // reorganizing depth PETH plot view
    this.cellListService.retrieveDepthPethPlot({
      'subject_uuid': this.sessionInfo['subject_uuid'],
      'session_start_time': this.sessionInfo['session_start_time'],
      'probe_idx': this.probeIndex
    });

    for (let event of this.eventList) {
      this.depthPethLookup[event] = {data: [], layout: {}, config: {}}
    }
    // console.log('fetching depthPETH with this probe_idx', this.probeIndex)
    // console.log('depthPETHlookup (should be empty): ', this.depthPethLookup);
    this.depthPethSubscription = this.cellListService.getDepthPethLoadedListener()
      .subscribe((plotInfo) => {
        // console.log('depthPETH retrieved: ', plotInfo)
        this.depthPETH = deepCopy(plotInfo);
        for (let plot of Object.values(plotInfo)) {
          this.depthPethLookup[plot['event']]['data'] = deepCopy(this.depthPethTemplates[plot['depth_peth_template_idx']]['data'])
          this.depthPethLookup[plot['event']]['layout'] = deepCopy(this.depthPethTemplates[plot['depth_peth_template_idx']]['layout'])
          let depth_peth_config_copy = {...this.depthPETH_config};
          depth_peth_config_copy['toImageButtonOptions'] = {
            filename: `depthPETH_${this.sessionInfo['subject_nickname']}_${plot['event']}`,
            scale: 1
          }
    
          this.depthPethLookup[plot['event']]['data'][0]['x'] = [plot['plot_xlim'][0]-0.2, plot['plot_xlim'][0]-0.1]
          this.depthPethLookup[plot['event']]['data'][0]['y'] = [plot['plot_ylim'][0]-0.2]
          this.depthPethLookup[plot['event']]['data'][0]['z'] = plot['z_range']
          this.depthPethLookup[plot['event']]['data'][0]['colorscale'] = plot['color_scale']
    
          this.depthPethLookup[plot['event']]['layout']['images'][0]['source'] = plot['plotting_data_link']
          this.depthPethLookup[plot['event']]['layout']['images'][0]['sizex'] = plot['plot_xlim'][1] - plot['plot_xlim'][0]
          this.depthPethLookup[plot['event']]['layout']['images'][0]['sizey'] = plot['plot_ylim'][1] - plot['plot_ylim'][0]
          this.depthPethLookup[plot['event']]['layout']['images'][0]['x'] = plot['plot_xlim'][0]
          this.depthPethLookup[plot['event']]['layout']['images'][0]['y'] = plot['plot_ylim'][1]
          this.depthPethLookup[plot['event']]['layout']['xaxis']['range'] = plot['plot_xlim']
          this.depthPethLookup[plot['event']]['layout']['yaxis']['range'] = plot['plot_ylim']
          this.depthPethLookup[plot['event']]['layout']['title']['text'] = `Depth PETH, aligned to ${plot['event']} time`
        
          this.depthPethLookup[plot['event']]['layout']['width'] = this.depthPethTemplates[plot['depth_peth_template_idx']]['layout']['width'] * 0.85;
          this.depthPethLookup[plot['event']]['layout']['height'] = this.depthPethTemplates[plot['depth_peth_template_idx']]['layout']['height'] * 0.85;

          this.depthPethLookup[plot['event']]['config'] = depth_peth_config_copy
        }
        // console.log('this.DepthPethLookup: ', this.depthPethLookup)
        if (this.depthPethLookup['movement']['data'].length == 0) {
          this.depthPethEventLacksMovement = true;
        } else {
          this.depthPethEventLacksMovement = false;
        }
        // console.log('depthPethEventLacksMovement: ', this.depthPethEventLacksMovement);
      });
    


    // updating quality control plots - reuse the same query info from probe trajectory
    this.cellListService.retrieveSpikeAmpTimePlot(probeTrajQueryInfo);
    this.cellListService.retrieveAutocorrelogramPlot(probeTrajQueryInfo);
    this.cellListService.retrieveWaveformPlot(probeTrajQueryInfo);
    this.spikeAmpTimeSubscription = this.cellListService.getSpikeAmpTimeLoadedListener()
      .subscribe(spikeAmpTime => {
        this.updateSpikeAmpTimePlot(spikeAmpTime);
      });

    this.acgSubscription = this.cellListService.getACGLoadedListener()
      .subscribe(autocorrelogram => {
        this.updateAutocorrelogramPlot(autocorrelogram);
      });

    this.waveformSubscription = this.cellListService.getWaveformLoadedListener()
      .subscribe(waveform => {
        this.updateWaveformPlot(waveform);
      });
    
    
  }

  gcfilter_selected(filterID) {
    
    // NOTE for self::  previously this.plot_data[0] now becomes this.plot_data_processed[this.plot_data_processed.length - 4] for DBR plot addition
    // so this.plot_data[3] becomes this.plot_data_processed[this.plot_data_processed.length]
    this.selectedGoodFilter = parseInt(filterID, 10);
    // console.log('good filter ID: ', this.selectedGoodFilter);
    // console.log('this.plot_data: ', this.plot_data)
    if (this.selectedGoodFilter) {
      
      if (this.plot_data_processed && this.plot_data_processed[0]) {
        this.plot_data_processed[this.plot_data_processed.length - 1]['showlegend'] = true;
      } else {
        this.plot_data[3]['showlegend'] = true;
      }
      
    } else {
      if (this.plot_data_processed && this.plot_data_processed[0]) {
        this.plot_data_processed[this.plot_data_processed.length - 1]['showlegend'] = false;
      } else {
        this.plot_data[3]['showlegend'] = false;
      }
    }
    let goodFilterQueryInfo = {};
    goodFilterQueryInfo['session_start_time'] = this.sessionInfo['session_start_time'];
    goodFilterQueryInfo['subject_uuid'] = this.sessionInfo['subject_uuid'];
    goodFilterQueryInfo['probe_idx'] = this.probeIndex;
    goodFilterQueryInfo['criterion_id'] = parseInt(filterID, 10);
    if (goodFilterQueryInfo['criterion_id']) {
      this.cellListService.retrieveGoodClusters(goodFilterQueryInfo);
    this.goodClusterSubscription = this.cellListService.getGoodClustersLoadedListener()
      .subscribe((goodClusterList) => {
        if (Object.entries(goodClusterList).length > 0) {
          this.goodClusters = [];
          const id_data = [];
          const is_good_data = [];
          const color_data = [];
          
          if (this.plot_data_processed && this.plot_data_processed[0]) {
            this.plot_data_processed[this.plot_data_processed.length - 4]['customdata'] = {};
            this.plot_data_processed[this.plot_data_processed.length - 4]['marker']['line']['color'] = [];
          } else {
            this.plot_data[0]['customdata'] = {};
            this.plot_data[0]['marker']['line']['color'] = [];
          }
          
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
            }
          }
          if (this.plot_data_processed && this.plot_data_processed[0]) {
            this.plot_data_processed[this.plot_data_processed.length - 4]['customdata.id'] = id_data;
            this.plot_data_processed[this.plot_data_processed.length - 4]['customdata.is_good_cluster'] = is_good_data;
            this.plot_data_processed[this.plot_data_processed.length - 4]['marker.line.color'] = color_data;
          } else {
            this.plot_data[0]['customdata.id'] = id_data;
            this.plot_data[0]['customdata.is_good_cluster'] = is_good_data;
            this.plot_data[0]['marker.line.color'] = color_data;
          }
          
          
          this.clickedClusterId = 0;
          this.order_by_event(this.eventType);
        }
      })

    } else {
      this.goodClusters = [];
      const id_data = [];
      const is_good_data = [];
      const color_data = [];
      if (this.plot_data_processed && this.plot_data_processed[0]) {
        this.plot_data_processed[this.plot_data_processed.length - 4]['customdata'] = {};
        this.plot_data_processed[this.plot_data_processed.length - 4]['marker']['line']['color'] = [];
      } else {
        this.plot_data[0]['customdata'] = {};
        this.plot_data[0]['marker']['line']['color'] = [];
      }
      
      for (let entry of Object.values(this.cells)) {
        if (entry['probe_idx'] === this.probeIndex) {
          id_data.push(entry['cluster_id']);
          color_data.push(entry['cluster_id']);
          is_good_data.push(1);
          color_data.push('rgba(132, 0, 0, 0.5)');
          
        }
      }
      if (this.plot_data_processed && this.plot_data_processed[0]) {
        this.plot_data_processed[this.plot_data_processed.length - 4]['customdata.id'] = id_data;
        this.plot_data_processed[this.plot_data_processed.length - 4]['customdata.is_good_cluster'] = is_good_data;
        this.plot_data_processed[this.plot_data_processed.length - 4]['marker.line.color'] = color_data;
      } else {
        this.plot_data[0]['customdata.id'] = id_data;
        this.plot_data[0]['customdata.is_good_cluster'] = is_good_data;
        this.plot_data[0]['marker.line.color'] = color_data;
      }
      

      this.clickedClusterId = 0;
      this.order_by_event(this.eventType);
    }
    
  }

  clusterSelectedPlot(data) {
    const element = this.el_nav.nativeElement.children[1];
    const rows = element.querySelectorAll('tr');
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
    for (const [index, cluster] of Object.entries(this.sortedCellsByProbeIns)) {
      if (cluster['cluster_id'] === cluster_id) {
        this.clickedClusterIndex = parseInt(index, 10);
        this.clickedClusterId = cluster_id;
      }
    }

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
    this.clickedClusterId = this.sortedCellsByProbeIns[this.clickedClusterIndex]['cluster_id'];
  }

  restylePlot(data) {
    if (data[0]['selected_y']) {
      
      let selected_plot = data[0]['selected_y'];
      this.plot_data[0].y = this[`${selected_plot}_data`];
      this.toPlot_y = selected_plot;
    } else if (data[0]['selected_x']) {
      let selected_plot = data[0]['selected_x'];
      this.plot_data[0].x = this[`${selected_plot}_data`];
      this.toPlot_x = selected_plot;
    }
    if (this.fullNavPlotData && this.fullNavPlotData[0]) {
      if (this.toPlot_y === 'cluster_depth') {

        this.plot_layout_processed = deepCopy(this.plot_layout_DBR)
        this.plot_layout_processed['annotations'] = this.annotationField
        this.plot_data_processed = deepCopy(this.fullNavPlotData)
      } else {
        this.plot_layout['updatemenus'] = [];
        this.plot_layout_processed = deepCopy(this.plot_layout)
        this.plot_data_processed = deepCopy(this.plot_data)
      }
    }
  }


  order_by_event(eventType) {
    // console.log('event order selected!: ', eventType);
    this.sortType = 'trial_id';
    this.eventType = eventType;
    this.rasterLookup = {};
    this.updateRaster(this.fullRasterPurse[this.probeIndex][`${this.eventType}.${this.sortType}`]);

    this.psth_data = [];
    this.psth_layout = [];
    this.psth_config = [];
    this.updatePSTH(this.fullPSTHPurse[this.probeIndex][this.eventType]);

  }

  order_by_sorting(sortType) {
    // console.log('logging sortType: ', sortType);
    this.sortType = sortType;
    this.rasterLookup = {};
    this.raster_data = [];
    this.raster_layout = [];
    this.raster_config = [];
    this.updateRaster(this.fullRasterPurse[this.probeIndex][`${this.eventType}.${this.sortType}`]);
  }
  /////////////// for depth brain region plot ////////////
  updateDepthBrainRegionInfo(queryInfo) {
    this.cellListService.retrieveDepthBrainRegions(queryInfo);
    this.depthBrainRegionsSubscription = this.cellListService.getDepthBrainRegionsLoadedListener()
      .subscribe((depthBrainRegions) => {
        if (depthBrainRegions && depthBrainRegions[0]) {
          depthBrainRegions = depthBrainRegions[0];
          this.depthBrainRegionDataPts = []
          this.annotationField = []
          
          depthBrainRegions['region_boundaries'].forEach((value, index) => {
            this.annotationField.push({
              x: -0.25,
              y: `${depthBrainRegions['region_label'][index][0]}`,
              text: `${depthBrainRegions['region_label'][index][1]}`,
              xref: 'x1',
              yref: 'y',
              font: {
                size: 9,
                color: '#949494'
              },
              showarrow: true,
              arrowhead: 0,
              arrowwidth: 0.5,
              ax: -35,
              ay: 0
            })
            
            if (value[0] && !this.depthBrainRegionDataPts.length) {
              let trace0 = {
                x: ['region'],
                y:  [value[0]],
                name: '',
                marker: {color: `rgb(255, 255, 255)`},
                type: 'bar',
                xaxis: 'x1',
                showlegend: false,
                hovertemplate: ''
              }
              let trace1 = {
                x: ['region'],
                y:  [value[1] - value[0]],
                name: depthBrainRegions['region_label'][index][1],
                marker: {color: `rgb(${depthBrainRegions['region_color'][index][0]}, ${depthBrainRegions['region_color'][index][1]}, ${depthBrainRegions['region_color'][index][2]})`},
                type: 'bar',
                xaxis: 'x1',
                showlegend: false,
                hovertemplate: `${depthBrainRegions['region_label'][index][1]}`
              }
              this.depthBrainRegionDataPts.push(trace0, trace1)
            } else {
              let trace = {
                x: ['region'],
                y:  [value[1] - value[0]],
                name: depthBrainRegions['region_label'][index][1],
                marker: {color: `rgb(${depthBrainRegions['region_color'][index][0]}, ${depthBrainRegions['region_color'][index][1]}, ${depthBrainRegions['region_color'][index][2]})`},
                type: 'bar',
                xaxis: 'x1',
                showlegend: false,
                hovertemplate: `${depthBrainRegions['region_label'][index][1]}`
              }
              this.depthBrainRegionDataPts.push(trace)
            }
            
          })

          // add in the new x axis for each trace
          let copyPlotData = [...this.plot_data];
          copyPlotData.forEach((val, ind) => {
            val['xaxis'] = 'x2'
          })
          
          // add in the depth region data and then the annotation info to existing cluster nav plot data
          this.fullNavPlotData = this.depthBrainRegionDataPts.concat(copyPlotData);
          this.plot_data_processed = deepCopy(this.fullNavPlotData);
          this.plot_layout_processed['annotations'] = this.annotationField
        }
        else {
          // make sure to empty out the brain region plot info if there is nothing returned for database
          this.depthBrainRegionDataPts = []
          
          // slot for the brain region plot needs to be kept for plotly to correctly render when user switches back to the probe with brain region data
          let copyPlotData = [...this.plot_data];
          copyPlotData.forEach((val, ind) => {
            val['xaxis'] = 'x2'
          })
          // clear out brain region annotation info on the plot
          this.plot_data_processed = deepCopy(copyPlotData);
          this.plot_layout_processed['annotations'] = []
        }
      });
  }
  /////////////end depth brain region plot //////////////
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
      };

      for (let templateType of Object.entries(this.psthLookup[psth['cluster_id']]['data'])) {
        // console.log('templateType: ', templateType);
        if (psth['psth_time']) {
          this.psthLookup[psth['cluster_id']]['data'][parseInt(templateType[0], 10)]['x'] = psth['psth_time'].split(',');
        }
        
        switch (templateType[0]) {
          case '0':
            if (psth['psth_left_upper']) {
              this.psthLookup[psth['cluster_id']]['data'][0]['y'] = psth['psth_left_upper'].split(',');
            }
            break;
          case '1':
            if (psth['psth_left']) {
              this.psthLookup[psth['cluster_id']]['data'][1]['y'] = psth['psth_left'].split(',');
            }
            break;
          case '2':
            if (psth['psth_left_lower']) {
              this.psthLookup[psth['cluster_id']]['data'][2]['y'] = psth['psth_left_lower'].split(',');
            }
            break;
          case '3':
            if (psth['psth_right_upper']) {
              this.psthLookup[psth['cluster_id']]['data'][3]['y'] = psth['psth_right_upper'].split(',');
            }
            break;
          case '4':
            if (psth['psth_right']) {
              this.psthLookup[psth['cluster_id']]['data'][4]['y'] = psth['psth_right'].split(',');
            }
            break;
          case '5':
            if (psth['psth_right_lower']) {
              this.psthLookup[psth['cluster_id']]['data'][5]['y'] = psth['psth_right_lower'].split(',');
            }
            break;
          case '6':
            if (psth['psth_incorrect_upper']) {
              this.psthLookup[psth['cluster_id']]['data'][6]['y'] = psth['psth_incorrect_upper'].split(',');
            }
            break;
          case '7':
            if (psth['psth_incorrect']) {
              this.psthLookup[psth['cluster_id']]['data'][7]['y'] = psth['psth_incorrect'].split(',');
            }
            break;
          case '8':
            if (psth['psth_incorrect_lower']) {
              this.psthLookup[psth['cluster_id']]['data'][8]['y'] = psth['psth_incorrect_lower'].split(',');
            }
            break;
          case '9':
            if (psth['psth_all_upper']) {
              this.psthLookup[psth['cluster_id']]['data'][9]['y'] = psth['psth_all_upper'].split(',');
            }
            break;
          case '10':
            if (psth['psth_all']) {
              this.psthLookup[psth['cluster_id']]['data'][10]['y'] = psth['psth_all'].split(',');
            }
            break;
          case '11':
            if (psth['psth_all_lower']) {
              this.psthLookup[psth['cluster_id']]['data'][11]['y'] = psth['psth_all_lower'].split(',');
            }
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
    for (const cluster of this.sortedCellsByProbeIns) {
      if (!this.psthLookup[cluster['cluster_id']]) {
        this.psthLookup[cluster['cluster_id']] = {
          data: this.psthLookup[Object.keys(this.psthLookup)[0]] ? deepCopy(this.psthLookup[Object.keys(this.psthLookup)[0]]['data']) : dummyData,
          layout: this.psthLookup[Object.keys(this.psthLookup)[0]] ?
                  deepCopy(this.psthLookup[Object.keys(this.psthLookup)[0]]['layout']) : dummyLayout,
          config: this.missing_raster_psth_config
        };
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
      } 
    }
    // console.log('psth purse: ', this.fullPSTHPurse);
    const isNotMovement = (plotType) => plotType != 'movement';
    this.psthEventLacksMovement = Object.keys(this.fullPSTHPurse[this.probeIndex]).every(isNotMovement)
    // console.log('psthEventLacksMovement: ', this.psthEventLacksMovement);

  }

  updateRaster(rasterPlotList) {
    this.rasterPlotList = rasterPlotList;
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
      if (image_link === '' || image_link == null) {
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
      this.rasterLookup[raster['cluster_id']]['layout']['yaxis']['range'] = [raster['plot_ylim'][0].toString(), raster['plot_ylim'][1].toString()]
      this.rasterLookup[raster['cluster_id']]['layout']['width'] = 658;
      this.rasterLookup[raster['cluster_id']]['layout']['height'] = 420;

      if (this.sortType === 'trial_id') {
        this.rasterLookup[raster['cluster_id']]['layout']['width'] = 530;
      }

      if (this.sortType === 'contrast') {   
        this.rasterLookup[raster['cluster_id']]['layout']['yaxis2']['tickvals'] = raster['plot_contrast_tick_pos'];
        this.rasterLookup[raster['cluster_id']]['layout']['yaxis2']['ticktext'] = raster['plot_contrasts'];
      }


    }

    for (const cluster of this.sortedCellsByProbeIns) {
      if (!this.rasterLookup[cluster['cluster_id']]) {
        if (this.rasterLookup[Object.keys(this.rasterLookup)[0]]) {
          this.rasterLookup[cluster['cluster_id']] = {
            data: deepCopy(this.rasterLookup[Object.keys(this.rasterLookup)[0]]['data']),
            layout: deepCopy(this.rasterLookup[Object.keys(this.rasterLookup)[0]]['layout']),
            config: this.missing_raster_psth_config
          };

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
        
      } 
    }
    // console.log('raster purse - ', this.fullRasterPurse);

    const isNotMovement = (plotType) => plotType.split('.')[0] != 'movement';
    this.rasterEventLacksMovement = Object.keys(this.fullRasterPurse[this.probeIndex]).every(isNotMovement)
    // console.log('rasterEventLacksMovement: ', this.rasterEventLacksMovement);
   
  }

  sortData(sort: Sort) {
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

    // let rastersToLoad = ['feedback.trial_id', 'feedback.feedback type', 'stim on.trial_id', 'stim on.feedback - stim on', 'stim on.contrast']
    let rastersToLoad = ['feedback.trial_id', 'feedback.feedback type', 'stim on.trial_id', 'stim on.feedback - stim on', 'stim on.contrast', 'stim on.movement - stim on', 'movement.trial_id', 'movement.movement - stim on', 'movement.feedback - movement']    
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
        this.cellListService[`retrieveRasterList${count}`](rasterQueryInfo);
        
        this[`rasterListSubscription${count}`] = this.cellListService[`getRasterListLoadedListener${count}`]()
          .subscribe((rasterPlotList) => {
            if (rasterPlotList && rasterPlotList.length > 0) {
              this.fullRasterPurse[probe][rasterType] = rasterPlotList;
              fullRasterPlots[probe][rasterType] = rasterPlotList

              if (Object.values(this.fullRasterPurse).length == this.probeIndices.length && Object.values(this.fullRasterPurse[probe]).length == rastersToLoad.length) {

                // console.log('rasters are done loading - downloaded number of probes - ', Object.values(this.fullRasterPurse).length, ' - length of full raster purse: ', Object.values(this.fullRasterPurse[probe]).length);
                this.allRastersLoaded = true;
                if (this.allPSTHsLoaded && this.allRastersLoaded) {
      
                  fullPlots = [this.fullRasterPurse, this.fullPSTHPurse];

                } else {
                  // console.log('all rasters are loaded, but not psth')
                  // console.log('Rasters: ', this.allRastersLoaded);
                  // console.log('PSTHs: ', this.allPSTHsLoaded);
                }
              }

            } else {
              // console.log('no data retrieved for raster query condition: ', rasterQueryInfo)
            }
            
          });
        count++
      }
    }
    
    

    let psthsToLoad = this.eventList_new; //['feedback', 'stim on', 'movement']
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
            if (psthPlotList && psthPlotList.length > 0) {
              this.fullPSTHPurse[probe][psthsToLoad[ind]] = psthPlotList;
              fullPSTHPlots[probe][psthsToLoad[ind]] = psthPlotList;
              if (Object.values(this.fullPSTHPurse).length == this.probeIndices.length && Object.values(this.fullPSTHPurse[probe]).length == psthsToLoad.length) {
                // console.log('psths are done loading - downloaded number of probes: ', Object.values(this.fullPSTHPurse).length, '- full psth purse length - ', Object.values(this.fullPSTHPurse[probe]).length);
                this.allPSTHsLoaded = true;
                if (this.allPSTHsLoaded && this.allRastersLoaded) {

                  fullPlots = [this.fullRasterPurse, this.fullPSTHPurse];
        
                } else {
                  // console.log('all psths are loaded, but not raster')
                  // console.log('Rasters: ', this.allRastersLoaded);
                  // console.log('PSTHs: ', this.allPSTHsLoaded);
                }
              }
            } else {
              // console.log('no data returned for following psth query: ', psthQueryInfo)
            }
            
          });
        psthCount++
      }
    }
  }
  
  getFullRasterLoadedListener() {
    // console.log('inside the full raster loaded listener');
    return this.fullRasterLoaded.asObservable();
  }
  getFullPSTHLoadedListener() {
    // console.log('inside the full PSTH loaded listener');
    return this.fullPSTHLoaded.asObservable();
  }

  updateSpikeAmpTimePlot(SATdata) {
    this.spikeAmpTime = SATdata;
    // console.log('spike amp time data: ', SATdata);
    for (const sat of this.spikeAmpTime) {
      const activeTemplate = deepCopy(this.satTemplate[sat['spike_amp_time_template_idx']]);
      let config_copy = { ...this.raster_psth_config };
      config_copy['toImageButtonOptions'] = {
        filename: `spikeAmptTime_${this.session['session_start_time']}_${this.session['subject_nickname']}_(cluster_${sat['cluster_id']})`,
        scale: 1
      };
      this.spikeAmpTimeLookup[sat['cluster_id']] = {
        data: activeTemplate['data'],
        layout: activeTemplate['layout'],
        config: config_copy
      }

      this.spikeAmpTimeLookup[sat['cluster_id']]['data'][0]['x'] = sat['plot_xlim']; // usually xlim here but building instruction says ylim - doublecheck.
      this.spikeAmpTimeLookup[sat['cluster_id']]['data'][0]['y'] = sat['plot_ylim'];
      this.spikeAmpTimeLookup[sat['cluster_id']]['layout']['images']['0']['source'] = sat['plotting_data_link'];
      this.spikeAmpTimeLookup[sat['cluster_id']]['layout']['images']['0']['sizex'] = sat['plot_xlim'][1] - sat['plot_xlim'][0];
      this.spikeAmpTimeLookup[sat['cluster_id']]['layout']['images']['0']['sizey'] = sat['plot_ylim'][1] - sat['plot_ylim'][0];
      this.spikeAmpTimeLookup[sat['cluster_id']]['layout']['images']['0']['x'] = sat['plot_xlim'][0];
      this.spikeAmpTimeLookup[sat['cluster_id']]['layout']['images']['0']['y'] = sat['plot_ylim'][1];
      this.spikeAmpTimeLookup[sat['cluster_id']]['layout']['xaxis']['range'] = sat['plot_xlim'];
      this.spikeAmpTimeLookup[sat['cluster_id']]['layout']['yaxis']['range'] = sat['plot_ylim'];

      // original sizing :  480 height / 600 width
      this.spikeAmpTimeLookup[sat['cluster_id']]['layout']['width'] = '580';
      this.spikeAmpTimeLookup[sat['cluster_id']]['layout']['height'] = '400';

    }
    // console.log('spike amp time lookup: ', this.spikeAmpTimeLookup);
  }

  updateAutocorrelogramPlot(ACGdata) {
    this.autocorrelogram = ACGdata;

    // console.log('this.acgTemplate: ', this.acgTemplate);
    for (const acg of this.autocorrelogram) {
      const currentTemplate = deepCopy(this.acgTemplate[acg['acg_template_idx']]);
      let config_copy = { ...this.raster_psth_config };
      config_copy['toImageButtonOptions'] = {
        filename: `autocorrelogram_${this.session['session_start_time']}_${this.session['subject_nickname']}_(cluster_${acg['cluster_id']})`,
        scale: 1
      };
      
      this.autocorrelogramLookup[acg['cluster_id']] = {
        data: currentTemplate['data'],
        layout: currentTemplate['layout'],
        config: config_copy
      }

      this.autocorrelogramLookup[acg['cluster_id']]['data'][0]['x'] = [];
      // np.linspace(acg['t_start'], acg['t_end'], acg['acg'].length)
      // console.log('t_end: ', acg['t_end'], '& ', 't_start: ', acg['t_start'], '& ', 'acg - length: ', acg['acg'].length)
      let xAcgArray = [];
      let increment = (acg['t_end'] - acg['t_start']) / (acg['acg'].split(',').length - 1);
      // console.log('acg.acg: ', acg.acg)
      // console.log('acg.acg.split(","): ', acg.acg.split(','))
      // console.log('acg list length: ', acg.acg.split(',').length)
      for (let item in acg['acg'].split(',')) {
        xAcgArray.push((acg['t_start'] + (increment * Number(item))) * 1000);
      }
      // console.log('xAcgArray: ', xAcgArray);
      this.autocorrelogramLookup[acg['cluster_id']]['data'][0]['x'] = xAcgArray;
      this.autocorrelogramLookup[acg['cluster_id']]['data'][0]['y'] = acg['acg'].split(',');
      this.autocorrelogramLookup[acg['cluster_id']]['layout']['yaxis']['range'] = acg['plot_ylim']

      // original sizing : 400 height / 580 width
      this.autocorrelogramLookup[acg['cluster_id']]['layout']['width'] = "520";
    }

  }

  updateWaveformPlot(WFdata) {
    this.waveform = WFdata;
    for (const wf of this.waveform) {
      const currentTemplate = deepCopy(this.wfTemplate[wf['waveform_template_idx']]);
      let config_copy = { ...this.raster_psth_config };
      config_copy['toImageButtonOptions'] = {
        filename: `waveform_${this.session['session_start_time']}_${this.session['subject_nickname']}_(cluster_${wf['cluster_id']})`,
        scale: 1
      };
      this.waveformLookup[wf['cluster_id']] = {
        data: currentTemplate['data'],
        layout: currentTemplate['layout'],
        config: config_copy
      }

      this.waveformLookup[wf['cluster_id']]['data'][0]['x'] = wf['plot_xlim'];
      this.waveformLookup[wf['cluster_id']]['data'][0]['y'] = wf['plot_ylim'];
      this.waveformLookup[wf['cluster_id']]['layout']['images']['0']['source'] = wf['plotting_data_link'];
      this.waveformLookup[wf['cluster_id']]['layout']['images']['0']['sizex'] = wf['plot_xlim'][1] - wf['plot_xlim'][0];
      this.waveformLookup[wf['cluster_id']]['layout']['images']['0']['sizey'] = wf['plot_ylim'][1] - wf['plot_ylim'][0];
      this.waveformLookup[wf['cluster_id']]['layout']['images']['0']['x'] = wf['plot_xlim'][0];
      this.waveformLookup[wf['cluster_id']]['layout']['images']['0']['y'] = wf['plot_ylim'][1];
      this.waveformLookup[wf['cluster_id']]['layout']['xaxis']['range'] = wf['plot_xlim'];
      this.waveformLookup[wf['cluster_id']]['layout']['yaxis']['range'] = wf['plot_ylim'];

      // original sizing : 400 height / 580 width
      this.waveformLookup[wf['cluster_id']]['layout']['width'] = "540";
      this.waveformLookup[wf['cluster_id']]['layout']['height'] = "370";
    }
  }


  flipTrialContrast(event) {
    // console.log('new trial contrast slider! event - ', event);
    // this.selectedTrialContrast = Number(event.step.label);
    this.selectedTrialContrast = Number(event.step.value);
    // console.log('sliderDepthLookup: ', this.sliderDepthRasterTrialLookup)
    // console.log('slider trialDepthRasterLookupData: ', this.sliderDepthRasterTrialLookup[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast]['data']);
    // console.log('even.step.args[0]', event.step.args[0])
    // console.log('slider trialDepthRasterLookupLayout: ', this.sliderDepthRasterTrialLookup[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast]['layout']);
    // console.log('even.step.args[1]', event.step.args[1])
    // console.log('======================================')
    
    this.sliderDepthRasterTrialLookup[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast]['data'] = event.step.args[0]
    // this.sliderDepthRasterTrialLookup[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast]['data']['customdata'] = Number(event.step.value)
    this.sliderDepthRasterTrialLookup[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast]['data']['customdata'] = Number(event.step.label)
    this.featuredTrialId = this.depthRasterTrialLookup[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast]['data']['customdata']
    // console.log('featuredTrialID: ', this.featuredTrialId);
    // console.log('updated slider trialDepthRasterLookup data: ', this.sliderDepthRasterTrialLookup[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast]['data']);
  }


  flipTrialID_B(event) {
    // console.log('+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+')
    // console.log('new trial ID slider selection eventB - ', event);
    // console.log('event.step.args: ', event.step.args)
    if (Number(event.step.value) || event.step.value == '0') {
      this.selectedTrialContrast = Number(event.step.value);
    } else {
      this.selectedTrialContrast = event.step.value;
    }
    // console.log('sliderDepthLookup: ', this.sliderDepthRasterTrialLookup)
    // console.log('sliderDepthLookupB: ', this.sliderDepthRasterTrialLookupB)
    // console.log('slider trialDepthRasterLookupB Data: ', this.sliderDepthRasterTrialLookupB[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast]['data']);
    // console.log('even.step.args[0]', event.step.args[0])
    // console.log('slider trialDepthRasterLookupB Layout: ', this.sliderDepthRasterTrialLookupB[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast]['layout']);
    // console.log('even.step.args[1]', event.step.args[1])
    // console.log('======================================')
    this.sliderDepthRasterTrialLookupB[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast]['data'] = event.step.args[0]
    this.sliderDepthRasterTrialLookupB[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast]['data']['customdata'] = Number(event.step.label)
    // this.featuredTrialId = this.depthRasterTrialLookup[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast]['data']['customdata']
    this.featuredTrialIdB = Number(event.step.label)

    // console.log('featured ID B now: ', this.featuredTrialIdB)
    // console.log('updated slider trialDepthRasterLookup data: ', this.sliderDepthRasterTrialLookup[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast]['data']);
  }

  trialTypeSelected(newTrialType) {
    // console.log('trial type selected - ', newTrialType);
    // console.log('this.contrastMinLookup: ', this.contrastMinLookup)
    // console.log('this.depthRasterTrialLookupB[this.probeIndex]: ', this.depthRasterTrialLookupB[this.probeIndex])
    // console.log('this.depthRasterTrialLookup[this.probeIndex]: ', this.depthRasterTrialLookup[this.probeIndex])
    this.selectedTrialType = newTrialType;
    this.selectedTrialContrast = this.contrastMinLookup[newTrialType];
    // console.log('!!selectedTrialContrast:', this.selectedTrialContrast);
    // console.log('Object.keys(this.depthRasterTrialLookupB[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast][0])[0]: ', Object.keys(this.depthRasterTrialLookupB[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast][0])[0])
    // this.featuredTrialId = this.depthRasterTrialLookup[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast]['data']['customdata']
    this.featuredTrialIdB = Object.keys(this.depthRasterTrialLookupB[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast][0])[0]
    let contrastKeysX = Object.keys(this.depthRasterTrialLookupB[this.probeIndex][this.selectedTrialType]).filter(eachContrast=> {
      if (Number(eachContrast) || eachContrast == '0') {
        return Number(eachContrast)
      }
    });
    this.availableTrialContrasts = contrastKeysX.map(Number).sort((a,b) => a-b);
    // this.availableTrialContrasts = Object.keys(this.depthRasterTrialLookup[this.probeIndex][this.selectedTrialType]).map(Number).sort((a,b) => a-b);
    this.availableTrialContrasts.push('All Trial Contrasts')
    // console.log('newly available trial contrasts: ', this.availableTrialContrasts)
  }

  trialContrastSelected(newTrialContrast) {
    // console.log('trial contrast selected - ', newTrialContrast);
    this.selectedTrialContrast = newTrialContrast;
    // this.featuredTrialId = Object.keys(this.depthRasterTrialLookupB[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast][0])[0]
    this.featuredTrialIdB = Object.keys(this.depthRasterTrialLookupB[this.probeIndex][this.selectedTrialType][this.selectedTrialContrast][0])[0]
    // console.log('featured ID now: ', this.featuredTrialId)
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

