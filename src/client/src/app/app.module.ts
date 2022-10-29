import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LandingPageComponent } from './_components/landingpage/landingpage.component';
import { ConfigService } from './config/config.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { SignInComponent } from './_components/signin/signin.component';
import { StockDashboardComponent } from './_components/stockdashboard/stockdashboard.component';
import { RequestInterceptor } from './config/requestInterceptor';
import { SessionService } from './_services/session.service';
import { DashboardService } from './_services/dashboard.service';
import { ProfileComponent } from './_components/profile/profile.component';
import { UserService } from './_services/user.service';
import { TradingService } from './_services/trading.service';
import { CommonModule } from '@angular/common';
import { TradingComponent } from './_components/trading/trading.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { SocketService } from './_services/socket.service';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { AdminDashboardComponent } from './_components/admin/dashboard/admin.dashboard.component';
import { AdminUserComponent } from './_components/admin/users/admin.users.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminStocksComponent } from './_components/admin/stocks/admin.stocks.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    SignInComponent,
    StockDashboardComponent,
    ProfileComponent,
    TradingComponent,
    AdminDashboardComponent,
    AdminUserComponent,
    AdminStocksComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot({
      timeOut: 20000,
      positionClass: 'toast-bottom-right',
    }),
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatSliderModule,
    MatExpansionModule,
    MatTooltipModule,
  ],
  providers: [
    ConfigService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true,
      deps: [SessionService],
    },
    SessionService,
    DashboardService,
    UserService,
    TradingService,
    SocketService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
