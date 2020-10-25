import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
// import { NewTransactionPage } from './new-transaction/new-transaction.page';
import { Transaction } from './transaction.model';
import { TransactionsService } from './transactions.service';
import { SegmentChangeEventDetail } from '@ionic/core';


@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {
  color = 'primary'
  relevantTransactions: Transaction[];
  loadedTransactions: Transaction[];
  private transactionsSub: Subscription

  constructor(
    private transactionsService: TransactionsService,
    private router: Router
    // private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.transactionsSub = this.transactionsService.transactions.subscribe(transactions => {
      this.loadedTransactions = transactions;
      this.relevantTransactions = this.loadedTransactions;
    });

  }
  ngOnDestroy() {
    if (this.transactionsSub) {
      this.transactionsSub.unsubscribe();
    }

  }
  //CREATE MODAL
  // onNewTransaction(){
  //   this.modalCtrl.create({component: NewTransactionPage, componentProps:{}}).then(modalEl => {modalEl.present()});
  // }
  onEdit(transactionId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'main', 'tabs', 'transactions', 'edit', transactionId])
  }
  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    if (event.detail.value === 'all') {
      this.relevantTransactions = this.loadedTransactions;
    }
    else if (event.detail.value === 'expense') {
      this.relevantTransactions = this.loadedTransactions.filter(transaction => transaction.type === 'expense');
    }
    else {
      this.relevantTransactions = this.loadedTransactions.filter(transaction => transaction.type === 'deposit');
    }

  }
}
