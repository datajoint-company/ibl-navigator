import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { MousePlotsService } from '../mouse-plots.service';

declare var Plotly: any;

@Component({
  selector: 'app-fit-par-plots',
  templateUrl: './fit-par-plots.component.html',
  styleUrls: ['./fit-par-plots.component.css']
})


export class FitParPlotsComponent implements OnInit, OnDestroy {
  d3 = Plotly.d3;
  fitParPlotsAreAvailable: boolean;
  dataLen: number;
  newScreenWidth;
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

  private fitParPlotsSubscription: Subscription;
  @Output() fitParPlotsAvailability: EventEmitter<any> = new EventEmitter();
  @Input() mouseInfo: Object;

  constructor(public mousePlotsService: MousePlotsService) { }
  @ViewChild('fitParPlots') elem: ElementRef;
  smallScreenLayout = {
    'font.size': '10',
    width: '516',
    height: '615',
    'margin.l': '45',
    'legend.font.size': '9.75'
  };

  mediumSmallScreenLayout = {
    'font.size': '10',
    'margin.l': '',
    width: '710',
    height: '680',
    'legend.font.size': '9.5'
  };

  mediumScreenDataStyle = {
    'marker.size': ['4']
  };
  mediumScreenLayout = {
    'font.size': '10.5',
    'margin.l': '',
    width: '900',
    height: '800',
    'legend.font.size': '9.5'
    // legend: {
    //   orientation: 'h',
    //   x: '0',
    //   y: '1.06',
    //   font: {
    //     size: '9.5'
    //   },
    // }
  };

  mediumLargeScreenDataStyle = {
    'marker.size': ['5']
  };
  mediumLargeScreenLayout = {
    'font.size': '11',
    'margin.l': '',
    width: '600',
    height: '800',
    'legend.font.size': '10'
    // legend: {
    //   orientation: 'h',
    //   x: '0.05',
    //   y: '1.04',
    //   font: {
    //     size: '10'
    //   },
    // }
  };

  defaultScreenDataStyle = {
    'marker.size': ['6']
  };
  defaultScreenLayout = {
    'font.size': '12',
    'margin.l': '',
    'xaxis2.showticklabels': false,
    'xaxis3.showticklabels': false,
    'xaxis4.showticklabels': false,
    width: '750',
    height: '860',
    'legend.font.size': '12'
    // legend: {
    //   orientation: 'v',
    //   x: '',
    //   y: '',
    //   font: {
    //     size: '12'
    //   },
    // }
  };

  @HostListener('window:resize', ['$event.target']) onResize(event) {
    this.newScreenWidth = event.innerWidth;
    const responsiveFitParPlot = this.d3.select(this.elem.nativeElement).node();
    if (this.dataLen > 4) {
      this.mediumScreenDataStyle['line.width'] = ['1', '1'].concat(Array(this.dataLen - 4).fill('0.25'), ['1', '1']);
      this.mediumLargeScreenDataStyle['line.width'] = ['1.5', '1.5'].concat(Array(this.dataLen - 4).fill('0.35'), ['1.5', '1.5']);
      this.defaultScreenDataStyle['line.width'] = ['2', '2'].concat(Array(this.dataLen - 4).fill('0.5'), ['2', '2']);
    }
    if (this.newScreenWidth < 1440 && (this.newScreenWidth > 1024 || this.newScreenWidth === 1024)) {
      Plotly.update(responsiveFitParPlot, this.mediumLargeScreenDataStyle, this.mediumLargeScreenLayout);
    } else if (this.newScreenWidth < 1024 && (this.newScreenWidth > 768 || this.newScreenWidth === 768)) {
      Plotly.update(responsiveFitParPlot, this.mediumScreenDataStyle, this.mediumScreenLayout);
    } else if (this.newScreenWidth < 768 && (this.newScreenWidth > 420 || this.newScreenWidth === 420)) {
      Plotly.update(responsiveFitParPlot, this.mediumScreenDataStyle, this.mediumSmallScreenLayout);
    } else if (this.newScreenWidth < 420) {
      Plotly.update(responsiveFitParPlot, this.mediumScreenDataStyle, this.smallScreenLayout);
    } else {
      Plotly.update(responsiveFitParPlot, this.defaultScreenDataStyle, this.defaultScreenLayout);
    }
  }
  ngOnInit() {
    const screenSizeInitial = window.innerWidth;
    const element = this.elem.nativeElement;

    this.mousePlotsService.getFitParametersPlot({'subject_uuid': this.mouseInfo['subject_uuid']});
    this.fitParPlotsSubscription = this.mousePlotsService.getFitParPlotsLoadedListener()
    .subscribe((plotsInfo: any) => {
        if (plotsInfo && plotsInfo[0]) {
          const toPlot = plotsInfo[Object.entries(plotsInfo).length - 1];
          const fitParPlots = toPlot['fit_pars'];
          // fitParPlots['layout']['yaxis']['title']['text'] = '<i>Lapse High (\u03BB)</i>'; // lambda
          // fitParPlots['layout']['yaxis2']['title']['text'] = '<i>Lapse Low (\u03B3)</i>'; // gamma
          // fitParPlots['layout']['yaxis3']['title']['text'] = '<i>Bias (&mu;)</i>';
          // fitParPlots['layout']['yaxis4']['title']['text'] = '<i>Threshold (\u03BB)</i>';
          fitParPlots['layout']['plot_bgcolor'] = 'rgba(0, 0, 0, 0)';
          fitParPlots['layout']['paper_bgcolor'] = 'rgba(0, 0, 0, 0)';
          fitParPlots['layout']['modebar'] = { bgcolor: 'rgba(255, 255, 255, 0)' };
          if (this.dataLen > 4) {
            this.mediumScreenDataStyle['line.width'] = ['1', '1'].concat(Array(this.dataLen - 4).fill('0.25'), ['1', '1']);
            this.mediumLargeScreenDataStyle['line.width'] = ['1.5', '1.5'].concat(Array(this.dataLen - 4).fill('0.35'), ['1.5', '1.5']);
            this.defaultScreenDataStyle['line.width'] = ['2', '2'].concat(Array(this.dataLen - 4).fill('0.5'), ['2', '2']);
          }
          this.fitParPlotsAreAvailable = true;
          this.fitParPlotsAvailability.emit(this.fitParPlotsAreAvailable);
          this.plotConfig['toImageButtonOptions']['filename'] = this.mouseInfo['subject_nickname'] + '_fit parameters_plot';
          Plotly.newPlot(element, fitParPlots['data'], fitParPlots['layout'], this.plotConfig);
          if (screenSizeInitial < 1440 && (screenSizeInitial > 1024 || screenSizeInitial === 1024)) {
            Plotly.update(element, this.mediumLargeScreenDataStyle, this.mediumLargeScreenLayout);
          } else if (screenSizeInitial < 1024 && (screenSizeInitial > 768 || screenSizeInitial === 768)) {
            Plotly.update(element, this.mediumScreenDataStyle, this.mediumScreenLayout);
          } else if (screenSizeInitial < 768 && (screenSizeInitial > 420 || screenSizeInitial === 420)) {
            Plotly.update(element, this.mediumScreenDataStyle, this.mediumSmallScreenLayout);
          } else if (screenSizeInitial < 420) {
            Plotly.update(element, this.mediumScreenDataStyle, this.smallScreenLayout);
          } else {
            Plotly.update(element, this.defaultScreenDataStyle, this.defaultScreenLayout);
          }
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
