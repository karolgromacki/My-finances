import { Injectable } from '@angular/core';
import { Account } from './account.model';
import * as moment from 'moment';
import { BehaviorSubject, from, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';

interface AccountData {
    amount: number;
    baseAmount: number;
    note: string;
    title: string;
    userId: string
}

@Injectable({
    providedIn: 'root'
})
export class AccountsService {
    private _accounts = new BehaviorSubject<Account[]>([
        // new Account('t1', 'Card', 'PKO', 0, 0),
        // new Account('t2', 'Cash', 'Savings', 0, 0)
    ]);
    get accounts() {
        return this._accounts.asObservable()
    }
    constructor(private authService: AuthService, private http: HttpClient, private storage: Storage) { }

    fetchAccounts() {
        return this.http.get<{ [key: string]: AccountData }>(`https://my-finances-b77a0.firebaseio.com/accounts.json?orderBy="userId"&equalTo="${this.authService.userId}"`).pipe(
            map(resData => {
                const accounts = [];
                for (const key in resData) {
                    if (resData.hasOwnProperty(key)) {
                        accounts.push(
                            new Account(
                                key,
                                resData[key].title,
                                resData[key].note,
                                resData[key].amount,
                                resData[key].baseAmount,
                                resData[key].userId
                            )
                        );
                    }
                }
                return accounts;
            }),
            tap(accounts => {
                this._accounts.next(accounts);
            })
        );
    }

    getAccount(id: string) {
        return this.http
            .get<AccountData>(`https://my-finances-b77a0.firebaseio.com/accounts/${id}.json`)
            .pipe(
                map(accountData => {
                    return new Account(id, accountData.title, accountData.note, accountData.amount, accountData.baseAmount, accountData.userId);
                })
            );
        // this.accounts.pipe(
        //     take(1),
        //     map(accounts => {
        //         return { ...accounts.find(t => t.id === id) };
        //     })
        // );
    }
    addAccount(
        title: string,
        note: string,
        amount: number) {
        let generatedId: string;
        const newAccount = new Account(Math.random().toString(), title, note, amount, amount, this.authService.userId);

        //HTTP
        return this.http.post<{ name: string }>('https://my-finances-b77a0.firebaseio.com/accounts.json', { ...newAccount, id: null })
            .pipe(
                switchMap(resData => {
                    generatedId = resData.name;
                    return this.accounts;
                }),
                take(1),
                tap(accounts => {
                    newAccount.id = generatedId;
                    this._accounts.next(accounts.concat(newAccount));
                })

            );

        // DEFAULT
        // return this._accounts.pipe(take(1), tap(accounts => {
        //     this._accounts.next(accounts.concat(newAccount));
        // }));
    }

    updateAccount(
        accountId: string,
        title: string,
        note: string,
        amount: number) {
        let updatedAccounts: Account[];
        return this.accounts.pipe(
            take(1),
            switchMap(accounts => {
                if (accounts || accounts.length <= 0) {
                    return this.fetchAccounts();
                }
                else {
                    return of(accounts);
                }

            }),
            switchMap(accounts => {
                const updatedAccountsIndex = accounts.findIndex(tr => tr.id === accountId);
                const updatedAccounts = [...accounts];
                const oldAccount = updatedAccounts[updatedAccountsIndex]
                updatedAccounts[updatedAccountsIndex] = new Account(
                    oldAccount.id,
                    title,
                    note,
                    amount,
                    amount, this.authService.userId);
                return this.http.put(`https://my-finances-b77a0.firebaseio.com/accounts/${accountId}.json`,
                    { ...updatedAccounts[updatedAccountsIndex], id: null });
            }),
            tap(() => {
                this._accounts.next(updatedAccounts);
            })
        );
    }
    deleteAccount(accountId: string) {
        return this.http.delete(`https://my-finances-b77a0.firebaseio.com/accounts/${accountId}.json`).pipe(
            switchMap(() => {
                return this.accounts;
            }),
            take(1),
            tap(accounts => {
                this._accounts.next(accounts.filter(a => a.id !== accountId));
            }));

        // DEFAULT
        // return this._accounts.pipe(
        //     take(1),
        //     tap(accounts => {
        //         this._accounts.next(accounts.filter(a => a.id !== accountId));
        //     })
        // )
    }
    clearAlldata() {
        return this._accounts = new BehaviorSubject<Account[]>([]);
    }
}
