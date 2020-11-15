import { Injectable } from '@angular/core';
import { Transaction } from './transaction.model';
import * as moment from 'moment';
import { BehaviorSubject, from, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';

interface TransactionData {
  id: string;
  type: string;
  title: string;
  note: string;
  category: string;
  account: string;
  amount: number;
  date: Date;
  imageUrl: string;
  icon: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private _transactions = new BehaviorSubject<Transaction[]>([
    // new Transaction('t1', 'Card', 'PKO', 0, 0),
    // new Transaction('t2', 'Cash', 'Savings', 0, 0)
  ]);
  get transactions() {
    return this._transactions.asObservable()
  }
  constructor(private authService: AuthService, private http: HttpClient, private storage: Storage) { }

  fetchTransactions() {
    return this.http.get<{ [key: string]: TransactionData }>(`https://my-finances-b77a0.firebaseio.com/transactions.json?orderBy="userId"&equalTo="${this.authService.userId}"`).pipe(
      map(resData => {
        const transactions = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            transactions.push(
              new Transaction(
                key,
                resData[key].type,
                resData[key].title,
                resData[key].note,
                resData[key].category,
                resData[key].account,
                resData[key].amount,
                resData[key].date,
                resData[key].imageUrl,
                resData[key].icon,
                resData[key].userId
              )
            );
          }
        }
        return transactions.sort((a, b) => b.date.valueOf() - a.date.valueOf());

      }),
      tap(transactions => {
        this._transactions.next(transactions);
      })
    );
  }

  getTransaction(id: string) {
    return this.http
      .get<TransactionData>(`https://my-finances-b77a0.firebaseio.com/transactions/${id}.json`)
      .pipe(
        map(transactionData => {
          return new Transaction(id, transactionData.type, transactionData.title, transactionData.note, transactionData.category, transactionData.account, transactionData.amount, transactionData.date, transactionData.imageUrl, transactionData.icon, transactionData.userId);
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
    let generatedId: string;
    const newTransaction = new Transaction(Math.random().toString(), type, title, note, category, account, amount, date, imageUrl, icon, this.authService.userId);

    //HTTP
    return this.http.post<{ name: string }>('https://my-finances-b77a0.firebaseio.com/transactions.json', { ...newTransaction, id: null })
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.transactions;
        }),
        take(1),
        tap(transactions => {
          newTransaction.id = generatedId;
          this._transactions.next(transactions.concat(newTransaction));
        })

      );
  }

  updateTransaction(
    transactionId: string,
    title: string,
    type: string,
    note: string,
    category: string,
    transaction: string,
    amount: number,
    date: Date,
    icon: string) {
    let updatedTransactions: Transaction[];
    return this.transactions.pipe(
      take(1),
      switchMap(transactions => {
        if (transactions || transactions.length <= 0) {
          return this.fetchTransactions();
        }
        else {
          return of(transactions);
        }

      }),
      switchMap(transactions => {
        const updatedTransactionsIndex = transactions.findIndex(tr => tr.id === transactionId);
        const updatedTransactions = [...transactions];
        const oldTransaction = updatedTransactions[updatedTransactionsIndex]
        updatedTransactions[updatedTransactionsIndex] = new Transaction(
          oldTransaction.id, type, title, note,
          category, transaction, amount, date, oldTransaction.imageUrl, icon, this.authService.userId);
        return this.http.put(`https://my-finances-b77a0.firebaseio.com/transactions/${transactionId}.json`,
          { ...updatedTransactions[updatedTransactionsIndex], id: null });
      }),
      tap(() => {
        this._transactions.next(updatedTransactions);
      })
    );
  }
  deleteTransaction(transactionId: string) {
    return this.http.delete(`https://my-finances-b77a0.firebaseio.com/transactions/${transactionId}.json`).pipe(
      switchMap(() => {
        return this.transactions;
      }),
      take(1),
      tap(transactions => {
        this._transactions.next(transactions.filter(a => a.id !== transactionId));
      }));

  }
  clearAlldata() {
    return this._transactions = new BehaviorSubject<Transaction[]>([]);
  }
}





