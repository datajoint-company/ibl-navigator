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

  private driftmapPlotsSubscription: Subscription;
  private driftmapTemplatesSubscription: Subscription;

  @Input() driftmapInfo: Object;
  constructor(public QCService: QualityControlService) { }

  ngOnInit() {
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
            this.driftmapLookup[plot['probe_idx']]['layout']['images'][0]['source'] =  'http://localhost:9000/assets/images/IBLlogo.png';
            this.driftmapLookup[plot['probe_idx']]['layout']['images'][0]['sizex'] = plot['plot_xlim'][1] - plot['plot_xlim'][0];
            this.driftmapLookup[plot['probe_idx']]['layout']['images'][0]['sizey'] = plot['plot_ylim'][1] - plot['plot_ylim'][0];
            this.driftmapLookup[plot['probe_idx']]['layout']['images'][0]['x'] = plot['plot_xlim'][0];
            this.driftmapLookup[plot['probe_idx']]['layout']['images'][0]['y'] = plot['plot_ylim'][1];

            // mid resolution should come here
            this.driftmapLookup[plot['probe_idx']]['layout']['images'].push({
              source: 'http://localhost:9000/assets/images/dj_loading_icon.gif' ,
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
         
            // console.log('driftmapLookup: ', this.driftmapLookup);
            // console.log('image link to driftmap: ', plot['plotting_data_link']);


            
          }
          
        }

        


      });
    

    

  }

  ngOnDestroy() {

  }
  donePlotting() {
    console.log('DONE replotting the depth raster');
    this.driftmapLoading = false;
  }
  plotInitialized() {
    console.log('plot is now initialized.')
    this.driftmapLoading = false;
  }
  probeChange(event) {
    console.log('probe change event detected (plot component side) - ', event);
    this.driftmapLoading = true;
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
