import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AccountsService } from '../accounts.service';
import { Account } from '../account.model';
@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.page.html',
  styleUrls: ['./account-detail.page.scss'],
})
export class AccountDetailPage implements OnInit {

  account: Account;
  private accountSub: Subscription;
  constructor(
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
      this.accountSub = this.accountsService.getAccount(paramMap.get('accountId')).subscribe(account => this.account = account);
    });
  }
  ngOnDestroy() {
    if (this.accountSub) {
      this.accountSub.unsubscribe()
    }
  }
  onDelete(accountId: string, accountTitle: string) {
    this.loadingCtrl.create({
      message: 'Deleting account...'
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
      message: `Account '${accountTitle}' has been deleted <ion-icon name="checkmark"></ion-icon>`,
      duration: 2000
    });
    toast.present();
  }

}
