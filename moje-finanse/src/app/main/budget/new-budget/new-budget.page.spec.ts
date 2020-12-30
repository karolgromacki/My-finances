import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewBudgetPage } from './new-budget.page';

describe('NewBudgetPage', () => {
  let component: NewBudgetPage;
  let fixture: ComponentFixture<NewBudgetPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewBudgetPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewBudgetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
