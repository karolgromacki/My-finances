import { Injectable } from '@angular/core';
import { Account } from './account.model';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AccountsService {
    private _accounts = new BehaviorSubject<Account[]>([
        new Account('t1', 'Card', 'PKO', 0, 0),
        new Account('t2', 'Cash', 'Savings', 0, 0)
    ]);
    get accounts() {
        return this._accounts.asObservable()
    }
    constructor() { }

    getAccount(id: string) {
        return this.accounts.pipe(
            take(1),
            map(accounts => {
                return { ...accounts.find(t => t.id === id) };
            })
        );
    }
    addAccount(
        title: string,
        note: string,
        amount: number) {
        const newTransaction = new Account(Math.random().toString(), title, note, amount, amount);
        return this._accounts.pipe(take(1), tap(accounts => {
            this._accounts.next(accounts.concat(newTransaction));
        }));
    }

    updateAccount(
        accountId: string,
        title: string,
        note: string,
        amount: number) {
        return this.accounts.pipe(take(1), tap(accounts => {
            const updatedTransactionsIndex = accounts.findIndex(tr => tr.id === accountId);
            const updatedTransactions = [...accounts];
            const oldTransaction = updatedTransactions[updatedTransactionsIndex]
            updatedTransactions[updatedTransactionsIndex] = new Account(
                oldTransaction.id, title, note, amount, amount);
            this._accounts.next(updatedTransactions);
        }));
    }
    deleteAccount(accountId: string) {
        return this._accounts.pipe(
            take(1),
            tap(accounts => {
                this._accounts.next(accounts.filter(t => t.id !== accountId));
            })
        )
    }
    clearAlldata() {
        return this._accounts = new BehaviorSubject<Account[]>([]);
    }
}
