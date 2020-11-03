import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CategoriesService } from '../categories.service';
import { Category } from '../category.model';

@Component({
  selector: 'app-new-category',
  templateUrl: './new-category.page.html',
  styleUrls: ['./new-category.page.scss'],
})
export class NewCategoryPage implements OnInit {
  icons;
  selectedIcon='document-outline';
  form: FormGroup;
  loadedCategories: Category[];
  constructor(private categoriesService: CategoriesService, private router: Router, private loadingCtrl: LoadingController) { }

  ngOnInit() {
      this.icons = this.categoriesService.icons;
      this.form = new FormGroup({
        title: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.maxLength(20)] })
      });
  }
  selectIcon(icon){
    this.selectedIcon=icon;
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
          this.form.reset();
          this.router.navigate(['/', 'main', 'tabs', 'categories']);
        });
    });



  }

}
