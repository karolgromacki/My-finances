import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';

const LNG_KEY = 'SELECTED_LANGUAGE';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private _selected = new BehaviorSubject<any>('en');
  
  get selected() {
    return this._selected;
  }

  constructor(private translate: TranslateService, private storage: Storage) { }

  setInitialAppLanguage() {
    let language = this.selected.value;
    this.translate.setDefaultLang(language);

    this.storage.get(LNG_KEY).then(val => {
      if (val) {
        this.setLanguage(val);
        this.selected.next(val);
      }
    });
  }
  getLanguages() {
    return [
      { text: 'English', value: 'en', img: '' },
      { text: 'Polski', value: 'pl', img: '' },
    ]
  }

  setLanguage(lng) {
    this.translate.use(lng);
    this.selected.next(lng);
    this.storage.set(LNG_KEY, lng)
  }

}
