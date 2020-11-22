import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding, LoadingController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AccountsService } from './accounts.service';
import { Account } from './account.model';
import { SegmentChangeEventDetail } from '@ionic/core';
import { TransactionsService } from '../transactions/transactions.service';
import { Transaction } from '../transactions/transaction.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
})
export class AccountsPage implements OnInit {
  sum: number;
  relevantAccounts: Account[];
  relevantTransactions: Transaction[];
  private accountsSub: Subscription;
  private transactionsSub: Subscription;
  isLoading = false;
  constructor(
    private translate: TranslateService,
    private toastController: ToastController,
    private accountsService: AccountsService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private transactionsService: TransactionsService
    // private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.accountsSub = this.accountsService.accounts.subscribe(accounts => {
      let sum;
      this.sum = 0;
      this.transactionsSub = this.transactionsService.transactions.subscribe(transactions => {
        this.relevantTransactions = transactions;
        this.relevantAccounts = accounts;
        this.relevantAccounts?.forEach((account) => {
          sum = account.baseAmount;
          this.relevantTransactions?.forEach((transaction) => {
            if (transaction.account === account.title) {
              if (transaction.type === 'expense') {
                sum -= transaction.amount;
              }
              else if (transaction.type === 'deposit') {
                sum += transaction.amount;
              }
            }
          });
          account.amount = sum;
          this.sum += account.amount;
        });
      });
    });
  }
  ionViewWillEnter() {
    this.isLoading = true;
    this.accountsService.fetchAccounts().subscribe(() => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    if (this.accountsSub) {
      this.accountsSub.unsubscribe();
    }

  }
  onEdit(accountId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'main', 'tabs', 'accounts', 'edit', accountId]);
  }
  onDelete(accountId: string, accountTitle: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.loadingCtrl.create({
      message: this.translate.instant('deletingAccount'),
    }).then(loadingEl => {
      loadingEl.present();
      this.accountsService.deleteAccount(accountId).subscribe(() => {
        loadingEl.dismiss();
        this.presentToast(accountTitle);
      });
    });
  }
  async presentToast(accountTitle) {
    const toast = await this.toastController.create({
      message: `'${accountTitle}'` + this.translate.instant('deletedAccount') + `<ion-icon name="checkmark"></ion-icon>`,
      duration: 1400,
      position: 'bottom',
      cssClass: 'tabs-bottom'
    });
    toast.present();
  }
}
