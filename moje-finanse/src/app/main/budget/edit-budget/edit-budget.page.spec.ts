import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditBudgetPage } from './edit-budget.page';

describe('EditBudgetPage', () => {
  let component: EditBudgetPage;
  let fixture: ComponentFixture<EditBudgetPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBudgetPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditBudgetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
