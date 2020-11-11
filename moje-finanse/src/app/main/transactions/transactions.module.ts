import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransactionsPageRoutingModule } from './transactions-routing.module';

import { TransactionsPage } from './transactions.page';
import { NewTransactionPage } from './new-transaction/new-transaction.page';
import { GroupByPipe } from 'src/app/Pipes/groupByPipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransactionsPageRoutingModule
  ],
  declarations: [TransactionsPage, GroupByPipe],
  entryComponents: [TransactionsPage]
})
export class TransactionsPageModule { }
