import { Component, OnInit, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy, Inject } from '@angular/core';
import { ViewSamplePlotsComponent } from '../view-sample-plots.component';
import { Subscription, Observable } from 'rxjs';
import { PlotsService } from '../../../plots.service';

declare var Plotly: any;

@Component({
  selector: 'app-sample-plot',
  templateUrl: './sample-plot.component.html',
  styleUrls: ['./sample-plot.component.css']
})
export class SamplePlotComponent implements OnInit, OnChanges, OnDestroy {
  plots;
  loading: boolean;
  plotInfo = { type: 'water_administration', id: 1};

  private plotsSubscription: Subscription;


  @ViewChild('samplePlot') el: ElementRef;
  constructor(public plotsService: PlotsService, @Inject(ViewSamplePlotsComponent) public VSPComp: ViewSamplePlotsComponent) {}

  ngOnInit() {
    this.plotInfo = this.VSPComp.PMTComp.selectedPlot;
    console.log('VSPComp is');
    console.log(this.VSPComp);
    this.loading = true;
    this.plotsService.retrievePlot(this.plotInfo);
    // this.plotsService.getPlots('scatter', 1);
    Plotly.plot(this.el.nativeElement);
    this.plotsSubscription = this.plotsService.getPlotUpdateListener()
      .subscribe((plots: any) => {
        this.plots = plots;
        // console.log('plots in component subscription is:');
        // console.log(plots);
        this.loading = false;
        this.plotSample(this.plots);
    });

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ngOnChange in sample-plot comp');
    console.log(changes);
    // for (let testing in changes) {
    //   console.log(testing);
    //   console.log(changes[testing]);
    // }
  }

  ngOnDestroy() {
    this.plotsSubscription.unsubscribe();
  }

  plotSample(plot) {
    const element = this.el.nativeElement;
    // console.log('plots for samplePlot are: ');
    // console.log(plot);
    let layout;
    if (!plot.layout) {
      layout = {
        title: {
          text: 'DateTime x Weight(g)',
          font: {
            family: 'Courier New, monospace',
            size: 16,
            color: 'black'
          },
          xref: 'paper',
          x: 0.05,
        },
        images: [{
          name: 'watermark_1',
          source: '../assets/images/monochromeDJ.png',
          xref: 'paper',
          yref: 'paper',
          x: 0.30,
          y: 0.9,
          sizex: 0.7,
          sizey: 0.7,
          opacity: 0.05,
          layer: 'below'
        }],
        yaxis: {
          title: {
            text: 'Mouse Weight(g)',
            font: {
              family: 'Courier New, monospace',
              size: 12,
              color: '#7f7f7f'
            }
          },
          ticklen: 8,
          tickwidth: 4,
          tickcolor: 'pink'
        }
      };
    } else {
      layout = plot.layout;
      layout.images = [{
        name: 'watermark_1',
        source: '../assets/images/monochromeDJ.png',
        xref: 'paper',
        yref: 'paper',
        x: 0.30,
        y: 0.9,
        sizex: 0.7,
        sizey: 0.7,
        opacity: 0.05,
        layer: 'below'
      }];
    }
    // const layout = {
    //     title: {
    //       text: 'DateTime x Weight(g)',
    //       font: {
    //         family: 'Courier New, monospace',
    //         size: 16,
    //         color: 'black'
    //       },
    //       xref: 'paper',
    //       x: 0.05,
    //     },
    //     images: [{
    //       name: 'watermark_1',
    //       source: '../assets/images/monochromeDJ.png',
    //       xref: 'paper',
    //       yref: 'paper',
    //       x: 0.30,
    //       y: 0.9,
    //       sizex: 0.7,
    //       sizey: 0.7,
    //       opacity: 0.05,
    //       layer: 'below'
    //     }],
    //     yaxis: {
    //       title: {
    //         text: 'Mouse Weight(g)',
    //         font: {
    //           family: 'Courier New, monospace',
    //           size: 12,
    //           color: '#7f7f7f'
    //         }
    //       },
    //       ticklen: 8,
    //       tickwidth: 4,
    //       tickcolor: 'pink'
    //     }
    // };
    const config = {
      modeBarButtonsToRemove: ['sendDataToCloud'],
      displaylogo: false,
      // modeBarButtonsToAdd: [{
      //   name: 'toImage2',
      //   icon: Plotly.Icons.camera,
      //   click: function (gd) {
      //     Plotly.downloadImage(gd);
      //   }
      // }],
      toImageButtonOptions: {
        format: 'svg', // one of png, svg, jpeg, webp
        filename: 'svg_image',
        height: 1300,
        width: 1700,
        scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
      }
    };
    Plotly.plot(element, plot.data, layout, config);
  }

}
