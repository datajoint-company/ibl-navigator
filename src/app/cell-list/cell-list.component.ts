import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, DoCheck, HostListener} from '@angular/core';

import { Subscription } from 'rxjs';

import { CellListService } from './cell-list.service';

// declare var Plotly: any;

@Component({
  selector: 'app-cell-list',
  templateUrl: './cell-list.component.html',
  styleUrls: ['./cell-list.component.css']
})
export class CellListComponent implements OnInit, OnDestroy, DoCheck {
  // d3 = Plotly.d3;
  cells: any;
  session: any;
  clickedClusterId: number;
  plot_data;
  plot_layout;
  plot_config;


  private cellListSubscription: Subscription;

  @Input() sessionInfo: Object;
  @ViewChild('navTable') el_nav: ElementRef;

  constructor(public cellListService: CellListService) { }

  ngOnInit() {
    // const element = this.el_nav.nativeElement;
    this.session = this.sessionInfo;
    this.cellListService.retrieveCellList(this.sessionInfo);
    this.cellListSubscription = this.cellListService.getCellListLoadedListener()
        .subscribe((cellListData) => {
          if (Object.entries(cellListData).length > 0) {
            this.cells = cellListData;
            const x_data = [];
            const y_data = [];
            const id_data = [];
            const size_data = [];
            const color_data = [];
            for (let entry of Object.values(cellListData)) {
              id_data.push(entry['cluster_id']);
              size_data.push(entry['channel_id']);
              y_data.push(entry['cluster_depth']);
              x_data.push(entry['cluster_amp']);
              color_data.push(entry['cluster_id']);
            }
            console.log('x_data is: ', x_data);
            console.log('y_data is: ', y_data);
            console.log('color_data is: ', color_data);
            console.log('size_data is: ', size_data);
            this.plot_data = [{
              x: x_data,
              y: y_data,
              customdata: id_data,
              mode: 'markers',
              marker: {
                size: 15,
                color: 'rgba(255, 255, 255, 0.2',
                line: {
                  color: color_data,
                  width: 2
                }
              }
            }];

            this.plot_layout = {
              yaxis: {
                title: 'cluster depth (µm)'
              },
              xaxis: {
                title: 'cluster amplitutde (µV)'
              },
              hovermode: 'closest'
            };

            this.plot_config = {
              showLink: false,
              showSendToCloud: false,
              displaylogo: false,
              modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian',
                              'hoverCompareCartesian', 'toImage', 'toggleSpikelines'],
            };

            // Plotly.newPlot(element, this.plot_data, this.plot_layout);
            
            // element.on('plotly_click', function (data) {
            //   console.log('data:', data);
            //   let pts = '';
            //   for (let i = 0; i < data.points.length; i++) {
            //     pts = 'amplitude = ' + data.points[i].x + '\ndepth = ' +
            //     data.points[i].y.toPrecision(4) + '\nid= ' +
            //     data.points[i].customdata + '\n\n';
            //   }
            //   console.log('original cluster id: ', this.clickedClusterId);
            //   this.clickedClusterId = data.points[0].customdata;
            //   console.log('Closest point clicked:\n\n' + pts);
            //   console.log('clicked cluster id is: ', this.clickedClusterId);
            //   console.log('clicked cluster id type is: ', typeof this.clickedClusterId);
            //   return this.clickedClusterId;
            // });

          }
        });
  }

  ngDoCheck() {
    // this.clickedClusterId ++;

  }
  ngOnDestroy() {
    if (this.cellListSubscription) {
      this.cellListSubscription.unsubscribe();
    }
  }

  clusterSelected(data) {
    const element = this.el_nav.nativeElement.children[1];
    console.log('cluster selected!');
    console.log(element);
    const rows = element.querySelectorAll('tr');
    console.log('printing rows');
    console.log(rows);
    if (data['points'] && data['points'][0]['customdata']) {
      this.clickedClusterId = data['points'][0]['customdata'];
      rows[this.clickedClusterId].scrollIntoView({
                                      behavior: 'smooth',
                                      block: 'center'});
    }

  }

}
