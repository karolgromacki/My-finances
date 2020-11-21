import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditTransactionPageRoutingModule } from './edit-transaction-routing.module';

import { EditTransactionPage } from './edit-transaction.page';
import { SharedModule } from '../../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    EditTransactionPageRoutingModule,
    TranslateModule
  ],
  declarations: [EditTransactionPage]
})
export class EditTransactionPageModule { }
