import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AccountsService } from '../../accounts/accounts.service';
import { TransactionsService } from '../transactions.service';
import { Account } from '../../accounts/account.model';
import { CategoriesService } from '../../categories/categories.service';
import { Category } from '../../categories/category.model';

@Component({
  selector: 'app-new-transaction',
  templateUrl: './new-transaction.page.html',
  styleUrls: ['./new-transaction.page.scss'],
})
export class NewTransactionPage implements OnInit {
  form: FormGroup;
  loadedAccounts: Account[];
  loadedCategories: Category[];
  private accountsSub: Subscription;
  private categoriesSub: Subscription;
  constructor(
    private transactionService: TransactionsService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private accountsService: AccountsService,
    private categoriesService: CategoriesService
  ) { }

  ngOnInit() {
    this.categoriesSub = this.categoriesService.categories.subscribe(category => {
      this.accountsSub = this.accountsService.accounts.subscribe(account => {
        this.form = new FormGroup({
          type: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
          title: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.maxLength(20)] }),
          amount: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.min(0.01)] }),
          note: new FormControl(null, { updateOn: 'blur' }),
          date: new FormControl(new Date(Date.now()).toISOString(), { updateOn: 'change', validators: [Validators.required] }),
          account: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
          category: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
        });
        this.loadedAccounts = account;
      });
      this.loadedCategories = category;
    });
  }

  setUserCategoryValidators() {
    const categoryControl = this.form.get('category');
    this.form.get('type').valueChanges
      .subscribe(userCategory => {
        if (userCategory === 'expense') {
          categoryControl.setValidators([Validators.required]);
        }
        if (userCategory === 'deposit') {
          categoryControl.setValidators(null);
        }
        categoryControl.updateValueAndValidity();
      });
  }

  onCreateTransaction() {
    if (!this.form.valid) {
      return;
    }
    if (this.form.value.type === 'deposit' || this.form.value.category === '') {
      this.form.value.category = 'deposit';
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
