import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { BudgetService } from 'src/app/main/budget/budget.service';

@Component({
  selector: 'app-edit-budget',
  templateUrl: './edit-budget.page.html',
  styleUrls: ['./edit-budget.page.scss'],
})
export class EditBudgetPage implements OnInit {
  form: FormGroup;
  constructor(private budgetService: BudgetService, private translate: TranslateService, private router: Router, private loadingCtrl: LoadingController, private toastController: ToastController) { }

  ngOnInit() {
    this.budgetService.budget.subscribe(budget => {
      this.form = new FormGroup({
        baseAmount: new FormControl(budget.baseAmount, { updateOn: 'change', validators: [Validators.required, Validators.min(0.01)] }),
        period: new FormControl(budget.period, { updateOn: 'change', validators: [Validators.required] }),
      });
    })
  }
  onUpdateBudget() {
    this.loadingCtrl.create({
      message: this.translate.instant('editingBudget')
    }).then(loadingEl => {
      loadingEl.present();

      this.budgetService.addBudget(
        this.form.value.baseAmount,
        this.form.value.period).subscribe(() => {
          loadingEl.dismiss();
          this.presentToast();
          this.form.reset();
          this.router.navigate(['/', 'main', 'tabs', 'transactions']);
        });
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
