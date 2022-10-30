import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AdminDashboardComponent } from './_components/admin/dashboard/admin.dashboard.component';
import { AdminAddStocksComponent } from './_components/admin/stocks/add/admin.addstocks.component';
import { AdminUserComponent } from './_components/admin/users/admin.users.component';
import { LandingPageComponent } from './_components/landingpage/landingpage.component';
import { ProfileComponent } from './_components/profile/profile.component';
import { SignInComponent } from './_components/signin/signin.component';
import { StockDashboardComponent } from './_components/stockdashboard/stockdashboard.component';
import { TradingComponent } from './_components/trading/trading.component';

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
    component: TradingComponent,
    path: 'trading',
  },
  {
    component: AdminDashboardComponent,
    path: 'admin',
  },
  {
    component: AdminAddStocksComponent,
    path: 'admin/stocks/add',
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
