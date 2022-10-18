import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
<<<<<<< HEAD
import { LoginComponent } from './_components/login.component';
=======
import { AppComponent } from './app.component';
import { LandingPageComponent } from './_components/landingpage/landingpage.component';
>>>>>>> 44aa289 ([landing_page] Added landing page)

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
