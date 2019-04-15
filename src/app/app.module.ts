import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { MatSelectModule,
         MatAutocompleteModule,
         MatIconModule,
         MatInputModule,
         MatCheckboxModule,
         MatRadioModule,
         MatNativeDateModule,
         MatDatepickerModule,
         MatCardModule,
         MatButtonModule } from '@angular/material';
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

const appRoutes: Routes = [
  { path: '', component: OverviewComponent },
  { path: 'login', component: LoginComponent },
  { path: 'plot', component: ViewSamplePlotsComponent },
  { path: 'cells', component: CellListComponent },
  { path: 'water-weight', component: WaterWeightPlotComponent},
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
      component: MouseListComponent,
      children: [
        { path: ':lab/:mousename', component: MouseComponent }
      ]
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
      component: SessionListComponent,
      children: [
        { path: ':sessionID', component: SessionComponent },
        { path: ':sessionID/:batchname', component: EachBatchComponent }
      ]
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
    WaterWeightPlotComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    MatSelectModule, MatAutocompleteModule, MatIconModule, MatInputModule, MatCheckboxModule, MatRadioModule, MatNativeDateModule, MatDatepickerModule, MatCardModule, MatButtonModule,
    ReactiveFormsModule
  ],
  providers: [AuthService, AuthGuard, PlotsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
