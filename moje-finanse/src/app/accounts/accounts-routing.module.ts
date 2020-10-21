import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountsPage } from './accounts.page';

const routes: Routes = [
  {
    path: '',
    component: AccountsPage
  },
  {
    path: 'new-account',
    loadChildren: () => import('./new-account/new-account.module').then( m => m.NewAccountPageModule)
  },
  {
    path: 'edit-account',
    loadChildren: () => import('./edit-account/edit-account.module').then( m => m.EditAccountPageModule)
  },
  {
    path: 'account-detail',
    loadChildren: () => import('./account-detail/account-detail.module').then( m => m.AccountDetailPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountsPageRoutingModule {}
