import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewBudgetPageRoutingModule } from './new-budget-routing.module';

import { NewBudgetPage } from './new-budget.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    NewBudgetPageRoutingModule,
    TranslateModule
  ],
  declarations: [NewBudgetPage]
})
export class NewBudgetPageModule {}
