import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { MousePlotsService } from '../mouse-plots.service';
import { Subscription } from 'rxjs';

declare var Plotly: any;

@Component({
  selector: 'app-water-weight-plot',
  templateUrl: './water-weight-plot.component.html',
  styleUrls: ['./water-weight-plot.component.css']
})
export class WaterWeightPlotComponent implements OnInit, OnDestroy {
  d3 = Plotly.d3;
  newScreenWidth;
  WIWPlotIsAvailable: boolean;
  // svgDownloadIcon = {
  //   'width': 1000,
  //   'height': 1000,
  //   'transform': 'matrix(1 0 0 -1)',
  //   'transform': 'scale(2.95)',
  //   'path': 'M166.95,191h4.1A6.61,6.61,0,0,1,166.95,191ZM339,338H16A16,16,0,0,1,0,322V207a16,16,0,0,1,16-16H339a16,16,0,0,1,16,16V322A16,16,0,0,1,339,338ZM305,214.84q-7-7-19.69-7H266.94q-12.73,0-19.7,7t-7,19.7v57.28q0,12.56,7,19.61t19.7,7h18.41q12.55,0,19.6-7T312,291.81v-28.9q0-3.61-3.61-3.61H279.5a2.58,2.58,0,0,0-2.92,2.92V271a2.58,2.58,0,0,0,2.92,2.92h13.93c1.26,0,1.89.58,1.89,1.72v15.48q0,12.72-12.38,12.72H269.35q-12.39,0-12.38-12.72v-55.9q0-12.73,12.38-12.73h13.59q12.38,0,12.38,12.73v5.5q0,3.1,2.93,3.1h10.84q2.93,0,2.93-3.1v-6.19Q312,221.81,305,214.84Zm-101.22-7a3.31,3.31,0,0,0-3.44,2.92l-22,89.79h-.69L155.49,210.8q-.51-2.92-3.27-2.92H140q-3.61,0-2.58,3.27L166,315.54a3.39,3.39,0,0,0,3.61,2.92h17c1.72,0,2.81-1,3.27-2.92l28.73-104.4c.57-2.18-.35-3.27-2.75-3.27Zm-91.16,63a21,21,0,0,0-8.09-8.6,49.94,49.94,0,0,0-11-4.55,91.58,91.58,0,0,0-12-2.58q-5.93-.86-10.92-2.06-11.19-2.74-11.18-10.49v-5.33q0-8.08,3.18-11.44t10.58-3.35H84.11q7.4,0,10.58,3.18t3.18,10.58v2.24a2.58,2.58,0,0,0,2.93,2.92h11a2.58,2.58,0,0,0,2.93-2.92v-3.78q0-12.56-7.14-19.7t-19.87-7.14H69.49q-12.56,0-19.7,7.14t-7.14,19.7v7.22q0,9.64,4.21,15.83a21.31,21.31,0,0,0,10.41,8.42,119.81,119.81,0,0,0,13.59,4q7.4,1.72,13.59,2.66a22.59,22.59,0,0,1,10.41,4.13,10.31,10.31,0,0,1,4.21,8.68v4q0,7.57-3.26,10.92t-10.67,3.35H73.27q-7.4,0-10.58-3.18t-3.18-10.4v-3.1a2.59,2.59,0,0,0-2.93-2.92h-11a2.59,2.59,0,0,0-2.93,2.92v4.47q0,12.57,7.23,19.7t19.78,7.14H88.93q12.55,0,19.69-7.14t7.14-19.7v-6.71A29.29,29.29,0,0,0,112.66,270.91ZM270.9,126a6.59,6.59,0,0,0-3.82-12H195V0H159.38V114H86.92a6.59,6.59,0,0,0-3.82,12l90.08,64.15a6.47,6.47,0,0,0,1.77.89h4.1a6.42,6.42,0,0,0,1.78-.89Z',
  // };
  // pngDownloadIcon = {
  //   'width': 1000,
  //   'height': 1000,
  //   'transform': 'matrix(1 0 0 -1)',
  //   'transform': 'scale(2.95)',
  //   'path': 'M339,191H16A16,16,0,0,0,0,207V322a16,16,0,0,0,16,16H339a16,16,0,0,0,16-16V207A16,16,0,0,0,339,191ZM111.82,254.12c0,8.37-.35,14.91-5.05,19.61s-13.24,7.05-21.61,7.05L59,281c0-4.78,0-15,0-15H82.75Q95,266,95,253.26V236.92q0-12.73-12.21-12.73H59.87c-1.26,0-1.89.58-1.89,1.72v91.33a2.58,2.58,0,0,1-2.92,2.92H44.22a2.58,2.58,0,0,1-2.92-2.92V212.5a2.58,2.58,0,0,1,2.92-2.92H85.16q12.55,0,19.61,7t7.05,19.69Zm102,64.42a2.58,2.58,0,0,1-2.92,2.92h-9.29a5.12,5.12,0,0,1-4.47-2.75l-41.28-74h-.69v73.79a2.58,2.58,0,0,1-2.92,2.92H141.55a2.58,2.58,0,0,1-2.92-2.92V213.8a2.58,2.58,0,0,1,2.92-2.92h9.63a3.93,3.93,0,0,1,3.78,1.89l41.62,74.82h.69V213.8a2.58,2.58,0,0,1,2.92-2.92h10.66a2.59,2.59,0,0,1,2.92,2.92ZM316.3,243.73q0,3.1-2.92,3.1H302.54q-2.93,0-2.92-3.1v-5.5q0-12.73-12.38-12.73H273.65q-12.38,0-12.38,12.73v55.9q0,12.73,12.38,12.73h13.59q12.38,0,12.38-12.73V278.64q0-1.72-1.89-1.72H283.79a2.58,2.58,0,0,1-2.92-2.92v-8.77a2.58,2.58,0,0,1,2.92-2.92h28.9q3.61,0,3.61,3.61v28.9q0,12.56-7.05,19.61t-19.61,7.05h-18.4q-12.73,0-19.69-7.05t-7-19.61V237.53q0-12.73,7-19.69t19.69-7h18.4q12.73,0,19.69,7t7,19.69ZM262.9,126a6.59,6.59,0,0,0-3.82-12H187V0H151.38V114H78.92a6.59,6.59,0,0,0-3.82,12l90.08,64.15a6.47,6.47,0,0,0,1.77.89H171a6.42,6.42,0,0,0,1.78-.89Z'
  // };

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
        // icon: this.pngDownloadIcon,
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
        // icon: this.svgDownloadIcon,
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

