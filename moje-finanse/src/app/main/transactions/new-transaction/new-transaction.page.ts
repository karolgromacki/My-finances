import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { TransactionsService } from '../transactions.service';

@Component({
  selector: 'app-new-transaction',
  templateUrl: './new-transaction.page.html',
  styleUrls: ['./new-transaction.page.scss'],
})
export class NewTransactionPage implements OnInit {
  form: FormGroup;

  constructor(private transactionService: TransactionsService, private router: Router, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.form = new FormGroup({
      type: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
      title: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.maxLength(20)] }),
      amount: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.min(0.01)] }),
      note: new FormControl(null, { updateOn: 'blur' }),
      date: new FormControl(new Date(Date.now()).toISOString(), { updateOn: 'change', validators: [Validators.required] }),
      account: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
      category: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
    });
  }
  onCreateTransaction() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl.create({
      message: 'Creating transaction...'
    }).then(loadingEl => {
      loadingEl.present();
      this.transactionService.addTransaction(
        this.form.value.type,
        this.form.value.title,
        this.form.value.note,
        this.form.value.category,
        this.form.value.account,
        this.form.value.amount,
        new Date(this.form.value.date), '').subscribe(() => {
          loadingEl.dismiss();
          this.form.reset();
          this.router.navigate(['/', 'main', 'tabs', 'transactions']);
        });
    });

    

  }
}
