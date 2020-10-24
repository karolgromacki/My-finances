import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Transaction } from '../transaction.model';
import { TransactionsService } from '../transactions.service';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.page.html',
  styleUrls: ['./transaction-detail.page.scss'],
})
export class TransactionDetailPage implements OnInit {

  transaction: Transaction;

  constructor(private route: ActivatedRoute, private navCtrl: NavController, private transactionsService: TransactionsService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('transactionId')) {
        this.navCtrl.navigateBack('/main/tabs/transactions');
        return;
      }
      this.transaction = this.transactionsService.getTransaction(paramMap.get('transactionId'));
    });
  }
}
