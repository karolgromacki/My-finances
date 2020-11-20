import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CategoriesService } from '../categories.service';
import { Category } from '../category.model';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.page.html',
  styleUrls: ['./edit-category.page.scss'],
})
export class EditCategoryPage implements OnInit {
  selectedIcon;
  icons;
  form: FormGroup;
  category: Category;
  categoryId: string;
  isLoading = false;
  private categorySub: Subscription;
  constructor(public toastController: ToastController,
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private categoriesService: CategoriesService,
    private loadingCtrl: LoadingController,
    private router: Router) { }

  ngOnInit() {
    this.icons = this.categoriesService.icons;
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('categoryId')) {
        this.navCtrl.navigateBack('/main/tabs/categories');
        return;
      }
      this.categoryId = paramMap.get('categoryId');
      this.isLoading = true;
      this.categorySub = this.categoriesService.getCategory(paramMap.get('categoryId')).subscribe(category => {
        this.category = category;
        this.selectedIcon = this.category.icon;
        this.form = new FormGroup({
          title: new FormControl(this.category.title, { updateOn: 'change', validators: [Validators.required, Validators.maxLength(20)] }),
        });
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
    if (this.categorySub) {
      this.categorySub.unsubscribe();
    }
  }
  selectIcon(icon) {
    this.selectedIcon = icon;
  }
  onUpdateCategory() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl.create({
      message: 'Updating category...'
    }).then(loadingEl => {
      loadingEl.present();
      this.categoriesService.updateCategory(
        this.categoryId,
        this.form.value.title,
        this.selectedIcon
      ).subscribe(() => {
        loadingEl.dismiss();
        this.presentToast();
        this.form.reset();
        this.router.navigate(['/', 'main', 'tabs', 'categories']);
      });
    });
  }
  async presentToast() {
    const toast = await this.toastController.create({
      message: `Category '${this.category.title}' has been modified <ion-icon name="checkmark"></ion-icon>`,
      duration: 1400
    });
    toast.present();
  }
}
