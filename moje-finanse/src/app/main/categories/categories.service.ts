import { Injectable } from '@angular/core';
import { Category } from './category.model';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private _categories = new BehaviorSubject<Category[]>([
    new Category('deposit', 'Deposit', 'card'),
    new Category('c1', 'Shopping', 'bag-handle'),
    new Category('c2', 'Food', 'fast-food'),
    new Category('c3', 'Car', 'car'),
    new Category('c4', 'Home', 'home'),
    new Category('c5', 'Entertaiment', 'game-controller'),
  ]);
  private _icons = ['airplane-outline', 'bag-handle', 'beer', 'fast-food', 'barbell', 'bed', 'bus', 'car', 'cart', 'cafe', 'construct', 'color-palette', 'earth', 'fitness', 'gift', 'home', 'football', 'glasses', 'musical-notes', 'paw']
  get categories() {
    return this._categories.asObservable()
  }
  get icons() {
    return this._icons;
  }
  constructor() { }

  getCategory(id: string) {
    return this.categories.pipe(
      take(1),
      map(categories => {
        return { ...categories.find(t => t.id === id) };
      })
    );
  }
  addCategory(
    title: string,
    icon: string,) {
    const newCategory = new Category(Math.random().toString(), title, icon);
    return this._categories.pipe(take(1), tap(categorys => {
      this._categories.next(categorys.concat(newCategory));
    }));
  }

  updateCategory(
    categoryId: string,
    title: string,
    icon: string) {
    return this.categories.pipe(take(1), tap(categories => {
      const updatedCategoriesIndex = categories.findIndex(tr => tr.id === categoryId);
      const updatedCategories = [...categories];
      const oldCategory = updatedCategories[updatedCategoriesIndex]
      updatedCategories[updatedCategoriesIndex] = new Category(
        oldCategory.id, title, icon);
      this._categories.next(updatedCategories);
    }));
  }
  deleteCategory(categoryId: string) {
    return this._categories.pipe(
      take(1),
      tap(categories => {
        this._categories.next(categories.filter(t => t.id !== categoryId));
      })
    )
  }
  clearAlldata() {
    this._categories = new BehaviorSubject<Category[]>([]);
  }
}
