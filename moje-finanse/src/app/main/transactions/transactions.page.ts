import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding, LoadingController, ModalController, ToastController } from '@ionic/angular';
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
  segment = 'all';
  sum: number;
  relevantTransactions: Transaction[];
  loadedTransactions: Transaction[];
  private transactionsSub: Subscription;

  constructor(
    private toastController: ToastController,
    private transactionsService: TransactionsService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.transactionsSub = this.transactionsService.transactions.subscribe(transactions => {
      this.relevantTransactions = transactions;
      this.relevantTransactions.sort((a, b) => b.date.valueOf() - a.date.valueOf())
    });
  }
  ionViewWillEnter() {
    this.transactionsSub = this.transactionsService.transactions.subscribe(transactions => {
      this.loadedTransactions = transactions;
      this.loadedTransactions.sort((a, b) => b.date.valueOf() - a.date.valueOf())
      if (this.segment === 'deposit') {
        this.relevantTransactions = this.loadedTransactions.filter(transaction => transaction.type === 'deposit');
      }
      else if (this.segment === 'expense') {
        this.relevantTransactions = this.loadedTransactions.filter(transaction => transaction.type === 'expense');
      }
      else {
        this.relevantTransactions = this.loadedTransactions;
      }
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
  ngOnDestroy() {
    if (this.transactionsSub) {
      this.transactionsSub.unsubscribe();
    }

  }
  onEdit(transactionId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'main', 'tabs', 'transactions', 'edit', transactionId]);
  }
  onDelete(transactionId: string, transactionTitle: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.loadingCtrl.create({
      message: 'Deleting transaction...'
    }).then(loadingEl => {
      loadingEl.present();
      this.transactionsService.deleteTransaction(transactionId).subscribe(() => {
        loadingEl.dismiss();
        this.presentToast(transactionTitle);
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
  async presentToast(transactionTitle: string) {
    const toast = await this.toastController.create({
      message: `Transaction '${transactionTitle}' has been deleted <ion-icon name="checkmark"></ion-icon>`,
      duration: 2000,
    });
    toast.present();
  }
}
