import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewBudgetPage } from './new-budget.page';

const routes: Routes = [
  {
    path: '',
    component: NewBudgetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewBudgetPageRoutingModule {}
