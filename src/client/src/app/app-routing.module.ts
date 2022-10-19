import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './_components/landingpage/landingpage.component';
import { SignInComponent } from './_components/signin/signin.component';

const routes: Routes = [
  {
    component: SignInComponent,
    path: 'signin',
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
