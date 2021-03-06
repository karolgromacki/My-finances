import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, IonItemSliding, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { ChartDataSets, ChartType } from 'chart.js';
import { Color, Label, MultiDataSet, PluginServiceGlobalRegistrationAndOptions } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { TransactionsService } from '../transactions/transactions.service';
import { CategoriesService } from './categories.service';
import { Category } from './category.model';


@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {

  relevantCategories: Category[];
  private categoriesSub: Subscription;
  isLoading = false;
  constructor(
    private categoriesService: CategoriesService,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private translate: TranslateService,
    private alertCtrl: AlertController
  ) { }



  ngOnInit() {
    this.categoriesSub = this.categoriesService.categories.subscribe(categories => {
      this.relevantCategories = categories;
    });
    this.relevantCategories = this.relevantCategories.filter(category => category.title !== 'Deposit' && category.title !== 'Transfer');
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.categoriesService.fetchCategories().subscribe(() => {
      this.isLoading = false;
    });
  }

  onCategory(categoryId) {
    this.actionSheetCtrl.create({
      header: this.translate.instant('chooseAction') + ':',
      buttons: [
        {
          text: this.translate.instant('detail'),
          icon: 'list',
          handler: () => {
            this.router.navigate(['/', 'main', 'tabs', 'categories', categoryId]);
          }
        },
        {
          text: this.translate.instant('edit'),
          icon: 'create-outline',
          handler: () => {
            this.router.navigate(['/', 'main', 'tabs', 'categories', 'edit', categoryId]);
          }
        },
        {
          text: this.translate.instant('delete'),
          icon: 'trash',
          handler: () => {
            this.onDelete(categoryId);
          }
        },
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          icon: 'close-circle'
        }
      ]
    }).then(actionSheetEl => { actionSheetEl.present(); });
  }


  onDelete(categoryId: string) {
    this.alertCtrl.create({
      header: this.translate.instant('deleteDataTitle'),
      message: this.translate.instant('deleteData'),
      buttons: [
        {
          text: this.translate.instant('delete'),
          handler: () => {
            this.categoriesService.deleteCategory(categoryId).subscribe(() => {
            });
          }
        },
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
        },
      ]
    }).then(alertEl => {
      alertEl.present();
    });

  }

  ngOnDestroy() {
    if (this.categoriesSub) {
      this.categoriesSub.unsubscribe();
    }

  }
  onEdit(categoryId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'main', 'tabs', 'categories', 'edit', categoryId]);
  }
}
