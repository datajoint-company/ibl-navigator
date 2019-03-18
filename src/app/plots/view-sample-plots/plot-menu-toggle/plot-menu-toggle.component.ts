import { Component, OnInit, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-plot-menu-toggle',
  templateUrl: './plot-menu-toggle.component.html',
  styleUrls: ['./plot-menu-toggle.component.css']
})

export class PlotMenuToggleComponent implements OnInit {
  @Output() selectedPlotChange = new EventEmitter();

  // selectedPlot = { 'type': 'water_administration', 'id': 1 };
  selectedPlot = { 'type': 'raster_test_data', 'id': 1 };

  // plotMenu = [
  //   { type: 'water_administration', id: 2 },
  //   { type: 'water_administration', id: 3 },
  //   { type: 'water_administration', id: 4 }
  // ];

  plotMenu = [
    { type: 'raster_test_data', id: 1 },
    { type: 'raster_test_data', id: 0 }
  ];
  // selectedPlot = { type: 'water_administration', id: 0 };
  constructor() { }

  ngOnInit() {
    console.log('inside toggle menu component OnInit');
    console.log(this.selectedPlot);
  }

  onChange(e) {
    console.log('inside toggle menu component OnChange function');
    this.selectedPlot = e;
    this.selectedPlotChange.emit(this.selectedPlot);
  }




}
