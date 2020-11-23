import { Component, Renderer2 } from '@angular/core';
import { Plugins, Capacitor } from '@capacitor/core';
import { AlertController, MenuController, ModalController, Platform } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AccountsService } from './main/accounts/accounts.service';
import { TransactionsService } from './main/transactions/transactions.service';
import { CategoriesService } from './main/categories/categories.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AuthService } from './auth/auth.service';
import { LanguageService } from './language.service';
import { TranslateService } from '@ngx-translate/core';
import { AchievementsPage } from './main/achievements/achievements.page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  theme;
  checked = false;
  languages = [];
  selectedLanguage = '';
  constructor(
    private authService: AuthService,
    private storage: Storage,
    private translate: TranslateService,
    private platform: Platform,
    // private splashScreen: SplashScreen,
    // private statusBar: StatusBar,
    private modalCtrl: ModalController,
    private renderer: Renderer2,
    private accountsService: AccountsService,
    private categoriesService: CategoriesService,
    private transactionsService: TransactionsService,
    private alertCtrl: AlertController,
    private router: Router,
    private menuCtrl: MenuController,
    private languageService: LanguageService,
  ) {

    this.storage.get('theme').then((val) => {
      if (val == null)
        this.renderer.setAttribute(document.body, 'color-theme', 'dark');
      if (val == 'dark')
        this.checked = true;
    });
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        Plugins.SplashScreen.hide();
      }
      this.languageService.setInitialAppLanguage();
    });
  }
  ngOnInit() {
    this.languages = this.languageService.getLanguages();
    this.languageService.selected.subscribe(selected => this.selectedLanguage = selected)
  }
  selectLanguage(event) {
    this.languageService.setLanguage(event.detail.value);
  }
  onToggleColorTheme(event) {
    if (event.detail.checked) {
      this.renderer.setAttribute(document.body, 'color-theme', 'dark');
      this.storage.set('theme', 'dark');
    }
    else {
      this.renderer.setAttribute(document.body, 'color-theme', 'light');
      this.storage.set('theme', 'light');
    }

  }
  onClearData() {
    this.alertCtrl.create({
      header: this.translate.instant('areYouSure'),
      message: this.translate.instant('clearAllData'),
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('delete'),
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
    this.router.navigateByUrl('/auth')

  }
}
