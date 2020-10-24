import { Injectable } from '@angular/core';
import { Transaction } from './transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private _transactions: Transaction[] = [
    new Transaction('t1', 'expense', 'Biedronka', 'Zakupy', 200, 'https://gfx.wiadomosci.radiozet.pl/var/radiozetwiadomosci/storage/images/polska/koronawirus.-dolny-slask.-kobieta-z-koronawirusem-na-zakupach-w-biedronce/7076823-1-pol-PL/Kobieta-z-koronawirusem-na-zakupach-w-Biedronce-i-Rossmannie_article.jpg'),
    new Transaction('t2', 'expense', 'Kino', 'Rozrywka', 50, 'https://www.elleman.pl/media/cache/default_view/uploads/media/default/0005/42/helios-wznawia-dzialalnosc-kino-z-okazji-ponownego-otwarcia-przygotowalo-specjalne-oferty.jpeg'),
    new Transaction('t3', 'deposit', 'Przychód', 'Wypłata', 250, 'https://www.investopedia.com/thmb/lqOcGlE7PI6vLMzhn5EDdO0HvYk=/1337x1003/smart/filters:no_upscale()/GettyImages-1054017850-7ef42af7b8044d7a86cfb2bff8641e1d.jpg'),
  ];

  get transactions() {
    return [...this._transactions]
  }
  constructor() { }
}
