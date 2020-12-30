import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';

const CUR_KEY = 'SELECTED_CURRENCY';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private _selected = new BehaviorSubject<any>('USD');

  get selected() {
    return this._selected;
  }

  constructor(private storage: Storage) { }

  setInitialAppCurrency() {
    this.storage.get(CUR_KEY).then(val => {
      if (val) {
        this.setCurrency(val);
        this.selected.next(val);
      }
    });
  }

  getCurrencies() {
    return [
      { text: 'USD', value: 'USD' },
      { text: 'EUR', value: 'EUR' },
      { text: 'PLN', value: 'PLN' },
      { text: 'none', value: ' ' },
    ]
  }

  setCurrency(currency) {
    this.selected.next(currency);
    this.storage.set(CUR_KEY, currency)
  }
}
