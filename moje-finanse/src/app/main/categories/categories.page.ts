import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CategoriesService } from './categories.service';
import { Category } from './category.model';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {
  a;
  relevantCategories: Category[];
  private categoriesSub: Subscription;

  constructor(
    private categoriesService: CategoriesService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController
    // private modalCtrl: ModalController
  ) { }
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
    }).then(actionSheetEl => { actionSheetEl.present() });
  }
  ngOnInit() {
    this.categoriesSub = this.categoriesService.categories.subscribe(categories => {
      this.relevantCategories = categories;
    });
  }
  onDelete(categoryId: string) {
    this.categoriesService.deleteCategory(categoryId).subscribe(() => {
    });
  }
  ionViewWillEnter() {
    this.categoriesSub = this.categoriesService.categories.subscribe(categories => {
      this.relevantCategories = categories;
    });
  }
  ngOnDestroy() {
    if (this.categoriesSub) {
      this.categoriesSub.unsubscribe();
    }

  }
  //CREATE MODAL
  // onNewCategory(){
  //   this.modalCtrl.create({component: NewCategoryPage, componentProps:{}}).then(modalEl => {modalEl.present()});
  // }
  onEdit(categoryId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'main', 'tabs', 'categories', 'edit', categoryId])
  }
}
