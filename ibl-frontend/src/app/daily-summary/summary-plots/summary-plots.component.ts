import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { DailySummaryService } from '../daily-summary.service';

declare var Plotly: any;
@Component({
  selector: 'app-summary-plots',
  templateUrl: './summary-plots.component.html',
  styleUrls: ['./summary-plots.component.css']
})
export class SummaryPlotsComponent implements OnInit, OnDestroy {
  currentWWIplot;
  currentTCSDplot;
  currentPRTplot;
  currentCHplot;
  plotsInfo;
  plotConfig = {
    responsive: true,
    showLink: false,
    showSendToCloud: false,
    displaylogo: false,
    // displayModeBar: false,
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

  dataSetup = {};

  private summaryPlotsSubscription: Subscription;
  @Input() mouseInfo: {};
  @Input() plotsCollapsed: {};
  constructor(public dailySummaryService: DailySummaryService) { }

  @ViewChild('waterWeightPlot') WWIplot: ElementRef;
  @ViewChild('trialCountsSessionDurationPlot') TCSDplot: ElementRef;
  @ViewChild('performanceReactionTimePlot') PRTplot: ElementRef;
  @ViewChild('contrastHeatmapPlot') CHplot: ElementRef;
  ngOnInit() {
    const WWIplotElem = this.WWIplot.nativeElement;
    const TCSDplotElem = this.TCSDplot.nativeElement;
    const PRTplotElem = this.PRTplot.nativeElement;
    const CHplotElem = this.CHplot.nativeElement;
    this.dailySummaryService.getSummaryPlots({'subject_uuid': this.mouseInfo['subject_uuid']});
    this.summaryPlotsSubscription = this.dailySummaryService.getSummaryPlotsLoadedListener()
      .subscribe((plotsInfo: any) => {
        this.plotsInfo = plotsInfo;
        if (plotsInfo && plotsInfo[0]) {
          if (plotsInfo[0]['subject_uuid'] !== this.mouseInfo['subject_uuid']) return;
          // console.log('printing daily summary plotsInfo for', plotsInfo[0]['subject_uuid']);
          // console.log('info returned in request for: ', this.mouseInfo['subject_uuid']);
          // console.log('=====================================');
          const WWIplotInfo = plotsInfo[0]['water_weight'];
          const TCSDplotInfo = plotsInfo[0]['trial_counts_session_duration'];
          const PRTplotInfo = plotsInfo[0]['performance_reaction_time'];
          const CHplotInfo = plotsInfo[0]['contrast_heatmap'];
          // WWIplotInfo['layout']['width'] = '';
          // WWIplotInfo['layout']['height'] = '300';
          const plotConfigWWI = Object.assign({}, this.plotConfig,
            { toImageButtonOptions:
                { filename: this.mouseInfo['subject_nickname'] + '_water_intake_weight_plot' }
            });
          const plotConfigTCSD = Object.assign({}, this.plotConfig,
            { toImageButtonOptions:
              { filename: this.mouseInfo['subject_nickname'] + '_trial_counts_session_duration_plot' }
            });
          const plotConfigPRT = Object.assign({}, this.plotConfig,
            { toImageButtonOptions:
              { filename: this.mouseInfo['subject_nickname'] + '_performance_reaction_time_plot' }
            });
          const plotConfigCH = Object.assign({}, this.plotConfig,
            { toImageButtonOptions:
                { filename: this.mouseInfo['subject_nickname'] + '_contrast_heatmap_plot' }
            });
          WWIplotInfo['layout']['legend']['bgcolor'] = 'rgba(0, 0, 0, 0)';
          WWIplotInfo['layout']['height'] = '400';
          WWIplotInfo['layout']['width'] = '';
          WWIplotInfo['layout']['margin'] =  {l: '35'};
          WWIplotInfo['layout']['legend'] = {
            font: {size: '9.75'},
            x: '1.08'
          };
          for (const datum of WWIplotInfo['data']) {
            if (datum['name'] === 'Mondays') {
              datum['hoverinfo'] = 'skip';
            }
          }

          TCSDplotInfo['layout']['width'] = '535';
          TCSDplotInfo['layout']['legend'] = {
            orientation: 'h',
            y: '-0.09', font: {size: '9.75'},
            bgcolor: 'rgba(0, 0, 0, 0)',
          };
          for (const datum of TCSDplotInfo['data']) {
            if (datum['name'] === 'Mondays') {
              datum['hoverinfo'] = 'skip';
            } else if (datum['name'] === 'first day got trained' || datum['name'] === 'first day got biased') {
              datum['hoverinfo'] = 'x';
            }
          }
          PRTplotInfo['layout']['width'] = '535';
          PRTplotInfo['layout']['legend'] = {
            orientation: 'h',
            bgcolor: 'rgba(0, 0, 0, 0)',
            y: '-0.09', font: { size: '9.75' }
          };
          for (const datum of PRTplotInfo['data']) {
            if (datum['name'] === 'Mondays') {
              datum['hoverinfo'] = 'skip';
            } else if (datum['name'] === 'first day got trained' || datum['name'] === 'first day got biased') {
              datum['hoverinfo'] = 'x';
            }
          }
          CHplotInfo['layout']['width'] = '540';
          CHplotInfo['layout']['legend'] = {
            orientation: 'h',
            bgcolor: 'rgba(0, 0, 0, 0)',
            y: '-0.12', font: { size: '9.75' }
          };
          for (const datum of CHplotInfo['data']) {
            if (datum['name'] === 'Mondays') {
              datum['hoverinfo'] = 'skip';
            }
          }
          Plotly.newPlot(WWIplotElem, WWIplotInfo['data'], WWIplotInfo['layout'], plotConfigWWI);
          Plotly.newPlot(TCSDplotElem, TCSDplotInfo['data'], TCSDplotInfo['layout'], plotConfigTCSD);
          Plotly.newPlot(PRTplotElem, PRTplotInfo['data'], PRTplotInfo['layout'], plotConfigPRT);
          Plotly.newPlot(CHplotElem, CHplotInfo['data'], CHplotInfo['layout'], plotConfigCH);
        } else {
          console.log('trouble loading daily summary info for:', plotsInfo);
        }
      });
  }

  ngOnDestroy() {
    if (this.summaryPlotsSubscription) {
      this.summaryPlotsSubscription.unsubscribe();
    }
  }

}
