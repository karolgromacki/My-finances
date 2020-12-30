import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditBudgetPage } from './edit-budget.page';

const routes: Routes = [
  {
    path: '',
    component: EditBudgetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditBudgetPageRoutingModule {}
