import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { MousePlotsService } from '../mouse-plots.service';

declare var Plotly: any;

@Component({
  selector: 'app-fit-par-plots',
  templateUrl: './fit-par-plots.component.html',
  styleUrls: ['./fit-par-plots.component.css']
})
export class FitParPlotsComponent implements OnInit, OnDestroy {
  fitParPlotsAreAvailable: boolean;
  plotConfig = {
    responsive: true,
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
          var toPngImageButtonOptions = gd._context.toImageButtonOptions;
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
          var toSvgImageButtonOptions = gd._context.toImageButtonOptions;
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

  private fitParPlotsSubscription: Subscription;
  @Output() fitParPlotsAvailability: EventEmitter<any> = new EventEmitter();
  @Input('mouseInfo') mouseInfo: Object;
  constructor(public mousePlotsService: MousePlotsService) { }
  @ViewChild('fitParPlots') elem: ElementRef;
  ngOnInit() {
    const element = this.elem.nativeElement;
    this.mousePlotsService.getFitParametersPlot({'subject_uuid': this.mouseInfo['subject_uuid']});
    this.fitParPlotsSubscription = this.mousePlotsService.getFitParPlotsLoadedListener()
    .subscribe((plotsInfo: any) => {
        if (plotsInfo && plotsInfo[0]) {
          const toPlot = plotsInfo[Object.entries(plotsInfo).length - 1];
          console.log('fit parameters plots retrieved');
          const fitParPlots = toPlot['fit_pars'];
          // fitParPlots['layout']['yaxis']['title']['text'] = '<i>Lapse High (\u03BB)</i>'; // lambda
          // fitParPlots['layout']['yaxis2']['title']['text'] = '<i>Lapse Low (\u03B3)</i>'; // gamma
          // fitParPlots['layout']['yaxis3']['title']['text'] = '<i>Bias (&mu;)</i>';
          // fitParPlots['layout']['yaxis4']['title']['text'] = '<i>Threshold (\u03BB)</i>';
          fitParPlots['layout']['width'] = '';
          fitParPlots['layout']['height'] = 1200;
          this.fitParPlotsAreAvailable = true;
          this.fitParPlotsAvailability.emit(this.fitParPlotsAreAvailable);
          this.plotConfig['toImageButtonOptions']['filename'] = this.mouseInfo['subject_nickname'] + '_fit parameters_plot';
          Plotly.newPlot(element, fitParPlots['data'], fitParPlots['layout'], this.plotConfig);
        } else {
          this.fitParPlotsAreAvailable = false;
          this.fitParPlotsAvailability.emit(this.fitParPlotsAreAvailable);
          console.log('fit parameters plots not available');
        }
      });
  }

  ngOnDestroy() {
    if (this.fitParPlotsSubscription) {
      this.fitParPlotsSubscription.unsubscribe();
    }
  }

}
