import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonItemSliding, LoadingController, NavController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CurrencyService } from 'src/app/Services/currency.service';
import { Transaction } from '../../transactions/transaction.model';
import { TransactionsService } from '../../transactions/transactions.service';
import { CategoriesService } from '../categories.service';
import { Category } from '../category.model';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.page.html',
  styleUrls: ['./category-detail.page.scss'],
})
export class CategoryDetailPage implements OnInit {
  category: Category;
  isLoading = false;
  currency: string;
  private categoriesSub: Subscription;
  private currenciesSub: Subscription;
  sum: number;
  relevantTransactions: Transaction[];
  loadedTransactions: Transaction[];
  private transactionsSub: Subscription;

  constructor(
    private currencyService: CurrencyService,
    private translate: TranslateService,
    private toastController: ToastController,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private categoriesService: CategoriesService,
    private transactionsService: TransactionsService,
    private loadingCtrl: LoadingController,
    private router: Router) { }

  ngOnInit() {
    this.currenciesSub = this.currencyService.selected.subscribe(selected => {
      this.currency = selected;
    });
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('categoryId')) {
        this.navCtrl.navigateBack('/main/tabs/transactions');
        return;
      }
      this.isLoading = true;
      this.categoriesSub = this.categoriesService.getCategory(paramMap.get('categoryId')).subscribe(category => {
        this.category = category;
        this.transactionsSub = this.transactionsService.transactions.subscribe(transactions => {
          this.loadedTransactions = transactions;
          this.relevantTransactions = this.loadedTransactions.filter(transaction => transaction.category === this.category.title);
          this.sum = 0;
          this.relevantTransactions.forEach((transaction) => {
            if (transaction.type === 'deposit') {
              this.sum += transaction.amount;
            }
            else if (transaction.type === 'expense') {
              this.sum -= transaction.amount;
            }
            this.isLoading = false;
          });
        });
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
  ionViewWillEnter() {
    this.transactionsService.fetchTransactions().subscribe(()=>{
      this.relevantTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    });
    
  }
  onEdit(transactionId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'main', 'tabs', 'transactions', 'edit', transactionId]);
  }
  onDelete(transactionId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.loadingCtrl.create({
      message: this.translate.instant('deletingCategory'),
    }).then(loadingEl => {
      loadingEl.present();
      this.transactionsService.deleteTransaction(transactionId).subscribe(() => {
        loadingEl.dismiss();
        this.presentToast()
      });
    });
  }
  async presentToast() {
    const toast = await this.toastController.create({
      message: this.translate.instant('newTransfer') + `<ion-icon name="checkmark"></ion-icon>`,
      duration: 1400,
      position: 'bottom',
      cssClass: 'tabs-bottom'
    });
    toast.present();
  }
  ngOnDestroy(): void {
    if (this.currenciesSub) {
      this.currenciesSub.unsubscribe();
    }
    if (this.transactionsSub) {
      this.transactionsSub.unsubscribe();
    }
  }
}
