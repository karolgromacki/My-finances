import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonItemSliding, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
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
  private categoriesSub: Subscription;
  sum: number;
  relevantTransactions: Transaction[];
  loadedTransactions: Transaction[];
  private transactionsSub: Subscription;

  constructor(private toastController: ToastController, private route: ActivatedRoute, private navCtrl: NavController, private categoriesService: CategoriesService, private transactionsService: TransactionsService, private loadingCtrl: LoadingController, private router: Router) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('categoryId')) {
        this.navCtrl.navigateBack('/main/tabs/transactions');
        return;
      }
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
          });
        });
      });
    });
  }
  onEdit(transactionId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'main', 'tabs', 'transactions', 'edit', transactionId]);
  }
  onDelete(transactionId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.loadingCtrl.create({
      message: 'Deleting transaction...'
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
      message: `New transfer has been created <ion-icon name="checkmark"></ion-icon>`,
      duration: 2000,
    });
    toast.present();
  }
}
