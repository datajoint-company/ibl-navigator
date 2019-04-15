import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { PlotMenuToggleComponent } from './plot-menu-toggle/plot-menu-toggle.component';


import { Subscription } from 'rxjs';
import { PlotsService } from '../../plots.service';

declare var Plotly: any;

@Component({
  selector: 'app-view-sample-plots',
  templateUrl: './view-sample-plots.component.html',
  styleUrls: ['./view-sample-plots.component.css']
})
export class ViewSamplePlotsComponent implements OnInit, OnDestroy {
  id = 'test';
  plots;
  samplePlot;
  loading: boolean;
  // plotInfo = { type: 'water_administration', id: 1 };
  plotInfo = { type: 'raster_test_data', id: 0 };
  testRaster;

  private plotsSubscription: Subscription;
  private samplePlotSubscription: Subscription;
  private somePostSubscription: Subscription;


  @ViewChild('samplePlot2') el: ElementRef;
  @ViewChild('samplePlot_psych') el2: ElementRef;

  @ViewChild(PlotMenuToggleComponent) PMTComp: PlotMenuToggleComponent;
  @Input() selectedPlotChange: PlotMenuToggleComponent;
  constructor(public plotsService: PlotsService) { }

  ngOnInit() {
    console.log(this.el2);
    console.log('inside view-sample-plots comp');
    // console.log(this.PMTComp.selectedPlot);
    this.plotsService.getSamplePlot();
    this.samplePlotSubscription = this.plotsService.getSamplePlotUpdateListener()
      .subscribe((psychplot: any) => {
        console.log('retrieved psych plot- now plotting');
        console.log(typeof psychplot);
        this.samplePlot = psychplot;
        this.plotSamplePsychPlot(psychplot);
      });
  }

  ngOnDestroy() {
    if (this.plotsSubscription) {
      this.plotsSubscription.unsubscribe();
    }
  }

  testChange() {
    console.log('heard event fire');
    console.log(this.PMTComp.selectedPlot);
    this.loading = true;
    // this.plotsService.getPlots(this.PMTComp.selectedPlot.type, this.PMTComp.selectedPlot.id);
    this.plotsService.retrievePlot(this.PMTComp.selectedPlot);
    // this.plotsService.getPlots('scatter', 1);
    // Plotly.plot(this.el.nativeElement);
    this.plotsSubscription = this.plotsService.getPlotUpdateListener()
      .subscribe((plots: any) => {
        this.plots = plots;
        // console.log('plots in component subscription is:');
        // console.log(plots);
        this.loading = false;
        console.log('about to plot with retrieved data');
        // this.plotSample2(this.plots);
        this.plotSampleRaster(this.plots);
      });
  }

  // plotSample2(plot) {
  //   const element = this.el.nativeElement;
  //   let layout = {};
  //   if (plot.layout) {
  //     let layout = plot.layout;
  //     layout.images = [{
  //       name: 'watermark_1',
  //       source: '../assets/images/monochromeDJ.png',
  //       xref: 'paper',
  //       yref: 'paper',
  //       x: 0.51,
  //       y: 0.89,
  //       sizex: 0.63,
  //       sizey: 0.63,
  //       opacity: 0.05,
  //       layer: 'below'
  //     }];
  //   } else {
  //     console.log('plot.layout does not exist');
  //     let layout = {};
  //     layout['images'] = [{
  //       name: 'watermark_1',
  //       source: '../assets/images/monochromeDJ.png',
  //       xref: 'paper',
  //       yref: 'paper',
  //       x: 0.51,
  //       y: 0.89,
  //       sizex: 0.63,
  //       sizey: 0.63,
  //       opacity: 0.05,
  //       layer: 'below'
  //     }];
  //     console.log(layout);
  //   }
  //   for (var x of plot) {
  //     x['mode'] = 'markers';
  //     // console.log(x);
  //   }
  //   const config = {
  //     modeBarButtonsToRemove: ['sendDataToCloud'],
  //     displaylogo: false,
  //     toImageButtonOptions: {
  //       format: 'svg', // one of png, svg, jpeg, webp
  //       filename: 'svg_image',
  //       height: 1000,
  //       width: 1700,
  //       scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
  //     }
  //   };
  //   // Plotly.newPlot(element, plot.data, layout, config); // for testing weight sample plot
  //   Plotly.newPlot(element, plot, layout, config); // for testing raster json

  // }

  plotSamplePsychPlot(plot) {
    console.log('plotting sample psych plot');
    const element2 = this.el2.nativeElement;
    Plotly.newPlot(element2, plot.data, plot.layout);
  }


  plotSampleRaster(plot) {
    const element = this.el.nativeElement;
    const img_width = 1200;
    const img_height = 900;
    const scale_factor = 0.8;
    const layout2 = {};
    this.testRaster = 'data:image/png;base64,' + plot;
    const imageSource = 'data:image/png;base64,' + plot;

    const dummyplot = {
      'data': [{
        // 'x': [0, img_width * scale_factor],
        // 'y': [0, img_height * scale_factor],
        'x': [ -15, 20],
        'y': [0, 249],
        'mode': 'markers',
        'marker': { 'opacity': 0.9 }
      }]
    };

    layout2['title'] = 'some sample raster for testing';
    layout2['images'] = [
      {
        // source: plot,
        source: imageSource,
        // source: 'https://raw.githubusercontent.com/michaelbabyn/plot_data/master/bridge.jpg',
        // sizex: img_width * scale_factor,
        // sizey: img_height * scale_factor,
        // x: 0,
        // y: img_height * scale_factor,
        sizex: 35,
        sizey: 249,
        x: -15,
        y: 249,
        xref: 'x',
        yref: 'y',
        sizing: 'stretch',
        layer: 'below'

      },
      {
        name: 'watermark_1',
        source: '../assets/images/monochromeDJ.png',
        xref: 'paper',
        yref: 'paper',
        x: 0.51,
        y: 0.89,
        sizex: 0.63,
        sizey: 0.63,
        opacity: 0.025,
        layer: 'above'
      },
    ];
    layout2['width'] = img_width * scale_factor;
    layout2['height'] = img_height * scale_factor;


    const config2 = {
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
        filename: 'svg_image',
        height: 1000,
        width: 1700,
        scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
      }
    };
    // console.log('image source is: ' + layout2['images'][1].source);
    Plotly.newPlot(element, dummyplot.data, layout2, config2);

  }
  testPost() {
    console.log('posting...?');
    const someData = {
      'labname': 'labA',
      'tester': 'Lauren'
    };
    this.plotsService.testPost(someData);
    this.somePostSubscription = this.plotsService.getSomePostUpdateListener()
      .subscribe((x: any) => {
        console.log('response from firebase');
        console.log(x);
      });

  }
}

