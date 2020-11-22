import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonItemSliding, LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { EditTransactionPage } from '../edit-transaction/edit-transaction.page';
import { Transaction } from '../transaction.model';
import { TransactionsService } from '../transactions.service';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.page.html',
  styleUrls: ['./transaction-detail.page.scss'],
})
export class TransactionDetailPage implements OnInit {
  transaction: Transaction;
  private transactionSub: Subscription;
  constructor(private translate: TranslateService, private toastController: ToastController, private route: ActivatedRoute, private navCtrl: NavController, private transactionsService: TransactionsService, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('transactionId')) {
        this.navCtrl.navigateBack('/main/tabs/transactions');
        return;
      }
      this.transactionSub = this.transactionsService.getTransaction(paramMap.get('transactionId')).subscribe(transaction => this.transaction = transaction);
    });
  }
  ngOnDestroy() {
    if (this.transactionSub) {
      this.transactionSub.unsubscribe()
    }
  }
  onDelete(transactionId: string) {
    this.loadingCtrl.create({
      message: this.translate.instant('deletingTransaction'),
    }).then(loadingEl => {
      loadingEl.present();
      this.transactionsService.deleteTransaction(transactionId).subscribe(() => {
        loadingEl.dismiss();
        this.presentToast();
      });
    });
  }
  async presentToast() {
    const toast = await this.toastController.create({
      message: `'${this.transaction.title}'` + this.translate.instant('deletedTransaction') + `<ion-icon name="checkmark"></ion-icon>`,
      duration: 1400,
      position: 'bottom',
      cssClass: 'tabs-bottom'
    });
    toast.present();
  }
}
