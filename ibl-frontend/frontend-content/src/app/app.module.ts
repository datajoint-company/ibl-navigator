import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { PlotlyModule } from 'angular-plotly.js';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { MatSelectModule,
         MatAutocompleteModule,
         MatIconModule,
         MatInputModule,
         MatCheckboxModule,
         MatRadioModule,
         MatNativeDateModule,
         MatDatepickerModule,
         MatSlideToggleModule,
         MatCardModule,
         MatButtonModule,
         MatTableModule,
         MatPaginatorModule,
         MatSortModule,
         MatSliderModule,
         MatExpansionModule,
         MatDialogModule,
         MatTreeModule,
         MatFormFieldModule } from '@angular/material';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AuthGuard } from './auth/auth-guard.service';
import { AppComponent } from './app.component';
import { EachBatchComponent } from './each-batch/each-batch.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthService } from './auth/auth.service';
import { SamplePlotComponent } from './plots/view-sample-plots/sample-plot/sample-plot.component';
import { PlotsService } from './plots.service';
import { ViewSamplePlotsComponent } from './plots/view-sample-plots/view-sample-plots.component';
import { PlotMenuToggleComponent } from './plots/view-sample-plots/plot-menu-toggle/plot-menu-toggle.component';
import { SessionListComponent } from './session-list/session-list.component';
import { SessionComponent, SessionPlotDialog } from './session-list/session/session.component';
import { MouseListComponent } from './mouse-list/mouse-list.component';
import { MouseComponent } from './mouse-list/mouse/mouse.component';
import { CellListComponent } from './cell-list/cell-list.component';
import { CellComponent } from './cell-list/cell/cell.component';
import { OverviewComponent } from './overview/overview.component';
import { WaterWeightPlotComponent } from './mouse-list/mouse/water-weight-plot/water-weight-plot.component';
import { SessionPsychPlotComponent } from './session-list/session/session-psych-plot/session-psych-plot.component';
import { TrialCountsSessionDurationComponent } from './mouse-list/mouse/trial-counts-session-duration/trial-counts-session-duration.component';
import { PerformanceReactionTimePlotComponent } from './mouse-list/mouse/performance-reaction-time-plot/performance-reaction-time-plot.component';
import { ContrastHeatmapPlotComponent } from './mouse-list/mouse/contrast-heatmap-plot/contrast-heatmap-plot.component';
import { FitParPlotsComponent } from './mouse-list/mouse/fit-par-plots/fit-par-plots.component';
import { ByDateResultPlotsComponent } from './mouse-list/mouse/by-date-result-plots/by-date-result-plots.component';
import { AuthInterceptor } from './auth/auth-interceptor';
import { DailySummaryComponent } from './daily-summary/daily-summary.component';
import { SummaryPlotsComponent } from './daily-summary/summary-plots/summary-plots.component';
import { AnimatedPsychCurvePlotComponent } from './mouse-list/mouse/animated-psych-curve-plot/animated-psych-curve-plot.component';
import { SessionRTCPlotComponent } from './session-list/session/session-rtc-plot/session-rtc-plot.component';
import { SessionRTTNPlotComponent } from './session-list/session/session-rttn-plot/session-rttn-plot.component';
import { RasterPlotsComponent } from './cell-list/cell/raster-plots/raster-plots.component';
import { PsthPlotsComponent } from './cell-list/cell/psth-plots/psth-plots.component';
import { QualityControlComponent } from './quality-control/quality-control.component';
import { DriftmapComponent } from './quality-control/driftmap/driftmap.component';
import { SpinningBrainComponent } from './mouse-list/mouse/spinning-brain/spinning-brain.component';

PlotlyModule.plotlyjs = PlotlyJS;

const appRoutes: Routes = [
  { path: '', component: OverviewComponent, 
    // canActivate: [AuthGuard] 
  },
  // { path: 'login', component: LoginComponent },
  {
    path: 'mouse/:mouseUUID',
    // canActivate: [AuthGuard],
    // canActivateChild: [AuthGuard],
    component: MouseComponent
  },
  {
    path: 'mice',
      // canActivate: [AuthGuard],
      // canActivateChild: [AuthGuard],
      component: MouseListComponent
  },
  {
    path: 'session/:sessionID',
    // canActivate: [AuthGuard],
    // canActivateChild: [AuthGuard],
    component: SessionComponent
  },
  {
    path: 'sessions',
      // canActivate: [AuthGuard],
      // canActivateChild: [AuthGuard],
      component: SessionListComponent
  },
  // {
  //   path: 'summary',
  //   canActivate: [AuthGuard],
  //   component: DailySummaryComponent
  // },
  {
    path: 'qc/:subjectID/:sessionStartTime',
      // canActivate: [AuthGuard],
      // canActivateChild: [AuthGuard],
      component: QualityControlComponent
  },
  // { path: 'not-found', component: ErrorPageComponent, data: { message: '404 - Page not found!' } },
  // { path: '**', redirectTo: '/not-found' }
];


@NgModule({
  entryComponents: [SessionComponent, SessionPlotDialog],
  declarations: [
    AppComponent,
    EachBatchComponent,
    LoginComponent,
    SamplePlotComponent,
    ViewSamplePlotsComponent,
    PlotMenuToggleComponent,
    SessionListComponent,
    SessionComponent,
    MouseListComponent,
    MouseComponent,
    CellListComponent,
    CellComponent,
    OverviewComponent,
    WaterWeightPlotComponent,
    SessionPsychPlotComponent,
    TrialCountsSessionDurationComponent,
    PerformanceReactionTimePlotComponent,
    ContrastHeatmapPlotComponent,
    FitParPlotsComponent,
    ByDateResultPlotsComponent,
    DailySummaryComponent,
    SummaryPlotsComponent,
    AnimatedPsychCurvePlotComponent,
    SessionRTCPlotComponent,
    SessionRTTNPlotComponent,
    SessionPlotDialog,
    RasterPlotsComponent,
    PsthPlotsComponent,
    QualityControlComponent,
    DriftmapComponent,
    SpinningBrainComponent
  ],
  imports: [
    CommonModule, PlotlyModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    MatSelectModule, MatAutocompleteModule, MatIconModule, MatInputModule,
    MatCheckboxModule, MatRadioModule, MatNativeDateModule, MatDatepickerModule, MatMomentDateModule, MatSlideToggleModule,
    MatCardModule, MatButtonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatSliderModule, MatExpansionModule,
    MatDialogModule, ReactiveFormsModule, FlexLayoutModule, MatTreeModule, MatFormFieldModule
  ],
  providers: [AuthService, AuthGuard, PlotsService,
              { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
              { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }
             ],
  bootstrap: [AppComponent]
})
export class AppModule { }
