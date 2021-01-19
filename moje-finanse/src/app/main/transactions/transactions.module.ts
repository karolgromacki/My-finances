import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TransactionsPageRoutingModule } from './transactions-routing.module';
import { TransactionsPage } from './transactions.page';
import { GroupByPipe } from 'src/app/Pipes/groupByPipe';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransactionsPageRoutingModule,
    TranslateModule
  ],
  declarations: [TransactionsPage, GroupByPipe],
  exports: [GroupByPipe],
  entryComponents: [TransactionsPage, GroupByPipe]
})
export class TransactionsPageModule { }
