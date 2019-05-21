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
  newScreenWidth;
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
  @HostListener('window:resize', ['$event.target']) onResize(event) {
    console.log('inside hostlistener function');
    console.log('width: ', event.innerWidth);
    console.log('width: ', event.innerHeight);
    this.newScreenWidth = event.innerWidth;
    const mediumScreenDataStyle = {
      marker: [
        { size: '4', color: 'black' },
        { size: '4', color: 'black' },
        { size: '4', color: 'black' },
        { size: '4', color: 'black' },
        { size: '4', color: 'orange' },
        { size: '4', color: 'orange' },
        { size: '4', color: 'orange' },
        { size: '4', color: 'orange' },
        { size: '4', color: 'cornflowerblue' },
        { size: '4', color: 'cornflowerblue' },
        { size: '4', color: 'cornflowerblue' },
        { size: '4', color: 'cornflowerblue' },
      ]
    };
    const mediumScreenLayout = {
      font: { size: '10' },
      width: '460',
      height: '800',
      legend: {
        orientation: 'h',
        x: '0',
        y: '1.06',
        font: {
          size: '9.5'
        },
      }
    };

    const mediumLargeScreenDataStyle = {
      marker: [
        { size: '5', color: 'black' },
        { size: '5', color: 'black' },
        { size: '5', color: 'black' },
        { size: '5', color: 'black' },
        { size: '5', color: 'orange' },
        { size: '5', color: 'orange' },
        { size: '5', color: 'orange' },
        { size: '5', color: 'orange' },
        { size: '5', color: 'cornflowerblue' },
        { size: '5', color: 'cornflowerblue' },
        { size: '5', color: 'cornflowerblue' },
        { size: '5', color: 'cornflowerblue' },
      ]
    };
    const mediumLargeScreenLayout = {
      font: { size: '11' },
      width: '580',
      height: '1020',
      legend: {
        orientation: 'h',
        x: '0.05',
        y: '1.04',
        font: {
          size: '10'
        },
      }

    };
    const responsiveFitParPlot = this.d3.select(this.elem.nativeElement).node();
    if (this.newScreenWidth < 1440 && (this.newScreenWidth > 1024 || this.newScreenWidth === 1024)) {
      
      Plotly.update(responsiveFitParPlot, mediumLargeScreenDataStyle, mediumLargeScreenLayout);
    } else if (this.newScreenWidth < 1024 && (this.newScreenWidth > 768 || this.newScreenWidth === 768)) {
      Plotly.update(responsiveFitParPlot, mediumScreenDataStyle, mediumScreenLayout);
    }
  }
  ngOnInit() {
    const screenSizeInitial = window.innerWidth;
    console.log('inside fit pat on init - window size: ', screenSizeInitial);
    const element = this.elem.nativeElement;

    // const mediumScreenLayout = {
    //   font: { size: '11' },
    //   width: '400',
    //   legend: {
    //     x: '-1',
    //     y: '1',
    //     font: {
    //       size: '9.5'
    //     }
    //   },
    //   orientation: 'h'
    // };
    // const responsiveFitParPlot = this.d3.select(this.elem.nativeElement).node();

    // window.onresize = function() {
    //   console.log('window resized!');
    //   const screenHeight = window.innerHeight;
    //   const screenWidth = window.innerWidth;
    //   console.log('height now is: ', screenHeight);
    //   console.log('width now is: ', screenWidth);

    //   if (screenHeight < 800) {
    //     Plotly.update(responsiveFitParPlot, {}, mediumScreenLayout);
    //   }
    // };

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
