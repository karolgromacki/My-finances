import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';

const THEME_KEY = 'SELECTED_THEME';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _selected = new BehaviorSubject<any>(null);

  get selected() {
    return this._selected;
  }

  constructor(private storage: Storage) { }

  setInitialAppTheme() {
    this.storage.get(THEME_KEY).then(val => {
      if (val) {
        this.setTheme(val);
        this.selected.next(val);
      }
    });
  }

  setTheme(theme) {
    this.selected.next(theme);
    this.storage.set(THEME_KEY, theme)
  }
}
