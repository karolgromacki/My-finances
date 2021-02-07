import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CategoryDetailPageRoutingModule } from './category-detail-routing.module';

import { CategoryDetailPage } from './category-detail.page';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CategoryDetailPageRoutingModule, 
    TranslateModule,
    SharedModule
  ],
  declarations: [CategoryDetailPage]
})
export class CategoryDetailPageModule { }
