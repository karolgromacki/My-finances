import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { MainPageRoutingModule } from './main-routing.module';

import { MainPage } from './main.page';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { AccountsPageModule } from './accounts/accounts.module';
import { CategoriesPageModule } from './categories/categories.module';
import { TransactionsPageModule } from './transactions/transactions.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    MainPageRoutingModule,
    SuperTabsModule,
    AccountsPageModule,
    CategoriesPageModule,
    TransactionsPageModule,
    TranslateModule
  ],
  declarations: [MainPage]
})
export class MainPageModule {}
