import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AccountsService } from '../../accounts/accounts.service';
import { TransactionsService } from '../transactions.service';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.page.html',
  styleUrls: ['./transfer.page.scss'],
})
export class TransferPage implements OnInit {
  form: FormGroup;
  loadedAccounts;
  private accountsSub: Subscription;
  private categoriesSub: Subscription;
  icon;
  constructor(
    private toastController: ToastController,
    private navCtrl: NavController,
    private transactionService: TransactionsService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private accountsService: AccountsService,
    //private categoriesService: CategoriesService
  ) { }

  ngOnInit() {
    this.accountsSub = this.accountsService.accounts.subscribe(account => {
      this.form = new FormGroup({
        // title: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.maxLength(20)] }),
        amount: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.min(0.01)] }),
        note: new FormControl(null, { updateOn: 'blur' }),
        accountTo: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
        accountFrom: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
        date: new FormControl(new Date(Date.now()).toDateString(), { updateOn: 'change', validators: [Validators.required] })
      });
      this.loadedAccounts = account;

    });
  }
  onCreateTransfer() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl.create({
      message: 'Creating transaction...'
    }).then(loadingEl => {
      loadingEl.present();
      this.transactionService.addTransaction(
        'expense',
        'Transfer',
        '',
        'Transfer',
        this.form.value.accountFrom,
        this.form.value.amount,
        new Date(this.form.value.date), '', 'swap-horizontal').subscribe(() => {
        });
      this.transactionService.addTransaction(
        'deposit',
        'Transfer',
        '',
        'Transfer',
        this.form.value.accountTo,
        this.form.value.amount,
        new Date(this.form.value.date), '', 'swap-horizontal').subscribe(() => {
          loadingEl.dismiss();
          this.presentToast();
          this.form.reset();
          this.navCtrl.back();
        });
    });
  }
  async presentToast() {
    const toast = await this.toastController.create({
      message: `New transfer has been created <ion-icon name="checkmark"></ion-icon>`,
      duration: 2000,
    });
    toast.present();
  }

}
