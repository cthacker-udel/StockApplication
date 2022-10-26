import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './_components/landingpage/landingpage.component';
import { SignInComponent } from './_components/signin/signin.component';
import { StockDashboardComponent } from './_components/stockdashboard/stockdashboard.component';

const routes: Routes = [
  {
    component: SignInComponent,
    path: 'signin',
  },
  {
    component: StockDashboardComponent,
    path: 'stock-dashboard',
  },
  {
    component: LandingPageComponent,
    path: '**',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
