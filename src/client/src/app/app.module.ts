import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LandingPageComponent } from './_components/landingpage/landingpage.component';
import { ConfigService } from './config/config.service';

@NgModule({
  declarations: [AppComponent, LandingPageComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [ConfigService],
  bootstrap: [AppComponent],
})
export class AppModule {}
