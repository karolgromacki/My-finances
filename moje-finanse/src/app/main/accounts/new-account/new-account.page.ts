import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { AccountsService } from '../accounts.service';

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.page.html',
  styleUrls: ['./new-account.page.scss'],
})
export class NewAccountPage implements OnInit {
  form: FormGroup;

  constructor(private navCtrl: NavController, private accountService: AccountsService, private router: Router, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.maxLength(20)] }),
      amount: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
      note: new FormControl(null, { updateOn: 'blur' })
    });
  }
  onCreateTransaction() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl.create({
      message: 'Creating account...'
    }).then(loadingEl => {
      loadingEl.present();

      this.accountService.addAccount(
        this.form.value.title,
        this.form.value.note,
        this.form.value.amount).subscribe(() => {
          loadingEl.dismiss();
          this.form.reset();
          this.navCtrl.back();
        });
    });

  }
}
