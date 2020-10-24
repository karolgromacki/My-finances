import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransactionDetailPage } from './transaction-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TransactionDetailPage
  },
  {
    path: 'transfer',
    loadChildren: () => import('../transfer/transfer.module').then( m => m.TransferPageModule)
  },
  {
    path: 'edit',
    loadChildren: () => import('../edit-transaction/edit-transaction.module').then( m => m.EditTransactionPageModule)
  },
  {
    path: 'new',
    loadChildren: () => import('../new-transaction/new-transaction.module').then( m => m.NewTransactionPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionDetailPageRoutingModule {}
