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
import { MatCardModule } from "@angular/material/card";
import { DashboardService } from './_services/dashboard.service';
import { ProfileComponent } from './_components/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    SignInComponent,
    StockDashboardComponent,
    ProfileComponent,
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
    MatCardModule,
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
