import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditBudgetPageRoutingModule } from './edit-budget-routing.module';

import { EditBudgetPage } from './edit-budget.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    EditBudgetPageRoutingModule,
    TranslateModule
  ],
  declarations: [EditBudgetPage]
})
export class EditBudgetPageModule {}
