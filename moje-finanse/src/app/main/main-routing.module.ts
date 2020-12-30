import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: MainPage,
    children: [
      {
        path: 'summary',
        loadChildren: './summary/summary.module#SummaryPageModule'
      },
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
            path: 'transfer',
            loadChildren: './transactions/transfer/transfer.module#TransferPageModule'
          },
          {
            path: 'transfer/new',
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
            path: 'new-account',
            loadChildren: './accounts/new-account/new-account.module#NewAccountPageModule'
          },
          {
            path: 'new-category',
            loadChildren: './categories/new-category/new-category.module#NewCategoryPageModule'
          },
          {
            path: 'transfer',
            loadChildren: './transactions/transfer/transfer.module#TransferPageModule'
          },
          {
            path: 'transfer/new',
            loadChildren: './accounts/new-account/new-account.module#NewAccountPageModule'
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
          {
            path: ':categoryId',
            loadChildren: './categories/category-detail/category-detail.module#CategoryDetailPageModule'
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
    path: 'tutorial',
    loadChildren: () => import('./tutorial/tutorial.module').then(m => m.TutorialPageModule)
  },
  {
    path: 'budget',
    loadChildren: () => import('./budget/budget.module').then( m => m.BudgetPageModule)
  },
  {
    path: 'new-budget',
    loadChildren: () => import('./budget/new-budget/new-budget.module').then( m => m.NewBudgetPageModule)
  },
  {
    path: 'achievements',
    loadChildren: () => import('./achievements/achievements.module').then(m => m.AchievementsPageModule)
  },
  {
    path: '',
    redirectTo: '/main/tabs/categories',
    pathMatch: 'full'
  },






];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule { }
