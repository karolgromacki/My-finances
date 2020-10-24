import { Component, OnInit } from '@angular/core';
import { Transaction } from './transaction.model';
import { TransactionsService } from './transactions.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {
  color = 'primary'
  loadedTransactions: Transaction[];

  constructor(private transactionsService: TransactionsService) { }

  ngOnInit() {
    this.loadedTransactions = this.transactionsService.transactions;
  }

}
