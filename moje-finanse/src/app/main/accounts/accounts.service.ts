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
    private _accounts = new BehaviorSubject<Account[]>([]);
    get accounts() {
        return this._accounts.asObservable()
    }
    constructor(
        private authService: AuthService,
        private http: HttpClient,
        private storage: Storage) { }

    fetchAccounts() {
        let fetchedUserId: string
        return this.authService.userId.pipe(take(1), switchMap(userId => {
            fetchedUserId = userId;
            return this.authService.token;
        }), take(1), switchMap(token => {
            if (!fetchedUserId) {
                throw new Error('No user id found!')
            }
            return this.http.get<{ [key: string]: AccountData }>(`https://my-finances-b77a0.firebaseio.com/accounts.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`)
        }),
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
        return this.authService.token.pipe(take(1), switchMap(token => {
            return this.http
                .get<AccountData>(`https://my-finances-b77a0.firebaseio.com/accounts/${id}.json?auth=${token}`)
                .pipe(
                    map(accountData => {
                        return new Account(id, accountData.title, accountData.note, accountData.amount, accountData.baseAmount, accountData.userId);
                    })
                );
        }));
    }
    
    addAccount(
        title: string,
        note: string,
        amount: number) {
        let generatedId: string;
        let newAccount: Account;
        let fetchedUserId: string;
        return this.authService.userId.pipe(take(1), switchMap(userId => {
            if (!userId) {
                throw new Error('No user id found!')
            }
            fetchedUserId = userId;
            return this.authService.token;
        }), take(1),
            switchMap(token => {
                newAccount = new Account(Math.random().toString(), title, note, amount, amount, fetchedUserId);
                return this.http.post<{ name: string }>(`https://my-finances-b77a0.firebaseio.com/accounts.json?auth=${token}`, { ...newAccount, id: null });
            }),
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
    }

    updateAccount(
        accountId: string,
        title: string,
        note: string,
        amount: number) {
        let updatedAccounts: Account[];
        return this.authService.token.pipe(take(1), switchMap(token => {
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
                        amount, oldAccount.userId);
                    return this.http.put(`https://my-finances-b77a0.firebaseio.com/accounts/${accountId}.json?auth=${token}`,
                        { ...updatedAccounts[updatedAccountsIndex], id: null });
                }),
                tap(() => {
                    this._accounts.next(updatedAccounts);
                })
            );
        }));
    }

    deleteAccount(accountId: string) {
        return this.authService.token.pipe(take(1), switchMap(token => {
            return this.http.delete(`https://my-finances-b77a0.firebaseio.com/accounts/${accountId}.json?auth=${token}`);
        }),
            switchMap(() => {
                return this.accounts;
            }),
            take(1),
            tap(accounts => {
                this._accounts.next(accounts.filter(a => a.id !== accountId));
            })
        );
    }
}
