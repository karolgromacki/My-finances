import { Component, Renderer2 } from '@angular/core';

import { AlertController, MenuController, Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AccountsService } from './main/accounts/accounts.service';
import { TransactionsService } from './main/transactions/transactions.service';
import { CategoriesService } from './main/categories/categories.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private renderer: Renderer2,
    private accountsService: AccountsService,
    private categoriesService: CategoriesService,
    private transactionsService: TransactionsService,
    private alertCtrl: AlertController,
    private router: Router,
    private menuCtrl: MenuController
  ) {
    this.renderer.setAttribute(document.body, 'color-theme', 'dark');
    this.initializeApp();
  }
  onToggleColorTheme(event) {
    if (event.detail.checked) {
      this.renderer.setAttribute(document.body, 'color-theme', 'dark');
    }
    else { this.renderer.setAttribute(document.body, 'color-theme', 'light'); }

  }
  onClearData() {
    this.alertCtrl.create({
      header: 'Are you sure?',
      message: 'Do you want to clear all data?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: () => {
            this.transactionsService.clearAlldata().subscribe(() => {
            });
            this.categoriesService.clearAlldata()
            this.accountsService.clearAlldata().subscribe(() => {
            });
            this.categoriesService.addCategory(
              'Transfer',
              'swap-horizontal').subscribe(() => {
              });
            this.categoriesService.addCategory(
              'Deposit',
              'card').subscribe(() => {
                if (this.router.url == '/main/tabs/categories')
                  this.router.navigateByUrl('/main/tabs/transactions');
                else
                  this.router.navigateByUrl('/main/tabs/categories');
                this.menuCtrl.close();
              });
          }
        }
      ]
    }).then(alertEl => {
      alertEl.present();
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
