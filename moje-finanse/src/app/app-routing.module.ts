import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '', redirectTo: 'main', pathMatch: 'full'
  },
  {
    path: 'main',
    loadChildren: './main/main.module#MainPageModule'
  },
  // {
  //   path: 'categories',
  //   loadChildren: () => import('./main/categories/categories.module').then(m => m.CategoriesPageModule)
  // },
  // {
  //   path: 'transactions',
  //   loadChildren: () => import('./main/transactions/transactions.module').then(m => m.TransactionsPageModule)
  // },
  // {
  //   path: 'accounts',
  //   loadChildren: () => import('./main/accounts/accounts.module').then(m => m.AccountsPageModule)
  // },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
