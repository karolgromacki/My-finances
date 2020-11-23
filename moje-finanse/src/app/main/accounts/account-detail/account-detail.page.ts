import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AccountsService } from '../accounts.service';
import { Account } from '../account.model';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.page.html',
  styleUrls: ['./account-detail.page.scss'],
})
export class AccountDetailPage implements OnInit {
  isLoading = false;
  account: Account;
  private accountSub: Subscription;
  constructor(
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private router: Router,
    private toastController: ToastController,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private accountsService: AccountsService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('accountId')) {
        this.navCtrl.navigateBack('/main/tabs/accounts');
        return;
      }
      this.isLoading = true;
      this.accountSub = this.accountsService.getAccount(paramMap.get('accountId')).subscribe(account => {
        this.account = account
        this.isLoading = false;
      },
        error => {
          this.alertCtrl
            .create({
              header: 'An error occurred!',
              message: 'Account could not be fetched. Please try again later.',
              buttons: [
                {
                  text: 'Okay',
                  handler: () => {
                    this.router.navigate(['/main/tabs/accounts']);
                  }
                }
              ]
            })
            .then(alertEl => {
              alertEl.present();
            });
        });
    });
  }

  ngOnDestroy() {
    if (this.accountSub) {
      this.accountSub.unsubscribe()
    }
  }
  onDelete(accountId: string, accountTitle: string) {
    this.loadingCtrl.create({
      message: this.translate.instant('deletingAccount'),
    }).then(loadingEl => {
      loadingEl.present();
      this.accountsService.deleteAccount(accountId).subscribe(() => {
        loadingEl.dismiss();
        this.presentToast(accountTitle);
      });
    });
  }
  async presentToast(accountTitle) {
    const toast = await this.toastController.create({
      message: `${accountTitle}`+ this.translate.instant('deletedAccount') + `<ion-icon name="checkmark"></ion-icon>`,
      duration: 1400,
      position: 'bottom',
      cssClass: 'tabs-bottom'
    });
    toast.present();
  }

}
