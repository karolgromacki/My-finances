import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Account } from '../../accounts/account.model';
import { AccountsService } from '../../accounts/accounts.service';
import { CategoriesService } from '../../categories/categories.service';
import { Category } from '../../categories/category.model';
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
  loadedCategories: Category[];
  loadedAccounts: Account[];
  private transactionSub: Subscription;
  private categoriesSub: Subscription;
  private accountsSub: Subscription;
  icon: string;
  selectedCategory;
  constructor(
    private toastController: ToastController,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private accountsService: AccountsService,
    private categoriesService: CategoriesService,
    private transactionsService: TransactionsService,
    private loadingCtrl: LoadingController,
    private router: Router) { }

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
        this.accountsSub = this.accountsService.accounts.subscribe(accounts => {
          this.loadedAccounts = accounts;
        });
        this.categoriesSub = this.categoriesService.categories.subscribe(categories => {
          this.loadedCategories = categories.filter(category => category.title !== 'Deposit');
          const categoryControl = this.form.get('category');
          this.form.get('type').valueChanges
            .subscribe(userType => {
              if (userType === 'expense') {
                categoryControl.setValue(null);
                categoryControl.setValidators([Validators.required]);

                this.form.get('category').valueChanges
                  .subscribe(userCategory => {
                    this.selectedCategory = this.loadedCategories.find(category => category.title === userCategory);
                  });
              }
              else if (userType === 'deposit') {
                categoryControl.setValue('deposit');
                categoryControl.setValidators(null);
              }
              categoryControl.updateValueAndValidity();
            });
        });

      });
    });
  }

  onUpdateTransaction() {
    console.log(this.form.value.category, this.form.value.type, this.selectedCategory)
    if (!this.form.valid) {
      return;
    }
    if (this.form.value.type === 'deposit') {
      if (this.form.value.category == 'Transfer')
        this.icon = 'swap-horizontal';
      else {
        this.form.value.category = 'Deposit';
        this.icon = 'card';
      }
    }
    else if (this.form.value.type === 'expense') {
      if (this.selectedCategory == null) {
        if (this.form.value.category == 'Transfer')
          this.icon = 'swap-horizontal';
        else {
          this.selectedCategory = this.loadedCategories.find(category => category.title === this.form.value.category);
          this.icon = this.selectedCategory.icon;
        }
      }
      else if (this.selectedCategory !== null)
        this.icon = this.selectedCategory.icon;
    }
    this.loadingCtrl.create({
      message: 'Updating transaction...'
    }).then(loadingEl => {
      loadingEl.present();
      this.transactionsService.updateTransaction(
        this.transaction.id,
        this.form.value.title,
        this.form.value.type,
        this.form.value.note,
        this.form.value.category,
        this.form.value.account,
        this.form.value.amount,
        new Date(this.form.value.date), this.icon
      ).subscribe(() => {
        loadingEl.dismiss();
        this.presentToast();
        this.form.reset();
        this.router.navigate(['/', 'main', 'tabs', 'transactions']);
      });
    });
  }
  async presentToast() {
    const toast = await this.toastController.create({
      message: `Transaction '${this.transaction.title}' has been modified <ion-icon name="checkmark"></ion-icon>`,
      duration: 2000
    });
    toast.present();
  }

  ngOnDestroy() {
    if (this.transactionSub) {
      this.transactionSub.unsubscribe();
    }
    if (this.categoriesSub) {
      this.categoriesSub.unsubscribe();
    }
    if (this.accountsSub) {
      this.accountsSub.unsubscribe();
    }
  }
}
