import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CategoriesService } from '../categories.service';
import { Category } from '../category.model';
import { ToastController } from '@ionic/angular';
@Component({
  selector: 'app-new-category',
  templateUrl: './new-category.page.html',
  styleUrls: ['./new-category.page.scss'],
})
export class NewCategoryPage implements OnInit {
  icons;
  selectedIcon = 'document-outline';
  form: FormGroup;
  loadedCategories: Category[];
  constructor(public toastController: ToastController, private navCtrl: NavController, private categoriesService: CategoriesService, private router: Router, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.icons = this.categoriesService.icons;
    this.form = new FormGroup({
      title: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.maxLength(20)] })
    });
  }
  selectIcon(icon) {
    this.selectedIcon = icon;
  }
  onCreateTransaction() {
    if (!this.form.valid) {
      return;
    }
    if (this.form.value.type === 'deposit' && this.form.value.category !== '') {
      this.form.value.category = 'deposit';
    }
    if (this.form.value.category !== '') {
      this.form.value.category = 'deposit';
    }

    this.loadingCtrl.create({
      message: 'Creating category...'
    }).then(loadingEl => {
      loadingEl.present();

      this.categoriesService.addCategory(
        this.form.value.title,
        this.selectedIcon).subscribe(() => {
          loadingEl.dismiss();
          this.presentToast();
          this.form.reset();
          this.navCtrl.back();
        });
    });
  }
  async presentToast() {
    const toast = await this.toastController.create({
      message: `Created '${this.form.value.title}' category <ion-icon name="checkmark"></ion-icon>`,
      duration: 1400
    });
    toast.present();
  }

}
