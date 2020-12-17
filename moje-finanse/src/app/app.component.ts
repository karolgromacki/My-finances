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
    private themeService: ThemeService,
    private loadingCtrl: LoadingController
  ) {

    if (this.selectedTheme) {
      this.renderer.setAttribute(document.body, 'color-theme', 'dark');
    }
    else {
      this.renderer.setAttribute(document.body, 'color-theme', 'light');
    }

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
  exportToCSV() {
    let accounts = [];
    let categories = [];
    let transactions = [];
    this.transactionsService.transactions.subscribe(transaction => {
      transaction.forEach(t => {
        transactions.push(t.type)
        transactions.push(t.title)
        transactions.push(t.note)
        transactions.push(t.category)
        transactions.push(t.account)
        transactions.push(t.amount)
        transactions.push(t.date)
        transactions.push(t.imageUrl)
        transactions.push(t.icon)
      });
      console.log(transactions)
    })
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
