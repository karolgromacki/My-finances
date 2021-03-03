import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonItemSliding, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AccountsService } from '../accounts.service';
import { Account } from '../account.model';
import { TranslateService } from '@ngx-translate/core';
import { Category } from '../../categories/category.model';
import { Transaction } from '../../transactions/transaction.model';
import { TransactionsService } from '../../transactions/transactions.service';
import { CurrencyService } from 'src/app/Services/currency.service';
@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.page.html',
  styleUrls: ['./account-detail.page.scss'],
})
export class AccountDetailPage implements OnInit {
  isLoading = false;
  account: Account;
  array = [];
  loadedTransactions: Transaction[];
  relevantTransactions: Transaction[];
  private accountSub: Subscription;
  private transactionsSub: Subscription;
  private currencySub: Subscription;
  currency;
  constructor(
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private router: Router,
    private toastController: ToastController,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private accountsService: AccountsService,
    private loadingCtrl: LoadingController,
    private transactionsService: TransactionsService,
    private currencyService: CurrencyService,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('accountId')) {
        this.navCtrl.navigateBack('/main/tabs/accounts');
        return;
      }
      this.isLoading = true;
      this.currencySub = this.currencyService.selected.subscribe(selected => {
        this.currency = selected;
      })

      this.accountSub = this.accountsService.getAccount(paramMap.get('accountId')).subscribe(account => {
        this.account = account
        this.transactionsSub = this.transactionsService.transactions.subscribe(transactions => {
          this.loadedTransactions = transactions;
          this.relevantTransactions = transactions.filter(transaction => transaction.account === account.title);
          this.isLoading = false;
        }); },
        error => {
          this.alertCtrl
            .create({
              header: 'An error occurred!',
              message: 'Account could not be fetched. Please try again later.',
              buttons: [
                {
                  text: 'Okay',
                  handler: () => {
                    this.router.navigate(['/main/tabs/accounts']);
                  }
                }
              ]
            })
            .then(alertEl => {
              alertEl.present();
            });
        });
    });
  }
  ionViewWillEnter() {
    this.transactionsService.fetchTransactions().subscribe(()=>{
      this.relevantTransactions?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    });
  }

  ngOnDestroy() {
    if (this.accountSub) {
      this.accountSub.unsubscribe();
    }
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

  onDelete(accountId: string, accountTitle: string) {
    this.alertCtrl.create({
      header: this.translate.instant('deleteDataTitle'),
      message: this.translate.instant('deleteData'),
      buttons: [
        {
          text: this.translate.instant('delete'),
          handler: () => {
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
        },
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
        },
      ]
    }).then(alertEl => {
      alertEl.present();
    });
  
  }
  async presentToast(accountTitle) {
    const toast = await this.toastController.create({
      message: `${accountTitle}` + this.translate.instant('deletedAccount') + `<ion-icon name="checkmark"></ion-icon>`,
      duration: 1400,
      position: 'bottom',
      cssClass: 'tabs-bottom'
    });
    toast.present();
  }

}
