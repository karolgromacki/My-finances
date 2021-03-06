import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';

const LEGEND_KEY = 'LEGEND';

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
    this.storage.get(LEGEND_KEY).then(val => {
      if (val) {
        this.setLegend(val);
        this.selected.next(val);
      }
    });
  }

  setLegend(legend) {
    this.selected.next(legend);
    this.storage.set(LEGEND_KEY, legend)
  }
}
