import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { BudgetService } from 'src/app/main/budget/budget.service';
import { Account } from '../../accounts/account.model';
import { AccountsService } from '../../accounts/accounts.service';
import { CategoriesService } from '../../categories/categories.service';
import { Category } from '../../categories/category.model';

@Component({
  selector: 'app-edit-budget',
  templateUrl: './edit-budget.page.html',
  styleUrls: ['./edit-budget.page.scss'],
})
export class EditBudgetPage implements OnInit {
  form: FormGroup;
  loadedCategories: Category[];
  loadedAccounts: Account[];
  constructor(private budgetService: BudgetService,
    private translate: TranslateService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private categoriesService: CategoriesService,
    private toastController: ToastController) { }

  ngOnInit() {
    this.budgetService.budget.subscribe(budget => {
      this.categoriesService.categories.subscribe(categories => {
        this.loadedCategories = categories?.filter(category => category.title !== 'deposit');
        this.form = new FormGroup({
          baseAmount: new FormControl(budget.baseAmount, { updateOn: 'change', validators: [Validators.required, Validators.min(0.01)] }),
          period: new FormControl(budget.period, { updateOn: 'change', validators: [Validators.required] }),
          categories: new FormControl(budget.categories, { updateOn: 'change' }),
        });
      });
    });

  }
  onUpdateBudget() {
    this.loadingCtrl.create({
      message: this.translate.instant('editingBudget')
    }).then(loadingEl => {
      loadingEl.present();

      this.budgetService.addBudget(
        this.form.value.baseAmount,
        this.form.value.period, this.form.value.categories).subscribe(() => {
          loadingEl.dismiss();
          this.presentToast();
          this.form.reset();
          this.router.navigate(['/', 'main', 'tabs', 'transactions']);
        });
    });
  }
  ionViewWillEnter() {
    this.categoriesService.fetchCategories().subscribe(() => {
    });
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: this.translate.instant('editedBudget') + ` <ion-icon name="checkmark"></ion-icon>`,
      duration: 1400,
      position: 'bottom',
      cssClass: 'tabs-bottom'
    });
    toast.present();
  }
}
