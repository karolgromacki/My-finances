import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { Budget } from './budget.model';

const BUDGET_TOGGLE_KEY = 'TOGGLE_BUDGET';
const BUDGET_KEY = 'BUDGET';


@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  private _selected = new BehaviorSubject<any>(null);
  private _budget = new BehaviorSubject<Budget>(null);

  get selected() {
    return this._selected;
  }

  get budget() {
    return this._budget;
  }

  constructor(private storage: Storage) { }

  setInitialAppBudget() {
    this.storage.get(BUDGET_TOGGLE_KEY).then(val => {
      if (val) {
        this.setBudget(val);
        this.selected.next(val);
      }
    });
    this.storage.get(BUDGET_KEY).then(val => {
      if (val) {
        this.setBudget(val);
        this.budget.next(val);
      }
    });
  }

  setBudget(budget) {
    this.selected.next(budget);
    this.storage.set(BUDGET_TOGGLE_KEY, budget)
  }
  addBudget(
    baseamount: number,
    period: string) {
    if (this.selected.value == false) {
      this.budget.next(null);
      this.storage.set(BUDGET_KEY, null);
    }
    else {
      let newBudget = new Budget(baseamount, period)
      this.budget.next(newBudget);
      this.storage.set(BUDGET_KEY, newBudget);
      this.setBudget(true);
    }
    return this.budget;
  }
}
