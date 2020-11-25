import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
// import { NewTransactionPage } from './new-transaction/new-transaction.page';
import { Transaction } from './transaction.model';
import { TransactionsService } from './transactions.service';
import { SegmentChangeEventDetail } from '@ionic/core';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyService } from 'src/app/Services/currency.service';


@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {
  segment = 'all';
  hide = false;
  isSearchbarOpened = false;
  sum: number;
  title: string = '';
  amount: string = '';
  relevantTransactions: Transaction[];
  loadedTransactions: Transaction[];
  private transactionsSub: Subscription;
  private currencySub: Subscription;
  isLoading = false;
  currency: string;
  constructor(
    private currencyService: CurrencyService,
    private translate: TranslateService,
    private toastController: ToastController,
    private transactionsService: TransactionsService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) { }

  onSearch() {
    this.relevantTransactions = this.loadedTransactions.filter(transaction => {
      if (this.segment != 'all') {
        return this.segment || this.title || this.amount ?
          transaction.type === this.segment && (transaction.title.toLowerCase().includes(this.title.toLowerCase()) || transaction.amount.toString().toLowerCase().includes(this.amount.toLowerCase())) :
          true;
      }
      else {
        return this.title || this.amount ?
          transaction.title.toLowerCase().includes(this.title.toLowerCase()) || transaction.amount.toString().toLowerCase().includes(this.amount.toLowerCase()) :
          true;
      }
    }
    );
  }
  ngOnInit() {
    this.currencySub = this.currencyService.selected.subscribe(selected => {
      this.currency = selected;
    })
    this.transactionsSub = this.transactionsService.transactions.subscribe(transactions => {
      this.loadedTransactions = transactions;
      this.relevantTransactions = transactions;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.transactionsService.fetchTransactions().subscribe(() => {
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
      this.loadedTransactions.forEach(element => {
        element.date = new Date(new Date(element.date).toDateString())
      });
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    if (this.transactionsSub) {
      this.transactionsSub.unsubscribe();
    }
    if (this.currencySub) {
      this.currencySub.unsubscribe();
    }
  }
  onEdit(transactionId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'main', 'tabs', 'transactions', 'edit', transactionId]);
  }

  onDelete(transactionId: string, transactionTitle: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.loadingCtrl.create({
      message: this.translate.instant('deletingTransaction')
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
      this.onSearch();
      this.sum = 0;
      this.relevantTransactions.forEach((transaction) => {
        this.sum += transaction.amount;
      });
    }
    else if (event.detail.value === 'expense') {
      this.segment = 'expense';
      this.relevantTransactions = this.loadedTransactions.filter(transaction => transaction.type === 'expense');
      this.onSearch();
      this.sum = 0;
      this.relevantTransactions.forEach((transaction) => {
        this.sum -= transaction.amount;
      });
    }
    else {
      this.segment = 'all';
      this.relevantTransactions = this.loadedTransactions;
      this.onSearch();
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
      message: `'${transactionTitle}'` + this.translate.instant('deletedTransaction') + `<ion-icon name="checkmark"></ion-icon>`,
      duration: 1400,
      position: 'bottom',
      cssClass: 'tabs-bottom'
    });
    toast.present();
  }
}
