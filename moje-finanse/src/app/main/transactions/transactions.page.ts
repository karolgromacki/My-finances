import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding, LoadingController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
// import { NewTransactionPage } from './new-transaction/new-transaction.page';
import { Transaction } from './transaction.model';
import { TransactionsService } from './transactions.service';
import { SegmentChangeEventDetail } from '@ionic/core';
import { CategoriesService } from '../categories/categories.service';


@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {
  segment = "all";
  sum: number;
  relevantTransactions: Transaction[];
  loadedTransactions: Transaction[];
  private transactionsSub: Subscription;
  private categoriesSub: Subscription;

  constructor(
    private transactionsService: TransactionsService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private categoriesService: CategoriesService
    // private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.transactionsSub = this.transactionsService.transactions.subscribe(transactions => {
      this.loadedTransactions = transactions;
      this.relevantTransactions = this.loadedTransactions;
      this.sum = 0;
      this.relevantTransactions.forEach((transaction) => {
        if (transaction.type === 'deposit') {
          this.sum += transaction.amount;
        }
        else if (transaction.type === 'expense') {
          this.sum -= transaction.amount;
        }
      });
    });
  }
  ionViewWillEnter() {
    this.transactionsSub = this.transactionsService.transactions.subscribe(transactions => {
      this.loadedTransactions = transactions;
      if (this.segment === 'deposit')
        this.relevantTransactions = this.loadedTransactions.filter(transaction => transaction.type === 'deposit');
      else if (this.segment === 'expense')
        this.relevantTransactions = this.loadedTransactions.filter(transaction => transaction.type === 'expense');
      else
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
  onDelete(transactionId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.loadingCtrl.create({
      message: 'Deleting transaction...'
    }).then(loadingEl => {
      loadingEl.present();
      this.transactionsService.deleteTransaction(transactionId).subscribe(() => {
        loadingEl.dismiss();
      });
    });
  }
  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    if (event.detail.value === 'deposit') {
      this.segment = 'deposit';
      this.relevantTransactions = this.loadedTransactions.filter(transaction => transaction.type === 'deposit');
      this.sum = 0;
      this.relevantTransactions.forEach((transaction) => {
        this.sum += transaction.amount;
      });
    }
    else if (event.detail.value === 'expense') {
      this.segment = 'expense';
      this.relevantTransactions = this.loadedTransactions.filter(transaction => transaction.type === 'expense');
      this.sum = 0;
      this.relevantTransactions.forEach((transaction) => {
        this.sum -= transaction.amount;
      });
    }
    else {
      this.segment = 'all';
      this.relevantTransactions = this.loadedTransactions;
      this.sum = 0;
      this.relevantTransactions.forEach((transaction) => {
        if (transaction.type === 'deposit') {
          this.sum += transaction.amount;
        }
        else if (transaction.type === 'expense') {
          this.sum -= transaction.amount;
        }
      });
    }
  }
}
