import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditCategoryPageRoutingModule } from './edit-category-routing.module';

import { EditCategoryPage } from './edit-category.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    EditCategoryPageRoutingModule
  ],
  declarations: [EditCategoryPage]
})
export class EditCategoryPageModule {}
