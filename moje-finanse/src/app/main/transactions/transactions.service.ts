import { Injectable } from '@angular/core';
import { Transaction } from './transaction.model';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private _transactions = new BehaviorSubject<Transaction[]>([
    new Transaction('t1', 'expense', 'Biedronka', 'Notka', 'Zakupy', 'cash', 200, moment('2020-10-20', "YYYY-MM-DD").toDate(), 'https://gfx.wiadomosci.radiozet.pl/var/radiozetwiadomosci/storage/images/polska/koronawirus.-dolny-slask.-kobieta-z-koronawirusem-na-zakupach-w-biedronce/7076823-1-pol-PL/Kobieta-z-koronawirusem-na-zakupach-w-Biedronce-i-Rossmannie_article.jpg'),
    new Transaction('t2', 'expense', 'Kino', '', 'Rozrywka', 'card', 50, moment('2020-10-20', "YYYY-MM-DD").toDate(), 'https://www.elleman.pl/media/cache/default_view/uploads/media/default/0005/42/helios-wznawia-dzialalnosc-kino-z-okazji-ponownego-otwarcia-przygotowalo-specjalne-oferty.jpeg'),
    new Transaction('t3', 'deposit', 'Przychód', '', 'Wypłata', 'cash', 250, moment('2020-10-20', "YYYY-MM-DD").toDate(), 'https://www.investopedia.com/thmb/lqOcGlE7PI6vLMzhn5EDdO0HvYk=/1337x1003/smart/filters:no_upscale()/GettyImages-1054017850-7ef42af7b8044d7a86cfb2bff8641e1d.jpg'),
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
    imageUrl: string,) {
    const newTransaction = new Transaction(Math.random().toString(), type, title, note, category, account, amount, date, imageUrl);
    this._transactions.pipe(take(1)).subscribe(transactions => {
      this._transactions.next(transactions.concat(newTransaction));
    });

  }
}
