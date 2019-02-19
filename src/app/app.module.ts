import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './auth/auth-guard.service';
import { AppComponent } from './app.component';
import { ByMouseComponent } from './by-mouse/by-mouse.component';
import { EachMouseComponent } from './each-mouse/each-mouse.component';
import { ByLabComponent } from './by-lab/by-lab.component';
import { EachLabComponent } from './each-lab/each-lab.component';
import { EachBatchComponent } from './each-batch/each-batch.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthService } from './auth/auth.service';
import { SamplePlotComponent } from './plots/sample-plot/sample-plot.component';
import { PlotsService } from './plots.service';

const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'plot', component: SamplePlotComponent },
  {
    path: 'by-mouse',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: ByMouseComponent,
        children: [
          { path: ':lab/:mousename', component: EachMouseComponent }
        ]
  },
  {
    path: 'by-lab', component: ByLabComponent, children: [
      { path: ':lab/', component: EachLabComponent },
      { path: ':lab/:batchname', component: EachBatchComponent }
    ]
  }
  // { path: 'not-found', component: ErrorPageComponent, data: { message: '404 - Page not found!' } },
  // { path: '**', redirectTo: '/not-found' }
];


@NgModule({
  declarations: [
    AppComponent,
    ByMouseComponent,
    ByLabComponent,
    EachMouseComponent,
    EachLabComponent,
    EachBatchComponent,
    LoginComponent,
    SamplePlotComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [AuthService, AuthGuard, PlotsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
