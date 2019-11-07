import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { MousePlotsService } from '../mouse-plots.service';

declare var Plotly: any;
@Component({
  selector: 'app-contrast-heatmap-plot',
  templateUrl: './contrast-heatmap-plot.component.html',
  styleUrls: ['./contrast-heatmap-plot.component.css']
})
export class ContrastHeatmapPlotComponent implements OnInit, OnDestroy {
  d3 = Plotly.d3;
  newScreenWidth;
  contrastHeatmapPlotIsAvailable: boolean;
  plotLoading: boolean;
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

  smallScreenLayout = {
    'font.size': '10',
    'margin.l': '45',
    width: '410',
    height: '310'
  };

  mediumSmallScreenLayout = {
    'font.size': '10',
    'margin.l': '77',
    width: '589',
    height: '340'
  };


  mediumScreenDataStyle = {
    colorbar: { thickness: '7' }
  };
  mediumScreenLayout = {
    font: { size: '10.5' },
    'margin.l': '78',
    width: '766',
    height: '360'
  };

  mediumLargeScreenDataStyle = {
    colorbar: { thickness: '6' }
  };
  mediumLargeScreenLayout = {
    font: { size: '11' },
    'margin.l': '67',
    width: '520',
    height: '360'
  };

  defaultScreenDataStyle = {
    colorbar: { thickness: '7' }
  };
  defaultScreenLayout = {
    font: { size: '12' },
    'margin.l': '67',
    width: '600',
    height: '400'
  };


  private contrastHeatmapPlotSubscription: Subscription;

  @Output() contrastHeatmapPlotAvailability: EventEmitter<any> = new EventEmitter();
  @Input() mouseInfo: Object;
  @ViewChild('contrastHeatmapPlot') elem: ElementRef;
  constructor(public mousePlotsService: MousePlotsService) { }

  @HostListener('window:resize', ['$event.target']) onresize(event) {
    this.newScreenWidth = event.innerWidth;
    const responsiveCHplot = this.d3.select(this.elem.nativeElement).node();
    if (this.newScreenWidth < 420) {
      Plotly.update(responsiveCHplot, this.mediumScreenDataStyle, this.smallScreenLayout);
    } else if (this.newScreenWidth < 768 && (this.newScreenWidth > 420 || this.newScreenWidth === 420)) {
      Plotly.update(responsiveCHplot, this.mediumScreenDataStyle, this.mediumSmallScreenLayout);
    }  else if (this.newScreenWidth < 1024 && (this.newScreenWidth > 768 || this.newScreenWidth === 768)) {
      Plotly.update(responsiveCHplot, this.mediumScreenDataStyle, this.mediumScreenLayout);
    } else if (this.newScreenWidth < 1440 && (this.newScreenWidth > 1024 || this.newScreenWidth === 1024)) {
      Plotly.update(responsiveCHplot, this.mediumLargeScreenDataStyle, this.mediumLargeScreenLayout);
    } else {
      Plotly.update(responsiveCHplot, this.defaultScreenDataStyle, this.defaultScreenLayout);
    }
  }
  ngOnInit() {
    this.plotLoading = true;
    const screenSizeInitial = window.innerWidth;
    const element = this.elem.nativeElement;
    this.mousePlotsService.getContrastHeatMapPlot({'subject_uuid': this.mouseInfo['subject_uuid']});
    this.contrastHeatmapPlotSubscription = this.mousePlotsService.getContrastHeatmapPlotLoadedListener()
      .subscribe((plotInfo) => {
        if (plotInfo && plotInfo[0]) {
          const toPlot = plotInfo[Object.entries(plotInfo).length - 1];
          const contrastHeatmapPlot = toPlot['contrast_heatmap'];
          if (contrastHeatmapPlot['data'] && contrastHeatmapPlot['data'].length > 0) {
            this.defaultScreenDataStyle['hoverinfo'] = [''].concat(Array(contrastHeatmapPlot['data'].length - 1).fill('skip'));
            this.mediumScreenDataStyle['hoverinfo'] = [''].concat(Array(contrastHeatmapPlot['data'].length - 1).fill('skip'));
            this.mediumLargeScreenDataStyle['hoverinfo'] = [''].concat(Array(contrastHeatmapPlot['data'].length - 1).fill('skip'));

          }
          contrastHeatmapPlot['layout']['legend'] = {
            orientation: 'h',
            x: '0.05',
            y: '-0.15'
          };
          contrastHeatmapPlot['layout']['plot_bgcolor'] = 'rgba(0, 0, 0, 0)';
          contrastHeatmapPlot['layout']['paper_bgcolor'] = 'rgba(0, 0, 0, 0)';
          contrastHeatmapPlot['layout']['modebar'] = { bgcolor: 'rgba(255, 255, 255, 0)' };
          this.plotLoading = false;
          this.contrastHeatmapPlotIsAvailable = true;
          this.contrastHeatmapPlotAvailability.emit(this.contrastHeatmapPlotIsAvailable);
          this.plotConfig['toImageButtonOptions']['filename'] = this.mouseInfo['subject_nickname'] + '_contrast_heatmap_plot';
          Plotly.newPlot(element, contrastHeatmapPlot['data'], contrastHeatmapPlot['layout'], this.plotConfig);
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
          console.log('contrast heatmap plot unavailable');
          this.plotLoading = false;
          this.contrastHeatmapPlotIsAvailable = false;
          this.contrastHeatmapPlotAvailability.emit(this.contrastHeatmapPlotIsAvailable);
        }
      });
  }

  ngOnDestroy() {
    if (this.contrastHeatmapPlotSubscription) {
      this.contrastHeatmapPlotSubscription.unsubscribe();
    }
  }

}
