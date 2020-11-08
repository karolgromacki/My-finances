import { Injectable } from '@angular/core';
import { Transaction } from './transaction.model';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private _transactions = new BehaviorSubject<Transaction[]>([
    new Transaction('t1', 'expense', 'Biedronka', 'Notka', 'Shopping', 'Cash', 200, moment('2020-10-20', "YYYY-MM-DD").toDate(), '', 'bag-handle'),
    new Transaction('t2', 'expense', 'Kino', '', 'Entertaiment', 'Card', 50, moment('2020-10-20', "YYYY-MM-DD").toDate(), '', 'game-controller'),
    new Transaction('t3', 'deposit', 'Przychód', '', 'Deposit', 'Cash', 250, moment('2020-10-20', "YYYY-MM-DD").toDate(), '', 'card'),
  ]);
  get transactions() {
    return this._transactions.asObservable()
  }
  constructor() { }

  getTransaction(id: string) {
    return this.transactions.pipe(
      take(1),
      map(transactions => {
        return { ...transactions.find(t => t.id === id) };
      })
    );
  }
  addTransaction(
    type: string,
    title: string,
    note: string,
    category: string,
    account: string,
    amount: number,
    date: Date,
    imageUrl: string,
    icon: string) {
    const newTransaction = new Transaction(Math.random().toString(), type, title, note, category, account, amount, date, imageUrl, icon);
    return this._transactions.pipe(take(1), tap(transactions => {
      this._transactions.next(transactions.concat(newTransaction));
    }));
  }

  updateTransaction(
    transactionId: string,
    title: string,
    type: string,
    note: string,
    category: string,
    account: string,
    amount: number,
    date: Date,
    icon: string) {
    return this.transactions.pipe(take(1), tap(transactions => {
      const updatedTransactionsIndex = transactions.findIndex(tr => tr.id === transactionId);
      const updatedTransactions = [...transactions];
      const oldTransaction = updatedTransactions[updatedTransactionsIndex]
      updatedTransactions[updatedTransactionsIndex] = new Transaction(
        oldTransaction.id, type, title, note,
        category, account, amount, date, oldTransaction.imageUrl, icon);
      this._transactions.next(updatedTransactions);
    }));
  }
  deleteTransaction(transactionId: string) {
    return this._transactions.pipe(
      take(1),
      tap(transactions => {
        this._transactions.next(transactions.filter(t => t.id !== transactionId));
      })
    )
  }
  clearAlldata() {
    return this._transactions = new BehaviorSubject<Transaction[]>([]);
  }
}
