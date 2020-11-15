import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewTransactionPageRoutingModule } from './new-transaction-routing.module';

import { NewTransactionPage } from './new-transaction.page';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    IonicModule,
    NewTransactionPageRoutingModule
  ],
  declarations: [NewTransactionPage]
})
export class NewTransactionPageModule {}