  private mouseWaterWeightSubscription: Subscription;

  smallScreenLayout = {
    font: { size: '10' },
    'margin.l': '44',
    'legend.font.size': '9',
    width: '518',
    height: '320',
  };
  mediumSmallScreenLayout = {
    font: { size: '10.5' },
    'legend.font.size': '',
    'margin.l': '78',
    width: '725',
    height: '385'
  };
  mediumScreenDataStyle = {
    'marker.size': ['3.5'],
    'line.width': ['1']
  };

  mediumScreenLayout = {
    font: { size: '10.5' },
    'legend.font.size': '',
    'margin.l': '78',
    width: '921',
    height: '400'
  };

  mediumLargeScreenDataStyle = {
    'marker.size': ['4'],
    'line.width': ['1.5']
  };
  mediumLargeScreenLayout = {
    font: { size: '11' },
    'legend.font.size': '',
    width: '1100',
    height: '420'
  };

  defaultScreenDataStyle = {
    'marker.size': ['6'],
    'line.width': ['2']
  };
  defaultScreenLayout = {
    font: { size: '12' },
    'legend.font.size': '',
    'margin.l': '100',
    width: '1200',
    height: '440'
  };

  @Input() mouseInfo: Object;
  @Output() WIWPlotAvailability: EventEmitter<any> = new EventEmitter();
  constructor(public mousePlotsService: MousePlotsService) { }

  @ViewChild('waterIntake_weight_plot') el: ElementRef;
  @HostListener('window:resize', ['$event.target']) onresize(event) {
    this.newScreenWidth = event.innerWidth;
    // console.log('new screenwidth: ', this.newScreenWidth);
    const responsiveWWIplot = this.d3.select(this.el.nativeElement).node();
    if (this.newScreenWidth < 420) {
      Plotly.update(responsiveWWIplot, this.mediumScreenDataStyle, this.smallScreenLayout);
    } else if (this.newScreenWidth < 768 && (this.newScreenWidth > 420 || this.newScreenWidth === 420)) {
      Plotly.update(responsiveWWIplot, this.mediumScreenDataStyle, this.mediumSmallScreenLayout);
    } else if (this.newScreenWidth < 1024 && (this.newScreenWidth > 768 || this.newScreenWidth === 768)) {
      Plotly.update(responsiveWWIplot, this.mediumScreenDataStyle, this.mediumScreenLayout);
    } else if (this.newScreenWidth < 1440 && (this.newScreenWidth > 1024 || this.newScreenWidth === 1024)) {
      Plotly.update(responsiveWWIplot, this.mediumLargeScreenDataStyle, this.mediumLargeScreenLayout);
    } else {
      Plotly.update(responsiveWWIplot, this.defaultScreenDataStyle, this.defaultScreenLayout);
    }
  }
  ngOnInit() {
    const screenSizeInitial = window.innerWidth;
    const element = this.el.nativeElement;
    const subjectInfo = { 'subject_uuid': this.mouseInfo['subject_uuid'] };
    this.mousePlotsService.getWaterWeightPlot(subjectInfo);
    this.mouseWaterWeightSubscription = this.mousePlotsService.getWaterWeightPlotLoadedListener()
      .subscribe((plotInfo: any) => {
        if (plotInfo && plotInfo[0]) {
          const toPlot = plotInfo[Object.entries(plotInfo).length - 1];
          const WIWplot = toPlot['water_weight'];
          // WIWplot['layout']['height'] = '';
          // WIWplot['layout']['width'] = '';
          WIWplot['layout']['legend'] = {
            'orientation': 'v',
              x: 1.1,
              y: 1.16
          };
          WIWplot['layout']['plot_bgcolor'] = 'rgba(0, 0, 0, 0)';
          WIWplot['layout']['paper_bgcolor'] = 'rgba(0, 0, 0, 0)';
          WIWplot['layout']['modebar'] = { bgcolor: 'rgba(255, 255, 255, 0)' };
          this.WIWPlotIsAvailable = true;
          this.WIWPlotAvailability.emit(this.WIWPlotIsAvailable);
          this.plotConfig['toImageButtonOptions']['filename'] = this.mouseInfo['subject_nickname'] + '_water_intake_weight_plot';

          Plotly.newPlot(element, WIWplot['data'], WIWplot['layout'], this.plotConfig);
          if (screenSizeInitial < 420) {
            Plotly.update(element, this.mediumScreenDataStyle, this.smallScreenLayout);
          } else if (screenSizeInitial < 768 && (screenSizeInitial > 420 || screenSizeInitial === 420)) {
            Plotly.update(element, this.mediumScreenDataStyle, this.mediumSmallScreenLayout);
          } else if (screenSizeInitial < 1024 && (screenSizeInitial > 768 || screenSizeInitial === 768)) {
            Plotly.update(element, this.mediumScreenDataStyle, this.mediumScreenLayout);
          } else if (screenSizeInitial < 1440 && (screenSizeInitial > 1024 || screenSizeInitial === 1024)) {
            Plotly.update(element, this.mediumLargeScreenDataStyle, this.mediumLargeScreenLayout);
          } else {
            Plotly.update(element, this.defaultScreenDataStyle, this.defaultScreenLayout);
          }
        } else {
          // console.log('water intake and weight plot not available for this mouse');
          this.WIWPlotIsAvailable = false;
          this.WIWPlotAvailability.emit(this.WIWPlotIsAvailable);
        }
      });

  }

  ngOnDestroy() {
    if (this.mouseWaterWeightSubscription) {
      this.mouseWaterWeightSubscription.unsubscribe();
    }
  }

}
