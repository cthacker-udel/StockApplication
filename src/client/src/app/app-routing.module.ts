import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './_components/landingpage/landingpage.component';
import { ProfileComponent } from './_components/profile/profile.component';
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
    component: ProfileComponent,
    path: 'profile',
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
