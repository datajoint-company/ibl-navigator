import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input} from '@angular/core';
import { Subscription } from 'rxjs';
import { CellPlotsService } from '../cell-plots.service';

declare var Plotly: any;
@Component({
  selector: 'app-raster-plots',
  templateUrl: './raster-plots.component.html',
  styleUrls: ['./raster-plots.component.css']
})
export class RasterPlotsComponent implements OnInit, OnDestroy {
  d3 = Plotly.d3;
  plotsByEvents: any;
  eventType: string;
  sortType: string;
  plotConfig = {
    // responsive: true,
    showLink: false,
    showSendToCloud: false,
    displaylogo: false,
    modeBarButtonsToRemove: ['toImage'],
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

  private allRastersSubscription: Subscription;
  private rasterEventFeedbackSubscription: Subscription;
  private rasterEventResponseSubscription: Subscription;
  private rasterEventStimOnSubscription: Subscription;
 

  @Input() clusterInfo: Object;
  @ViewChild('raster_plots') el: ElementRef;
  // @ViewChild('raster_AT') el1: ElementRef;
  // @ViewChild('raster_CT') el2: ElementRef;
  // @ViewChild('raster_RT') el3: ElementRef;
  // @ViewChild('raster_LT') el4: ElementRef;

  constructor(public cellPlotsService: CellPlotsService) { }
  
  ngOnInit() {
    const element = this.el.nativeElement;
    // const element_AT = this.el1.nativeElement;
    // const element_CT = this.el2.nativeElement;
    // const element_RT = this.el3.nativeElement;
    // const element_LT = this.el4.nativeElement;
    this.cellPlotsService.getRasterEventFeedback(this.clusterInfo);
    this.rasterEventFeedbackSubscription = this.cellPlotsService.getRasterEventFeedbackLoadedListener()
      .subscribe((plots: any) => {
        if (plots) {
          const timeGet = new Date();
          this.eventType = 'feedback';
          this.sortType = 'trial_id';
          this.plotsByEvents = plots;
          console.log('successfully fetched event feedback rasters');
          console.log(plots);
          console.log(timeGet);
          for (const item of plots) {
            if (item['sort_by'] === 'trial_id') {
              const origRaster = item['plotting_data'];
              origRaster['layout']['height'] = 450;
              origRaster['layout']['width'] = 705;
              Plotly.newPlot(element, origRaster['data'], origRaster['layout'], this.plotConfig);
              // console.log('done plotting:', new Date() - timeGet, 'ms');
              if (item['trial_condition'] === 'all trials') {
                // const origRaster_AT = item['plotting_data'];
                
                console.log('printing all trials plot for feedback rasters');
                // Plotly.newPlot(element_AT, origRaster_AT['data'], origRaster_AT['layout'], this.plotConfig);
                
              }
              //   else if (item['trial_condition'] === 'correct trials') {
              //   const origRaster_CT = item['plotting_data'];
              //   console.log('printing correct trials plot for feedback rasters');
              //   Plotly.newPlot(element_CT, origRaster_CT['data'], origRaster_CT['layout'], this.plotConfig);
              //   // console.log('done plotting:', new Date() - timeGet, 'ms');
              // } else if (item['trial_condition'] === 'right trials') {
              //   const origRaster_RT = item['plotting_data'];
              //   console.log('printing right plot for feedback rasters');
              //   Plotly.newPlot(element_RT, origRaster_RT['data'], origRaster_RT['layout'], this.plotConfig);
              //   // console.log('done plotting:', new Date() - timeGet, 'ms');
              // } else if (item['trial_condition'] === 'left trials') {
              //   const origRaster_LT = item['plotting_data'];
              //   console.log('printing left trials plot for feedback rasters');
              //   Plotly.newPlot(element_LT, origRaster_LT['data'], origRaster_LT['layout'], this.plotConfig);
              // }
            }
          }
        }
      });
  }

  ngOnDestroy() {
    if (this.allRastersSubscription) {
      this.allRastersSubscription.unsubscribe();
    }
    if (this.rasterEventFeedbackSubscription) {
      this.rasterEventFeedbackSubscription.unsubscribe();
    }
  }

  order_by_event(eventType) {
    console.log('raster needs to be order by event: ', eventType);
    this.eventType = eventType;
    const element = this.el.nativeElement;
    // const element_AT = this.el1.nativeElement;
    // const element_CT = this.el2.nativeElement;
    // const element_RT = this.el3.nativeElement;
    // const element_LT = this.el4.nativeElement;
    if (eventType === 'feedback') {
      this.plotsByEvents = '';
      this.cellPlotsService.getRasterEventFeedback(this.clusterInfo);
      this.rasterEventFeedbackSubscription = this.cellPlotsService.getRasterEventFeedbackLoadedListener()
        .subscribe((plots: any) => {
          this.plotsByEvents = plots;
          console.log('successfully fetched event feeback rasters');
          console.log(Object.entries(plots).length);
          for (const item of plots) {
            if (item['sort_by'] === this.sortType) {
              const origRaster = item['plotting_data'];
              origRaster['layout']['height'] = 450;
              origRaster['layout']['width'] = 705;
              Plotly.newPlot(element, origRaster['data'], origRaster['layout']);
              // if (item['trial_condition'] === 'all trials') {
              //   const origRaster_AT = item['plotting_data'];
              //   origRaster_AT['layout']['showlegend'] = false;
              //   Plotly.newPlot(element_AT, origRaster_AT['data'], origRaster_AT['layout']);
              // } else if (item['trial_condition'] === 'correct trials') {
              //   const origRaster_CT = item['plotting_data'];
              //   origRaster_CT['layout']['showlegend'] = false;
              //   Plotly.newPlot(element_CT, origRaster_CT['data'], origRaster_CT['layout']);
              // } else if (item['trial_condition'] === 'right trials') {
              //   const origRaster_RT = item['plotting_data'];
              //   origRaster_RT['layout']['showlegend'] = false;
              //   Plotly.newPlot(element_RT, origRaster_RT['data'], origRaster_RT['layout']);
              // } else if (item['trial_condition'] === 'left trials') {
              //   const origRaster_LT = item['plotting_data'];
              //   origRaster_LT['layout']['showlegend'] = false;
              //   Plotly.newPlot(element_LT, origRaster_LT['data'], origRaster_LT['layout']);
              // }
            }
          }
        });
    } else if (eventType === 'response') {
      this.plotsByEvents = '';
      this.cellPlotsService.getRasterEventResponse(this.clusterInfo);
      this.rasterEventResponseSubscription = this.cellPlotsService.getRasterEventResponseLoadedListener()
        .subscribe((plots: any) => {
          this.plotsByEvents = plots;
          console.log('successfully fetched event response rasters');
          console.log(Object.entries(plots).length);
          for (const item of plots) {
            if (item['sort_by'] === this.sortType) {
              const origRaster = item['plotting_data'];
              origRaster['layout']['height'] = 450;
              origRaster['layout']['width'] = 705;
              Plotly.newPlot(element, origRaster['data'], origRaster['layout']);
              // if (item['trial_condition'] === 'all trials') {
              //   const origRaster_AT = item['plotting_data'];
              //   origRaster_AT['layout']['showlegend'] = false;
              //   Plotly.newPlot(element_AT, origRaster_AT['data'], origRaster_AT['layout']);
              // } else if (item['trial_condition'] === 'correct trials') {
              //   const origRaster_CT = item['plotting_data'];
              //   origRaster_CT['layout']['showlegend'] = false;
              //   Plotly.newPlot(element_CT, origRaster_CT['data'], origRaster_CT['layout']);
              // } else if (item['trial_condition'] === 'right trials') {
              //   const origRaster_RT = item['plotting_data'];
              //   origRaster_RT['layout']['showlegend'] = false;
              //   Plotly.newPlot(element_RT, origRaster_RT['data'], origRaster_RT['layout']);
              // } else if (item['trial_condition'] === 'left trials') {
              //   const origRaster_LT = item['plotting_data'];
              //   origRaster_LT['layout']['showlegend'] = false;
              //   Plotly.newPlot(element_LT, origRaster_LT['data'], origRaster_LT['layout']);
              // }
            }
          }
        });
    } else if (eventType === 'stim on') {
      this.plotsByEvents = '';
      this.cellPlotsService.getRasterEventStimOn(this.clusterInfo);
      this.rasterEventStimOnSubscription = this.cellPlotsService.getRasterEventStimOnLoadedListener()
        .subscribe((plots: any) => {
          this.plotsByEvents = plots;
          console.log('successfully fetched event stim on rasters');
          console.log(Object.entries(plots).length);
          for (const item of plots) {
            if (item['sort_by'] === this.sortType) {
              const origRaster = item['plotting_data'];
              origRaster['layout']['height'] = 450;
              origRaster['layout']['width'] = 705;
              Plotly.newPlot(element, origRaster['data'], origRaster['layout']);
              // if (item['trial_condition'] === 'all trials') {
              //   const origRaster_AT = item['plotting_data'];
              //   origRaster_AT['layout']['showlegend'] = false;
              //   Plotly.newPlot(element_AT, origRaster_AT['data'], origRaster_AT['layout']);
              // } else if (item['trial_condition'] === 'correct trials') {
              //   const origRaster_CT = item['plotting_data'];
              //   origRaster_CT['layout']['showlegend'] = false;
              //   Plotly.newPlot(element_CT, origRaster_CT['data'], origRaster_CT['layout']);
              // } else if (item['trial_condition'] === 'right trials') {
              //   const origRaster_RT = item['plotting_data'];
              //   origRaster_RT['layout']['showlegend'] = false;
              //   Plotly.newPlot(element_RT, origRaster_RT['data'], origRaster_RT['layout']);
              // } else if (item['trial_condition'] === 'left trials') {
              //   const origRaster_LT = item['plotting_data'];
              //   origRaster_LT['layout']['showlegend'] = false;
              //   Plotly.newPlot(element_LT, origRaster_LT['data'], origRaster_LT['layout']);
              // }
            }
          }
        });
    }

  }

  order_by_sorting(sortType) {
    this.sortType = sortType;
    const element = this.el.nativeElement;
    // const element_AT = this.el1.nativeElement;
    // const element_CT = this.el2.nativeElement;
    // const element_RT = this.el3.nativeElement;
    // const element_LT = this.el4.nativeElement;
    console.log('raster needs to be order by sort: ', sortType);
    for (const item of this.plotsByEvents) {
      // console.log('traversing plot by evnts - item sorting: ', item['sort_by']);
      // console.log('sortType was: ', sortType);
      // console.log('sortType === itemSort?: ', (item['sort_by'] === sortType));
      if (item['sort_by'] === sortType) {
        console.log('fetching sorting raster by: ', sortType);
        const origRaster = item['plotting_data'];
        origRaster['layout']['height'] = 450;
        origRaster['layout']['width'] = 705;
        Plotly.newPlot(element, origRaster['data'], origRaster['layout']);
        // if (item['trial_condition'] === 'all trials') {
        //   const origRaster_AT = item['plotting_data'];
        //   origRaster_AT['layout']['showlegend'] = false;
        //   Plotly.newPlot(element_AT, origRaster_AT['data'], origRaster_AT['layout']);
        // } else if (item['trial_condition'] === 'correct trials') {
        //   const origRaster_CT = item['plotting_data'];
        //   origRaster_CT['layout']['showlegend'] = false;
        //   Plotly.newPlot(element_CT, origRaster_CT['data'], origRaster_CT['layout']);
        // } else if (item['trial_condition'] === 'right trials') {
        //   const origRaster_RT = item['plotting_data'];
        //   origRaster_RT['layout']['showlegend'] = false;
        //   Plotly.newPlot(element_RT, origRaster_RT['data'], origRaster_RT['layout']);
        // } else if (item['trial_condition'] === 'left trials') {
        //   const origRaster_LT = item['plotting_data'];
        //   origRaster_LT['layout']['showlegend'] = false;
        //   Plotly.newPlot(element_LT, origRaster_LT['data'], origRaster_LT['layout']);
        // }
      }
    }
  }

}
