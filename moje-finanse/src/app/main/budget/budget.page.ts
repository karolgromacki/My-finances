import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BudgetService } from 'src/app/main/budget/budget.service';
import { Budget } from './budget.model';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.page.html',
  styleUrls: ['./budget.page.scss'],
})
export class BudgetPage implements OnInit {
  form: FormGroup;
  budget: Budget;
  constructor(private translateService: TranslateService, private budgetService: BudgetService) { }

  ngOnInit() {
    this.budgetService.budget.subscribe(budget => {
      this.budget = budget;
      
    })
  }
  onEditBudget() {

  }

}
