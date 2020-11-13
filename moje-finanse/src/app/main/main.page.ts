
import { Component, OnInit, Input } from '@angular/core';
import { AccountsPage } from './accounts/accounts.page';
import { CategoriesPage } from './categories/categories.page';
import { TransactionsPage } from './transactions/transactions.page';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  accountsPage = AccountsPage
  categoriesPage = CategoriesPage
  transactionsPage = TransactionsPage

  @Input() tutorial: string;
  constructor() { }

  ngOnInit() {
  }
  

}
