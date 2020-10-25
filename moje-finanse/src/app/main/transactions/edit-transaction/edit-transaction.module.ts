import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditTransactionPageRoutingModule } from './edit-transaction-routing.module';

import { EditTransactionPage } from './edit-transaction.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    EditTransactionPageRoutingModule
  ],
  declarations: [EditTransactionPage]
})
export class EditTransactionPageModule {}
