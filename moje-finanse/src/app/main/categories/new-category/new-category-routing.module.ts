import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewCategoryPage } from './new-category.page';

const routes: Routes = [
  {
    path: '',
    component: NewCategoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewCategoryPageRoutingModule {}
