import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlotsService } from '../../plots.service';

declare var Plotly: any;

@Component({
  selector: 'app-sample-plot',
  templateUrl: './sample-plot.component.html',
  styleUrls: ['./sample-plot.component.css']
})
export class SamplePlotComponent implements OnInit, OnDestroy {
  plots;
  private plotsSubscription: Subscription;

  @ViewChild('samplePlot') el: ElementRef;

  constructor(public plotsService: PlotsService) {}

  ngOnInit() {
    this.plotsService.getPlots();
    this.plotsSubscription = this.plotsService.getPlotUpdateListener()
      .subscribe((plots: any) => {
        this.plots = plots;
        // console.log('plots in component subscription is:');
        // console.log(plots);
        this.plotSample(this.plots);
    });

  }

  ngOnDestroy() {
    this.plotsSubscription.unsubscribe();
  }

  plotSample(plot) {
    const element = this.el.nativeElement;
    console.log('plots for samplePlot are: ');
    console.log(plot);

    // Plotly.d3.json('assets/plotData/data_dateTime_weight1.json', function (fig) {
    // Plotly.d3.json(plot, function (fig) {
    // Plotly.d3.json('http://localhost:3000/api/plots/scatter/1', function (fig) {
    //   const data = [fig];
    //   const layout = {
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
    //     // images: [{
    //     //   name: 'watermark_1',
    //     //   source: '../static/images/monochromeDJ.png',
    //     //   xref: 'paper',
    //     //   yref: 'paper',
    //     //   x: 0.30,
    //     //   y: 0.9,
    //     //   sizex: 0.7,
    //     //   sizey: 0.7,
    //     //   opacity: 0.05,
    //     //   layer: 'below'
    //     // }],
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
    //   };
    //   const config = {
    //     modeBarButtonsToRemove: ['sendDataToCloud'],
    //     displaylogo: false,
    //     modeBarButtonsToAdd: [{
    //       name: 'toImage2',
    //       icon: Plotly.Icons.camera,
    //       click: function (gd) {
    //         Plotly.downloadImage(gd);
    //       }
    //     }],
    //     toImageButtonOptions: {
    //       format: 'svg', // one of png, svg, jpeg, webp
    //       filename: 'custom_image',
    //       height: 1300,
    //       width: 1700,
    //       scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
    //     }
    //   };

    //   Plotly.plot(element, data, layout, config);
    // });


    const layout = {
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
      const config = {
        modeBarButtonsToRemove: ['sendDataToCloud'],
        displaylogo: false,
        modeBarButtonsToAdd: [{
          name: 'toImage2',
          icon: Plotly.Icons.camera,
          click: function (gd) {
            Plotly.downloadImage(gd);
          }
        }],
        toImageButtonOptions: {
          format: 'svg', // one of png, svg, jpeg, webp
          filename: 'custom_image',
          height: 1300,
          width: 1700,
          scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
        }
      };
    Plotly.plot(element, [plot], layout, config);
  }

}
