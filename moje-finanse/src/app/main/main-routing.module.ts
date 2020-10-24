import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: MainPage,
    children: [
      {
        path: 'accounts',
        children: [
          {
            path: '',
            loadChildren: './accounts/accounts.module#AccountsPageModule'
          },
          {
            path: 'new',
            loadChildren: './accounts/new-account/new-account.module#NewAccountPageModule'
          },
          {
            path: 'edit/:accountId',
            loadChildren: './accounts/edit-account/edit-account.module#EditAccountPageModule'
          },
          {
            path: ':accountId',
            loadChildren: './accounts/account-detail/account-detail.module#AccountDetailPageModule'
          },
        ]
      },
      {
        path: 'transactions',
        children: [
          {
            path: '',
            loadChildren: './transactions/transactions.module#TransactionsPageModule'
          },
          {
            path: 'new',
            loadChildren: './transactions/new-transaction/new-transaction.module#NewTransactionPageModule'
          },
          {
            path: 'edit/:transactionId',
            loadChildren: './transactions/edit-transaction/edit-transaction.module#EditTransactionPageModule'
          },
          {
            path: ':transactionId',
            loadChildren: './transactions/transaction-detail/transaction-detail.module#TransactionDetailPageModule'
          },
        ]
      },
      {
        path: 'categories',
        children: [
          {
            path: '',
            loadChildren: './categories/categories.module#CategoriesPageModule'
          },
          {
            path: 'new',
            loadChildren: './categories/new-category/new-category.module#NewCategoryPageModule'
          },
          {
            path: 'edit/:categoryId',
            loadChildren: './categories/edit-category/edit-category.module#EditCategoryPageModule'
          },
        ]
      },
      {
        path: '',
        redirectTo: '/main/tabs/categories',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/main/tabs/categories',
    pathMatch: 'full'
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule { }
