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
  plotLoading: boolean;
  dataLen: number;
  newScreenWidth;
  plotConfig = {
    // responsive: true,
    showLink: false,
    showSendToCloud: false,
    displaylogo: false,
    modeBarButtonsToRemove: ['toImage', 'select2d', 'lasso2d'],
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
    'legend.font.size': '9.75',
    'xaxis2.showticklabels': false,
    'xaxis3.showticklabels': false,
    'xaxis4.showticklabels': false,
  };

  mediumSmallScreenLayout = {
    'font.size': '10',
    'margin.l': '',
    width: '707',
    height: '680',
    'legend.font.size': '9.5',
    'xaxis2.showticklabels': false,
    'xaxis3.showticklabels': false,
    'xaxis4.showticklabels': false,
  };

  mediumScreenDataStyle = {
    'marker.size': ['4']
  };
  mediumScreenLayout = {
    'font.size': '10.5',
    'margin.l': '',
    width: '900',
    height: '800',
    'legend.font.size': '9.5',
    'xaxis2.showticklabels': false,
    'xaxis3.showticklabels': false,
    'xaxis4.showticklabels': false,
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
    'legend.font.size': '10',
    'xaxis2.showticklabels': false,
    'xaxis3.showticklabels': false,
    'xaxis4.showticklabels': false,
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
    // if (this.dataLen > 4) {
      // first 12 are for 4 plots for p-left(0.5/0.2/0.8) traces, then horizontal dash (threshold for trained),
      // then comes the list of Mondays, last 2 are the first day references

      // set line width for Mondays and reference lines
      // this.mediumScreenDataStyle['line.width'] = Array(12).fill('').concat(['1'], Array(this.dataLen - 15).fill('0.25'), ['1', '1']);
      // this.mediumLargeScreenDataStyle['line.width'] =
      //     Array(12).fill('').concat(['1.5'], Array(this.dataLen - 15).fill('0.35'), ['1.5', '1.5']);
      // this.defaultScreenDataStyle['line.width'] = Array(12).fill('').concat(['2'], Array(this.dataLen - 15).fill('0.5'), ['2', '2']);
    // }
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
    this.plotLoading = true;
    const screenSizeInitial = window.innerWidth;
    const element = this.elem.nativeElement;

    this.mousePlotsService.getFitParametersPlot({'subject_uuid': this.mouseInfo['subject_uuid']});
    this.fitParPlotsSubscription = this.mousePlotsService.getFitParPlotsLoadedListener()
    .subscribe((plotsInfo: any) => {
        if (plotsInfo && plotsInfo[0]) {
          const toPlot = plotsInfo[Object.entries(plotsInfo).length - 1];
          const fitParPlots = toPlot['fit_pars'];
          this.dataLen = fitParPlots['data'].length;
          fitParPlots['layout']['yaxis']['title']['text'] = '<i>Lapse High (\u03BB)</i>'; // lambda
          fitParPlots['layout']['yaxis2']['title']['text'] = '<i>Lapse Low (\u03B3)</i>'; // gamma
          fitParPlots['layout']['yaxis3']['title']['text'] = '<i>Bias (&mu;)</i>';
          fitParPlots['layout']['yaxis4']['title']['text'] = '<i>Threshold (\u03A3)</i>';
          fitParPlots['layout']['plot_bgcolor'] = 'rgba(0, 0, 0, 0)';
          fitParPlots['layout']['paper_bgcolor'] = 'rgba(0, 0, 0, 0)';
          fitParPlots['layout']['modebar'] = { bgcolor: 'rgba(255, 255, 255, 0)' };
          this.mediumScreenDataStyle['line.width'] = [];
          this.mediumLargeScreenDataStyle['line.width'] = [];
          this.defaultScreenDataStyle['line.width'] = [];
          for (const datum of fitParPlots['data']) {
            if (datum['name'] === 'Mondays') {
              // setting different line width
              this.mediumScreenDataStyle['line.width'].push('0.25');
              this.mediumLargeScreenDataStyle['line.width'].push('0.35');
              this.defaultScreenDataStyle['line.width'].push('0.5');
            } else if (datum['name'] === 'first day got trained' || datum['name'] === 'first day got biased') {
              this.mediumScreenDataStyle['line.width'].push('1');
              this.mediumLargeScreenDataStyle['line.width'].push('1.5');
              this.defaultScreenDataStyle['line.width'].push('2');
            } else { // probably for threshold for trained dash line
              this.mediumScreenDataStyle['line.width'].push('1');
              this.mediumLargeScreenDataStyle['line.width'].push('1');
              this.defaultScreenDataStyle['line.width'].push('1');
            }
          }
          this.plotLoading = false;
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
          this.plotLoading = false;
          this.fitParPlotsAreAvailable = false;
          this.fitParPlotsAvailability.emit(this.fitParPlotsAreAvailable);
          // console.log('fit parameters plots not available');
        }
      });
  }

  ngOnDestroy() {
    if (this.fitParPlotsSubscription) {
      this.fitParPlotsSubscription.unsubscribe();
    }
  }

}
