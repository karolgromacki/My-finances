import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SuperTabsModule } from '@ionic-super-tabs/angular';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { AchievementsPage } from './main/achievements/achievements.page';
import { FormsModule } from '@angular/forms';

import { File } from '@ionic-native/file/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { PapaParseModule } from 'ngx-papaparse';
import { DatePipe } from '@angular/common';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json')
}

@NgModule({
  declarations: [AppComponent, AchievementsPage],
  entryComponents: [AchievementsPage],
  imports: [

    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    PapaParseModule,
    TranslateModule.forRoot(),
    HttpClientModule,
    FormsModule,
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    SuperTabsModule.forRoot(),
    NgxQRCodeModule

  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    DatePipe,
    File,
    SocialSharing,
    BarcodeScanner
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
