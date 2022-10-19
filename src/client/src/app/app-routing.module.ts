import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './_components/landingpage/landingpage.component';

const routes: Routes = [
  {
    component: LandingPageComponent,
    path: '',
    outlet: 'landing-page',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
