import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Account } from '../../accounts/account.model';
import { AccountsService } from '../accounts.service';

@Component({
  selector: 'app-edit-account',
  templateUrl: './edit-account.page.html',
  styleUrls: ['./edit-account.page.scss'],
})
export class EditAccountPage implements OnInit {
  form: FormGroup;
  account: Account;
  private accountSub: Subscription;
  constructor(private route: ActivatedRoute, private navCtrl: NavController, private accountsService: AccountsService, private loadingCtrl: LoadingController, private router: Router) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('accountId')) {
        this.navCtrl.navigateBack('/main/tabs/accounts');
        return;
      }
      this.accountSub = this.accountsService.getAccount(paramMap.get('accountId')).subscribe(account => {
        this.account = account;
        this.form = new FormGroup({
          title: new FormControl(this.account.title, { updateOn: 'change', validators: [Validators.required, Validators.maxLength(20)] }),
          baseAmount: new FormControl(this.account.baseAmount, { updateOn: 'change', validators: [Validators.required]}),
          note: new FormControl(this.account.note, { updateOn: 'blur' }),
        });
      });

    });
  }
  ngOnDestroy() {
    if (this.accountSub) {
      this.accountSub.unsubscribe();
    }
  }
  onUpdateAccount() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl.create({
      message: 'Updating account...'
    }).then(loadingEl => {
      loadingEl.present();
      this.accountsService.updateAccount(
        this.account.id,
        this.form.value.title,
        this.form.value.note,
        this.form.value.baseAmount,
      ).subscribe(() => {
        loadingEl.dismiss();
        this.form.reset();
        this.router.navigate(['/', 'main', 'tabs', 'accounts']);
      });
    });
  }

}
