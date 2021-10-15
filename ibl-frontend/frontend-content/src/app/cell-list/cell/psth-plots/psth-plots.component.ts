import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, ElementRef, ViewChild, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { CellPlotsService } from '../cell-plots.service';

declare var Plotly: any;
@Component({
  selector: 'app-psth-plots',
  templateUrl: './psth-plots.component.html',
  styleUrls: ['./psth-plots.component.css']
})
export class PsthPlotsComponent implements OnInit, OnDestroy, OnChanges {
  d3 = Plotly.d3;
  PSTHplots: any;
  eventType: string;
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

  private allPsthPlotSubscription: Subscription;

  @Input() clusterInfo: Object;
  @Input() selectedEvent: String;
  // @ViewChild('PSTH_plot') el: ElementRef;
  @ViewChild('PSTH_plot', {static: true}) el: ElementRef;
  constructor(public cellPlotsService: CellPlotsService) { }

  ngOnInit() {
    const element = this.el.nativeElement;
    this.cellPlotsService.getAllPSTH(this.clusterInfo);
    this.allPsthPlotSubscription = this.cellPlotsService.getAllPsthPlotsLoadedListener()
      .subscribe((plots: any) => {
        if (plots) {
          this.eventType = 'feedback';
          this.PSTHplots = plots;
          for (const plt of plots) {
            if (plt['event'] === 'feedback') {
              const psthPlotObj = plt['plotting_data'];
              psthPlotObj['layout']['height'] = 450;
              psthPlotObj['layout']['width'] = 705;
              Plotly.newPlot(element, psthPlotObj['data'], psthPlotObj['layout'], this.plotConfig);
            }
          }
        }
      });
  }

  ngOnDestroy() {
    if (this.allPsthPlotSubscription) {
      this.allPsthPlotSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.order_by_event(changes.selectedEvent.currentValue);
  }

  order_by_event(eventType) {
    this.eventType = eventType;
    const element = this.el.nativeElement;
    for (const plot of this.PSTHplots) {
      if (plot['event'] === eventType) {
        const psthPlotObj = plot['plotting_data'];
        psthPlotObj['layout']['height'] = 450;
        psthPlotObj['layout']['width'] = 705;
        Plotly.newPlot(element, psthPlotObj['data'], psthPlotObj['layout'], this.plotConfig);
      }
    }
  }

}
