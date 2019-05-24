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

  mediumScreenDataStyle = {
    colorbar: { thickness: '7' }
  };
  mediumScreenLayout = {
    font: { size: '10' },
    width: '460',
    height: '390'
  };

  mediumSmallScreenLayout = {
    font: { size: '10' },
    width: '412',
    height: '340'
  };

  mediumLargeScreenDataStyle = {
    // colorbar: { thickness: '8.5' }
  };
  mediumLargeScreenLayout = {
    font: { size: '11' },
    width: '500',
    height: '420'
  };

  defaultScreenDataStyle = {
    // colorbar: { thickness: '10' }
  };
  defaultScreenLayout = {
    font: { size: '12' },
    width: '',
    height: ''
  };

  smallScreenLayout = {
    font: { size: '10.5' },
    width: '',
    height: '330'
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
    } else if (this.newScreenWidth < 876 && (this.newScreenWidth > 768 || this.newScreenWidth === 768)) {
      Plotly.update(responsiveCHplot, this.mediumScreenDataStyle, this.mediumSmallScreenLayout);
    } else if (this.newScreenWidth < 1024 && (this.newScreenWidth > 876 || this.newScreenWidth === 876)) {
      Plotly.update(responsiveCHplot, this.mediumScreenDataStyle, this.mediumScreenLayout);
    } else if (this.newScreenWidth < 1440 && (this.newScreenWidth > 1024 || this.newScreenWidth === 1024)) {
      Plotly.update(responsiveCHplot, this.mediumLargeScreenDataStyle, this.mediumLargeScreenLayout);
    } else {
      Plotly.update(responsiveCHplot, this.defaultScreenDataStyle, this.defaultScreenLayout);
    }
  }
  ngOnInit() {
    const screenSizeInitial = window.innerWidth;
    const element = this.elem.nativeElement;
    this.mousePlotsService.getContrastHeatMapPlot({'subject_uuid': this.mouseInfo['subject_uuid']});
    this.contrastHeatmapPlotSubscription = this.mousePlotsService.getContrastHeatmapPlotLoadedListener()
      .subscribe((plotInfo) => {
        if (plotInfo && plotInfo[0]) {
          const toPlot = plotInfo[Object.entries(plotInfo).length - 1];
          const contrastHeatmapPlot = toPlot['contrast_heatmap'];
          contrastHeatmapPlot['layout']['height'] = '';
          contrastHeatmapPlot['layout']['width'] = '';
          contrastHeatmapPlot['layout']['plot_bgcolor'] = 'rgba(0, 0, 0, 0)';
          contrastHeatmapPlot['layout']['paper_bgcolor'] = 'rgba(0, 0, 0, 0)';
          this.contrastHeatmapPlotIsAvailable = true;
          this.contrastHeatmapPlotAvailability.emit(this.contrastHeatmapPlotIsAvailable);
          this.plotConfig['toImageButtonOptions']['filename'] = this.mouseInfo['subject_nickname'] + '_contrast_heatmap_plot';
          Plotly.newPlot(element, contrastHeatmapPlot['data'], contrastHeatmapPlot['layout'], this.plotConfig);
          if (screenSizeInitial < 420) {
            Plotly.update(element, this.mediumScreenDataStyle, this.smallScreenLayout);
          } else if (screenSizeInitial < 876 && (screenSizeInitial > 420 || screenSizeInitial === 420)) {
            Plotly.update(element, this.mediumScreenDataStyle, this.mediumSmallScreenLayout);
          } else if (screenSizeInitial < 1024 && (screenSizeInitial > 876 || screenSizeInitial === 876)) {
            Plotly.update(element, this.mediumScreenDataStyle, this.mediumScreenLayout);
          } else if (screenSizeInitial < 1440 && (screenSizeInitial > 1024 || screenSizeInitial === 1024)) {
            Plotly.update(element, this.mediumLargeScreenDataStyle, this.mediumLargeScreenLayout);
          }
        } else {
          console.log('contrast heatmap plot unavailable');
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
