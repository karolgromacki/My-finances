import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditTransactionPageRoutingModule } from './edit-transaction-routing.module';

import { EditTransactionPage } from './edit-transaction.page';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    EditTransactionPageRoutingModule
  ],
  declarations: [EditTransactionPage]
})
export class EditTransactionPageModule { }
