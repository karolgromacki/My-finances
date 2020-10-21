import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewCategoryPage } from './new-category.page';

describe('NewCategoryPage', () => {
  let component: NewCategoryPage;
  let fixture: ComponentFixture<NewCategoryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewCategoryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewCategoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
