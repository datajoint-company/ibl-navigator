import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
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
         MatExpansionModule } from '@angular/material';
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
import { SessionComponent } from './session-list/session/session.component';
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

const appRoutes: Routes = [
  { path: '', component: OverviewComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'plot', component: ViewSamplePlotsComponent },
  { path: 'cells', component: CellListComponent },
  { path: 'water-weight', component: WaterWeightPlotComponent},
  {
    path: 'mouse/:mouseUUID',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: MouseComponent
  },
  {
    path: 'mice',
      canActivate: [AuthGuard],
      canActivateChild: [AuthGuard],
      component: MouseListComponent,
      children: [
        { path: ':lab/:mousename', component: MouseComponent }
      ]
  },
  {
    path: 'session/:sessionID',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: SessionComponent
  },
  {
    path: 'sessions',
      canActivate: [AuthGuard],
      canActivateChild: [AuthGuard],
      component: SessionListComponent,
      children: [
        { path: ':sessionID', component: SessionComponent },
        { path: ':sessionID/:batchname', component: EachBatchComponent }
      ]
  },
  {
    path: 'summary',
    canActivate: [AuthGuard],
    component: DailySummaryComponent
  },
  // { path: 'not-found', component: ErrorPageComponent, data: { message: '404 - Page not found!' } },
  // { path: '**', redirectTo: '/not-found' }
];


@NgModule({
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
    SummaryPlotsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    MatSelectModule, MatAutocompleteModule, MatIconModule, MatInputModule,
    MatCheckboxModule, MatRadioModule, MatNativeDateModule, MatDatepickerModule, MatSlideToggleModule,
    MatCardModule, MatButtonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatSliderModule, MatExpansionModule,
    ReactiveFormsModule, FlexLayoutModule
  ],
  providers: [AuthService, AuthGuard, PlotsService, { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
