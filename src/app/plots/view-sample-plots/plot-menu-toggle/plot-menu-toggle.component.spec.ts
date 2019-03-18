import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotMenuToggleComponent } from './plot-menu-toggle.component';

describe('PlotMenuToggleComponent', () => {
  let component: PlotMenuToggleComponent;
  let fixture: ComponentFixture<PlotMenuToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlotMenuToggleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlotMenuToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
