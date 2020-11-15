import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, IonItemSliding, LoadingController } from '@ionic/angular';
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
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private transactionsService: TransactionsService

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
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Detail',
          icon: 'list',
          handler: () => {
            this.router.navigate(['/', 'main', 'tabs', 'categories', categoryId]);
          }
        },
        {
          text: 'Edit',
          icon: 'create-outline',
          handler: () => {
            this.router.navigate(['/', 'main', 'tabs', 'categories', 'edit', categoryId]);
          }
        },
        {
          text: 'Delete',
          icon: 'trash',
          handler: () => {
            this.onDelete(categoryId);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          icon: 'close-circle'
        }
      ]
    }).then(actionSheetEl => { actionSheetEl.present(); });
  }


  onDelete(categoryId: string) {
    this.categoriesService.deleteCategory(categoryId).subscribe(() => {
    });
    this.relevantCategories = this.relevantCategories.filter(category => category.title !== 'Deposit');
    this.relevantCategories = this.relevantCategories.filter(category => category.title !== 'Transfer');
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
