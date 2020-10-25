import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Transaction } from '../transaction.model';
import { TransactionsService } from '../transactions.service';

@Component({
  selector: 'app-edit-transaction',
  templateUrl: './edit-transaction.page.html',
  styleUrls: ['./edit-transaction.page.scss'],
})
export class EditTransactionPage implements OnInit {
  form: FormGroup;
  transaction: Transaction;
  private transactionSub: Subscription;
  constructor(private route: ActivatedRoute, private navCtrl: NavController, private transactionsService: TransactionsService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('transactionId')) {
        this.navCtrl.navigateBack('/main/tabs/transactions');
        return;
      }
      this.transactionSub = this.transactionsService.getTransaction(paramMap.get('transactionId')).subscribe(transaction => {
        this.transaction = transaction;
        this.form = new FormGroup({
          type: new FormControl(this.transaction.type, { updateOn: 'change', validators: [Validators.required] }),
          title: new FormControl(this.transaction.title, { updateOn: 'change', validators: [Validators.required, Validators.maxLength(20)] }),
          amount: new FormControl(this.transaction.amount, { updateOn: 'change', validators: [Validators.required, Validators.min(0.01)] }),
          note: new FormControl(this.transaction.note, { updateOn: 'blur' }),
          date: new FormControl(this.transaction.date.toISOString(), { updateOn: 'change', validators: [Validators.required] }),
          account: new FormControl(this.transaction.account, { updateOn: 'change', validators: [Validators.required] }),
          category: new FormControl(this.transaction.category, { updateOn: 'change', validators: [Validators.required] }),
        });
      });

    });
  }
  ngOnDestroy() {
    if(this.transactionSub){
      this.transactionSub.unsubscribe();
    }
  }
  onUpdateTransaction() {
    if (!this.form.valid) {
      return;
    }
    console.log(this.form);
  }

}
