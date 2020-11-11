import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonItemSliding, LoadingController, ModalController, NavController } from '@ionic/angular';
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
  constructor(private route: ActivatedRoute, private navCtrl: NavController, private transactionsService: TransactionsService, private loadingCtrl: LoadingController) { }

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
      message: 'Deleting transaction...'
    }).then(loadingEl => {
      loadingEl.present();
      this.transactionsService.deleteTransaction(transactionId).subscribe(() => {
        loadingEl.dismiss();
      });
    });
  }
}
