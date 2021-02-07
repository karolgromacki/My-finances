import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TransactionsPageRoutingModule } from './transactions-routing.module';
import { TransactionsPage } from './transactions.page';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransactionsPageRoutingModule,
    TranslateModule,
    SharedModule
  ],
  declarations: [TransactionsPage],
  entryComponents: [TransactionsPage]
})
export class TransactionsPageModule { }
