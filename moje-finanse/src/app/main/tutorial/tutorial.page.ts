import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonSlides, MenuController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { CurrencyService } from 'src/app/Services/currency.service';
import { LanguageService } from 'src/app/Services/language.service';
import { ThemeService } from 'src/app/Services/theme.service';
@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
})
export class TutorialPage implements OnInit {
  showSkip = true;
  theme;
  languages = [];
  firstSlide = true;
  currencies = [];
  selectedLanguage = '';
  selectedCurrency = '';
  selectedTheme = null;
  @ViewChild('slides', { static: true }) slides: IonSlides;

  constructor(
    public menu: MenuController,
    public router: Router,
    public storage: Storage,
    private renderer: Renderer2,
    private languageService: LanguageService,
    private currencyService: CurrencyService,
    private themeService: ThemeService
  ) { }

  ngOnInit() {
    this.storage.get('DID_TUTORIAL').then(val => {
      if (val == true) {
        this.firstSlide = false;
      }
    });
    this.languages = this.languageService.getLanguages();
    this.currencies = this.currencyService.getCurrencies();
    this.languageService.selected.subscribe(selected => this.selectedLanguage = selected);
    this.currencyService.selected.subscribe(selected => this.selectedCurrency = selected);
    this.themeService.selected.subscribe(selected => this.selectedTheme = selected);
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

  startApp() {
    this.router
      .navigateByUrl('/main/tabs/categories', { replaceUrl: true });
    this.storage.set('DID_TUTORIAL', true);

  }

  onSlideChangeStart(event) {
    event.target.isEnd().then(isEnd => {
      this.showSkip = !isEnd;
    });
  }

  ionViewWillEnter() {
    this.menu.enable(false);
  }

  ionViewDidLeave() {
    this.menu.enable(true);
  }
}
