import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Transaction } from './transaction.model';
import { TransactionsService } from './transactions.service';
import { SegmentChangeEventDetail } from '@ionic/core';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyService } from 'src/app/Services/currency.service';
import { BudgetService } from 'src/app/main/budget/budget.service';
import { Storage } from '@ionic/storage';


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
  budgetTransactions: Transaction[];
  private transactionsSub: Subscription;
  private currencySub: Subscription;
  isLoading = false;
  currency: string;
  selectedBudget;
  budget;
  budgetSum = 0;
  budgetBar;
  constructor(
    private currencyService: CurrencyService,
    private translate: TranslateService,
    private toastController: ToastController,
    private transactionsService: TransactionsService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private budgetService: BudgetService,
    private storage: Storage
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
    this.storage.get('DID_TUTORIAL').then(res => {
      if (res !== true) {
        this.router.navigateByUrl('/main/tutorial');
      }
    });
    this.currencySub = this.currencyService.selected.subscribe(selected => {
      this.currency = selected;
    })
    this.transactionsSub = this.transactionsService.transactions.subscribe(transactions => {
      this.loadedTransactions = transactions;
      this.relevantTransactions = transactions;
    });
    this.budgetService.selected.subscribe(selected => this.selectedBudget = selected);
    this.budgetService.selected.subscribe(budget => this.budget = budget);

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
      this.summarize();
      this.onSearch();
      this.loadedTransactions.forEach(element => {
        element.date = new Date(new Date(element.date).toDateString())
      });
      this.isLoading = false;
      this.relevantTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      this.relevantTransactions.reverse();
      this.budgetFetch();

    });

  }
  budgetFetch() {
    this.budgetService.budget.subscribe(budget => {
      let relevant = [];
      let sum = 0;
      this.budget = budget;
      if (this.budget) {
        if (this.budget.period == 'day') {
          relevant = this.loadedTransactions.filter(transaction => new Date(transaction.date).toDateString() === new Date().toDateString() && transaction.type === 'expense');
        }
        else if (this.budget.period == 'month') {
          relevant = this.loadedTransactions.filter(transaction => new Date(transaction.date).getMonth() === new Date().getMonth() && transaction.type === 'expense');
        }
        else if (this.budget.period == 'year') {
          relevant = this.loadedTransactions.filter(transaction => new Date(transaction.date).getFullYear() === new Date().getFullYear() && transaction.type === 'expense');
        }
        relevant.forEach(element => {
          sum += element.amount;
        });
        if ((this.budget.baseAmount - sum) <= 0) {
          this.budgetSum = 0;
          this.budgetBar = 0;
        }
        else {
          this.budgetSum = this.budget.baseAmount - sum
          this.budgetBar = (this.budgetSum / this.budget.baseAmount * 100).toFixed();
        }
      }
    });
  }
  summarize() {
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
        if (this.segment !== 'all')
          this.relevantTransactions = this.loadedTransactions.filter(transaction => transaction.type === this.segment);
        this.summarize();
        this.budgetFetch();
        loadingEl.dismiss();
        this.presentToast(transactionTitle);
      });
    });

  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.sum = 0;
    if (event.detail.value === 'deposit') {
      this.segment = 'deposit';
      this.relevantTransactions = this.loadedTransactions.filter(transaction => transaction.type === 'deposit');
    }
    else if (event.detail.value === 'expense') {
      this.segment = 'expense';
      this.relevantTransactions = this.loadedTransactions.filter(transaction => transaction.type === 'expense');
    }
    else if (event.detail.value === 'all') {
      this.segment = 'all';
      this.relevantTransactions = this.loadedTransactions;
    }
    this.onSearch();
    this.summarize();
    this.relevantTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    this.relevantTransactions.reverse();
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
