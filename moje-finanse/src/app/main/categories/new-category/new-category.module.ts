import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewCategoryPageRoutingModule } from './new-category-routing.module';

import { NewCategoryPage } from './new-category.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    NewCategoryPageRoutingModule
  ],
  declarations: [NewCategoryPage]
})
export class NewCategoryPageModule {}
