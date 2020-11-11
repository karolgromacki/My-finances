import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferPageRoutingModule } from './transfer-routing.module';

import { TransferPage } from './transfer.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    TransferPageRoutingModule
  ],
  declarations: [TransferPage]
})
export class TransferPageModule {}
