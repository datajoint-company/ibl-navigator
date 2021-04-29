import { Component, OnInit, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { QualityControlService } from '../quality-control.service';

declare var Plotly: any;

@Component({
  selector: 'app-driftmap',
  templateUrl: './driftmap.component.html',
  styleUrls: ['./driftmap.component.css']
})
export class DriftmapComponent implements OnInit, OnDestroy {
  selected_probe_index;
  driftmapLoading: boolean;
  driftmaps;
  driftmapTemplates = {};

  driftmap_data = [];
  driftmap_layout = [];
  driftmap_config = [];
  driftmapLookup = {}; // for looking up plotting info like data/layout by probe index

  driftmap_base_config = {
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

  missing_driftmap_config = {
    responsive: false,
    showLink: false,
    showSendToCloud: false,
    displaylogo: false,
    modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian',
      'hoverCompareCartesian', 'toImage', 'toggleSpikelines'],
  };


  private driftmapPlotsSubscription: Subscription;
  private driftmapTemplatesSubscription: Subscription;

  @Input() driftmapInfo: Object;
  constructor(public QCService: QualityControlService) { }

  ngOnInit() {
    // console.log('driftmapInfo: ', this.driftmapInfo)
    this.driftmapLoading = true;
    this.QCService.getDriftmapTemplates();

    this.driftmapTemplatesSubscription = this.QCService.getDriftmapTemplatesLoadedListener()
      .subscribe((templates) => {
        for (let template of Object.values(templates)) {
          // console.log('template:', template)
          this.driftmapTemplates[template['depth_raster_template_idx']] = template['depth_raster_template']
        }
        // console.log('templates for depth rasters retrieved: ', templates);
        
        this.QCService.retrieveDriftmapPlots({
          'subject_uuid': this.driftmapInfo['subject_uuid'],
          'session_start_time': this.driftmapInfo['session_start_time'],
        });

      });

    // console.log('this.driftmapTemplates: ', this.driftmapTemplates)
    this.driftmapPlotsSubscription = this.QCService.getDriftmapsLoadedListener()
      .subscribe((plotInfo) => {

        // console.log('drift map plot data retrieved: ', plotInfo);
        this.driftmaps = deepCopy(plotInfo);
        for (let plot of Object.values(plotInfo)) {
          // console.log('plot[depth_raster_template_idx]: ', plot['depth_raster_template_idx']);
          this.driftmapLookup[plot['probe_idx']] = {};
          this.driftmapLookup[plot['probe_idx']]['data'] = deepCopy(this.driftmapTemplates[plot['depth_raster_template_idx']]['data']);
          this.driftmapLookup[plot['probe_idx']]['layout'] = deepCopy(this.driftmapTemplates[plot['depth_raster_template_idx']]['layout']);
          if (plot['depth_raster_template_idx'] == 0) {
            // console.log('depth raster template index is 0');
            this.driftmapLookup[plot['probe_idx']]['data'][0]['x'] = plot['plot_xlim'];
            this.driftmapLookup[plot['probe_idx']]['data'][0]['y'] = plot['plot_ylim'];
            this.driftmapLookup[plot['probe_idx']]['data'][1]['x'] = [plot['first_start'], plot['first_start']];
            this.driftmapLookup[plot['probe_idx']]['data'][1]['y'] = [plot['plot_ylim'][1]-20, plot['plot_ylim'][1]-80];
            this.driftmapLookup[plot['probe_idx']]['data'][2]['x'] = [plot['last_end'], plot['last_end']];
            this.driftmapLookup[plot['probe_idx']]['data'][2]['y'] = [plot['plot_ylim'][1]-20, plot['plot_ylim'][1]-80];
            
            this.driftmapLookup[plot['probe_idx']]['layout']['xaxis']['range'] = plot['plot_xlim'];
            this.driftmapLookup[plot['probe_idx']]['layout']['yaxis']['range'] = plot['plot_ylim'];

            // the base low-res layer setup
            this.driftmapLookup[plot['probe_idx']]['layout']['images'][0]['source'] =  plot['plotting_data_link_very_low_res'];
            this.driftmapLookup[plot['probe_idx']]['layout']['images'][0]['sizex'] = plot['plot_xlim'][1] - plot['plot_xlim'][0];
            this.driftmapLookup[plot['probe_idx']]['layout']['images'][0]['sizey'] = plot['plot_ylim'][1] - plot['plot_ylim'][0];
            this.driftmapLookup[plot['probe_idx']]['layout']['images'][0]['x'] = plot['plot_xlim'][0];
            this.driftmapLookup[plot['probe_idx']]['layout']['images'][0]['y'] = plot['plot_ylim'][1];

            // mid resolution should come here
            this.driftmapLookup[plot['probe_idx']]['layout']['images'].push({
              source: plot['plotting_data_link_low_res'],
              sizex: plot['plot_xlim'][1] - plot['plot_xlim'][0],
              sizey: plot['plot_ylim'][1] - plot['plot_ylim'][0],
              x: plot['plot_xlim'][0],
              y: plot['plot_ylim'][1],
              layer: "below",
              sizing: "stretch",
              xref: "x",
              yref: "y"
            });

            // highest resolution should come here
            this.driftmapLookup[plot['probe_idx']]['layout']['images'].push({
              source: plot['plotting_data_link'],
              sizex: plot['plot_xlim'][1] - plot['plot_xlim'][0],
              sizey: plot['plot_ylim'][1] - plot['plot_ylim'][0],
              x: plot['plot_xlim'][0],
              y: plot['plot_ylim'][1],
              layer: "below",
              sizing: "stretch",
              xref: "x",
              yref: "y"
            });
         
            // console.log('highest image link to driftmap: ', plot['plotting_data_link']);
            // console.log('medium image link to driftmap: ', plot['plotting_data_link_low_res']);
            // console.log('low image link to driftmap: ', plot['plotting_data_link_very_low_res']);

            this.driftmapLookup[plot['probe_idx']]['config'] = this.driftmap_base_config;
            this.driftmapLookup[plot['probe_idx']]['config']['toImageButtonOptions']['filename'] = `full depth raster [session time:${this.driftmapInfo['session_start_time']}]`

            // console.log('driftmapLookup: ', this.driftmapLookup);
            
          }
          
        }

        


      });
    

    

  }

  ngOnDestroy() {
    if (this.driftmapTemplatesSubscription) {
      this.driftmapTemplatesSubscription.unsubscribe();
    }
    if (this.driftmapPlotsSubscription) {
      this.driftmapPlotsSubscription.unsubscribe();
    }
  }
  
  plotInitialized() {
    // all images have finished loading and plot is now initialized.
    this.driftmapLoading = false;
  }


}

function deepCopy(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  }
  catch(err) {
    console.error(err);
    return obj
  }
}
