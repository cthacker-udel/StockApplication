import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './_components/landingpage/landingpage.component';
import { PortfolioPageComponent } from './_components/portfoliopage/portfoliopage.component';

const routes: Routes = [
  {
    component: LandingPageComponent,
    path: '',
    outlet: 'landing-page',
  },
  {
    component: PortfolioPageComponent,
    path: '',
    outlet: 'portfolio-page',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
