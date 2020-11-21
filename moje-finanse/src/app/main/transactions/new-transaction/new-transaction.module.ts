import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewTransactionPageRoutingModule } from './new-transaction-routing.module';

import { NewTransactionPage } from './new-transaction.page';
import { SharedModule } from '../../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    IonicModule,
    NewTransactionPageRoutingModule,
    TranslateModule
  ],
  declarations: [NewTransactionPage]
})
export class NewTransactionPageModule {}
