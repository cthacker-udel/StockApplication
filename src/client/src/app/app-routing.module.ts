import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './_components/landingpage/landingpage.component';
import { PortfolioComponent } from './_components/portfolio/portfolio.component';

const routes: Routes = [
  {
    component: LandingPageComponent,
    path: '',
    outlet: 'landing-page',
  },
  {
    component: PortfolioComponent,
    path: 'portfolio',
    outlet: 'portfolio',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
