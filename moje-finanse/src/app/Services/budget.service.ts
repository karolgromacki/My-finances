import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';

const BUDGET_KEY = 'SELECTED_BUDGET';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private _selected = new BehaviorSubject<any>(null);

  get selected() {
    return this._selected;
  }

  constructor(private storage: Storage) { }

  setInitialAppBudget() {
    this.storage.get(BUDGET_KEY).then(val => {
      if (val) {
        this.setBudget(val);
        this.selected.next(val);
      }
    });
  }

  setBudget(budget) {
    this.selected.next(budget);
    this.storage.set(BUDGET_KEY, budget)
  }
}
