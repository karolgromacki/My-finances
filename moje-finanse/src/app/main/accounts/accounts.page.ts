import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AccountsService } from './accounts.service';
import { Account } from './account.model';
import { SegmentChangeEventDetail } from '@ionic/core';
import { TransactionsService } from '../transactions/transactions.service';
import { Transaction } from '../transactions/transaction.model';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
})
export class AccountsPage implements OnInit {
  sum: number;
  segment = "all";
  relevantAccounts: Account[];
  relevantTransactions: Transaction[];
  private accountsSub: Subscription;
  private transactionsSub: Subscription;

  constructor(
    private accountsService: AccountsService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private transactionsService: TransactionsService
    // private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    let sum;
    this.sum = 0;
    this.accountsSub = this.accountsService.accounts.subscribe(accounts => {
      this.transactionsSub = this.transactionsService.transactions.subscribe(transactions => {
        this.relevantTransactions = transactions;
        this.relevantAccounts = accounts;
        this.relevantAccounts.forEach((account) => {
          sum = account.baseAmount;
          this.relevantTransactions.forEach((transaction) => {
            if (transaction.account === account.title) {
              if (transaction.type === 'expense')
                sum -= transaction.amount;
              else if (transaction.type === 'deposit')
                sum += transaction.amount;
            }
          });
          account.amount = sum;
        });
        console.log(this.sum)
      });
    });
  }

  ngOnDestroy() {
    if (this.accountsSub) {
      this.accountsSub.unsubscribe();
    }

  }
  //CREATE MODAL
  // onNewTransaction(){
  //   this.modalCtrl.create({component: NewTransactionPage, componentProps:{}}).then(modalEl => {modalEl.present()});
  // }
  onEdit(accountId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'main', 'tabs', 'accounts', 'edit', accountId])
  }
  onDelete(accountId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.loadingCtrl.create({
      message: 'Deleting account...'
    }).then(loadingEl => {
      loadingEl.present();
      this.accountsService.deleteAccount(accountId).subscribe(() => {
        loadingEl.dismiss();
      });
    });
  }
  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    if (event.detail.value === 'deposit') {
      // this.relevantTransactions = this.loadedTransactions.filter(account => account.type === 'deposit');
    }

  }

}
