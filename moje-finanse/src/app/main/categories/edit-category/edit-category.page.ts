import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
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
  private categorySub: Subscription;
  constructor(private route: ActivatedRoute, private navCtrl: NavController, private categoriesService: CategoriesService, private loadingCtrl: LoadingController, private router: Router) { }

  ngOnInit() {
    this.icons = this.categoriesService.icons;
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('categoryId')) {
        this.navCtrl.navigateBack('/main/tabs/categories');
        return;
      }
      this.categorySub = this.categoriesService.getCategory(paramMap.get('categoryId')).subscribe(category => {
        this.category = category;
        this.selectedIcon = this.category.icon;
        this.form = new FormGroup({
          title: new FormControl(this.category.title, { updateOn: 'change', validators: [Validators.required, Validators.maxLength(20)] }),
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
        this.category.id,
        this.form.value.title,
        this.selectedIcon
      ).subscribe(() => {
        loadingEl.dismiss();
        this.form.reset();
        this.router.navigate(['/', 'main', 'tabs', 'categories']);
      });
    });
  }
}
