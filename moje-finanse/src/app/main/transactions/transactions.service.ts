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
  private _transactions = new BehaviorSubject<Transaction[]>([]);

  get transactions() {
    return this._transactions.asObservable()
  }
  constructor(private authService: AuthService, private http: HttpClient) { }

  fetchTransactions() {
    let fetchedUserId: string;
    return this.authService.userId.pipe(take(1), switchMap(userId => {
      fetchedUserId = userId;
      return this.authService.token;
    }), take(1),
      switchMap(token => {
        if (!fetchedUserId) {
          throw new Error('No user id found!')
        }
        return this.http.get<{ [key: string]: TransactionData }>(`https://my-finances-b77a0.firebaseio.com/transactions.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`)
      }), map(resData => {
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
    return this.authService.token.pipe(take(1), switchMap(token => {
      return this.http
        .get<TransactionData>(`https://my-finances-b77a0.firebaseio.com/transactions/${id}.json?auth=${token}`)
        .pipe(
          map(transactionData => {
            return new Transaction(id, transactionData.type, transactionData.title, transactionData.note, transactionData.category, transactionData.account, transactionData.amount, transactionData.date, transactionData.imageUrl, transactionData.icon, transactionData.userId);
          })
        );
    }));
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);
    return this.authService.token.pipe(switchMap(token => {
      return this.http.post<{ imageUrl: string, imagePath: string }>('https://us-central1-my-finances-b77a0.cloudfunctions.net/storeImage', uploadData, {headers: {Authorization: 'Bearer '+ token}});
    }))
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
    let newTransaction: Transaction;
    let fetchedUserId: string;
    return this.authService.userId.pipe(take(1), switchMap(userId => {
      if (!userId) {
        throw new Error('No user id found!')
      }
      fetchedUserId = userId;
      return this.authService.token;
    }), take(1), switchMap(token => {
      newTransaction = new Transaction(Math.random().toString(), type, title, note, category, account, amount, date, imageUrl, icon, fetchedUserId);
      return this.http.post<{ name: string }>(`https://my-finances-b77a0.firebaseio.com/transactions.json?auth=${token}`, { ...newTransaction, id: null })
    }), switchMap(resData => {
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
    account: string,
    amount: number,
    date: Date,
    icon: string) {
    let updatedTransactions: Transaction[];
    return this.authService.token.pipe(take(1), switchMap(token => {
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
            category, account, amount, date, oldTransaction.imageUrl, icon, oldTransaction.userId);
          return this.http.put(`https://my-finances-b77a0.firebaseio.com/transactions/${transactionId}.json?auth=${token}`,
            { ...updatedTransactions[updatedTransactionsIndex], id: null });
        }),
        tap(() => {
          this._transactions.next(updatedTransactions);
        })
      );
    }));
  }

  deleteTransaction(transactionId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(`https://my-finances-b77a0.firebaseio.com/transactions/${transactionId}.json?auth=${token}`);
      }),
      switchMap(() => {
        return this.transactions;
      }),
      take(1),
      tap(transactions => {
        this._transactions.next(transactions.filter(a => a.id !== transactionId));
      })
    );
  }
}





