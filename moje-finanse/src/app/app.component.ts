import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Plugins, Capacitor, AppState } from '@capacitor/core';
import { AlertController, LoadingController, MenuController, ModalController, Platform } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AccountsService } from './main/accounts/accounts.service';
import { TransactionsService } from './main/transactions/transactions.service';
import { CategoriesService } from './main/categories/categories.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AuthService } from './auth/auth.service';
import { LanguageService } from './Services/language.service';
import { CurrencyService } from './Services/currency.service';
import { TranslateService } from '@ngx-translate/core';
import { AchievementsPage } from './main/achievements/achievements.page';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ThemeService } from './Services/theme.service';
import { LegendService } from './Services/legend.service';
import { File } from '@ionic-native/file/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Papa } from 'ngx-papaparse';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  private previousAuthState = false;
  theme;
  languages = [];
  currencies = [];
  selectedLanguage = '';
  selectedCurrency = '';
  selectedTheme = null;

  constructor(
    private authService: AuthService,
    private storage: Storage,
    private translate: TranslateService,
    private platform: Platform,
    private modalCtrl: ModalController,
    private renderer: Renderer2,
    private accountsService: AccountsService,
    private categoriesService: CategoriesService,
    private transactionsService: TransactionsService,
    private alertCtrl: AlertController,
    private router: Router,
    private menuCtrl: MenuController,
    private languageService: LanguageService,
    private currencyService: CurrencyService,
    private legendService: LegendService,
    private themeService: ThemeService,
    private loadingCtrl: LoadingController,
    private papa: Papa,
    private file: File,
    private socialSharing: SocialSharing,
    private datePipe: DatePipe
  ) {

    // if (this.selectedTheme) {
    //   this.renderer.setAttribute(document.body, 'color-theme', 'dark');
    // }
    // else {
    //   this.renderer.setAttribute(document.body, 'color-theme', 'light');
    // }

    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        Plugins.SplashScreen.hide();
      }
      this.languageService.setInitialAppLanguage();
      this.themeService.setInitialAppTheme();
      this.currencyService.setInitialAppCurrency();
      this.legendService.setInitialAppLegend();
    });
  }

  ngOnInit() {
    this.authSub = this.authService.userIsAuthenticated.subscribe(isAuth => {
      if (!isAuth && this.previousAuthState != isAuth) {
        this.router.navigateByUrl('/auth');
      }
      this.previousAuthState = isAuth;
    });
    this.languages = this.languageService.getLanguages();
    this.currencies = this.currencyService.getCurrencies();
    this.languageService.selected.subscribe(selected => this.selectedLanguage = selected);
    this.currencyService.selected.subscribe(selected => this.selectedCurrency = selected);
    this.themeService.selected.subscribe(selected => this.selectedTheme = selected);
    Plugins.App.addListener('appStateChange', this.checkAuthOnResume.bind(this));
  }

  private checkAuthOnResume(state: AppState) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe(success => {
          if (!success) {
            this.onLogout();
          }
        });
    }
  }

  selectLanguage(event) {
    this.languageService.setLanguage(event.detail.value);
  }
  selectCurrency(event) {
    this.currencyService.setCurrency(event.detail.value);
  }
  selectTheme(event) {
    this.themeService.setTheme(event.detail.checked);
    if (event.detail.checked) {
      this.renderer.setAttribute(document.body, 'color-theme', 'dark');
    }
    else {
      this.renderer.setAttribute(document.body, 'color-theme', 'light');
    }
  }

  onClearData() {
    this.alertCtrl.create({
      header: this.translate.instant('areYouSure'),
      message: this.translate.instant('clearAllData'),
      buttons: [
        {
          text: this.translate.instant('delete'),
          handler: () => {
            this.loadingCtrl.create({
              message: this.translate.instant('deletingData')
            }).then(loadingEl => {
              loadingEl.present();
              this.transactionsService.transactions.subscribe(transactions => {
                transactions.forEach(t => {
                  console.log(t.id)
                  this.transactionsService.deleteTransaction(t.id).subscribe(() => {
                  });
                });
              });
              this.categoriesService.categories.subscribe(categories => {
                categories.forEach(c => {
                  console.log(c.id)
                  this.categoriesService.deleteCategory(c.id).subscribe(() => {
                  });
                });
              });
              this.accountsService.accounts.subscribe(accounts => {
                accounts.forEach(a => {
                  console.log(a.id)
                  this.accountsService.deleteAccount(a.id).subscribe(() => {
                  });
                });
              });
              loadingEl.dismiss();
            });
            this.menuCtrl.close();
          }
        },
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
        },
      ]
    }).then(alertEl => {
      alertEl.present();
    });
  }

  exportCSV() {
    let all = []
    this.transactionsService.transactions.subscribe(transaction => {
      transaction.forEach(t => {
        let transactionDetail = [];
        transactionDetail.push(t.type)
        transactionDetail.push(t.title)
        transactionDetail.push(t.category)
        transactionDetail.push(t.account)
        transactionDetail.push(t.amount)
        transactionDetail.push(this.datePipe.transform(t.date, 'dd.MM.yyyy'))
        transactionDetail.push(t.note)
        all.push(transactionDetail)
      });
    })
    let csv = this.papa.unparse({
      fields: ['Type', 'Title', 'Category', 'Account', 'Amount', 'Date', 'Note'],
      data: all
    });
    // console.log('csv:', csv)
    if (this.platform.is('capacitor')) {
      this.file.writeFile(this.file.dataDirectory, 'My-Finances-Data.csv', csv, { replace: true }).then(res => {
        this.socialSharing.share(null, null, res.nativeURL, null);
      })
    }
    else {
      var blob = new Blob([csv]);
      var a = window.document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'My-Finances-Data.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }


  openTutorial() {
    this.menuCtrl.close().then(() => { this.router.navigateByUrl('main/tutorial'); });
  }
  onAchievements() {
    this.menuCtrl.close().then(() => {
      this.modalCtrl.create({ component: AchievementsPage }).then(modalEl => {
        modalEl.present();
      })
    });
  }
  onLogout() {
    this.menuCtrl.close();
    this.authService.logout();

  }
  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}
