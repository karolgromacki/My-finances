import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';

const THEME_KEY = 'LEGEND';

@Injectable({
  providedIn: 'root'
})
export class LegendService {
  private _selected = new BehaviorSubject<any>(null);

  get selected() {
    return this._selected;
  }

  constructor(private storage: Storage) { }

  setInitialAppLegend() {
    this.storage.get(THEME_KEY).then(val => {
      if (val) {
        this.setLegend(val);
        this.selected.next(val);
      }
    });
  }

  setLegend(legend) {
    this.selected.next(legend);
    this.storage.set(THEME_KEY, legend)
  }
}
