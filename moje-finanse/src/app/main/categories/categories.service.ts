import { Injectable } from '@angular/core';
import { Category } from './category.model';
import * as moment from 'moment';
import { BehaviorSubject, from, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';


interface CategoryData {
  title: string;
  icon: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private _categories = new BehaviorSubject<Category[]>([]);
  private _icons = ['airplane', 'compass', 'briefcase', 'boat', 'earth', 'subway', 'train', 'bus', 'trail-sign', 'car', 'speedometer', 'bicycle', 'rocket', 'planet', 'telescope', 'glasses',
    'american-football', 'football', 'tennisball', 'golf', 'barbell', 'musical-notes', 'headset', 'color-palette', 'ticket', 'film', 'dice', 'game-controller', 'library', 'paw', 'leaf', 'flower',
    'cafe', 'wine', 'pint', 'beer', 'fast-food', 'restaurant', 'pizza', 'nutrition', 'water', 'flash', 'bulb', 'thermometer', 'cart', 'basket', 'bag-handle', 'pricetag',
    'business', 'call', 'mail', 'calculator', 'save', 'clipboard', 'document-text', 'document-attach', 'server', 'globe', 'logo-bitcoin', 'logo-usd', 'pie-chart', 'cellular', 'stats-chart', 'shield',
    'school', 'bed', 'home', 'key', 'gift', 'trophy', 'construct', 'build', 'shirt', 'cut', 'fitness', 'bandage', 'star', 'snow', 'sunny','cog']

  get categories() {
    return this._categories.asObservable()
  }
  get icons() {
    return this._icons;
  }
  constructor(private authService: AuthService, private http: HttpClient, private storage: Storage) { }

  fetchCategories() {
    let fetchedUserId: string;
    return this.authService.userId.pipe(switchMap(userId => {
      fetchedUserId = userId;
      return this.authService.token;
    }), take(1), switchMap(token => {
      if (!fetchedUserId) {
        throw new Error('No User id found!')
      }
      return this.http.get<{ [key: string]: CategoryData }>(`https://my-finances-b77a0.firebaseio.com/categories.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`)
    }), map(resData => {
      const categories = [];
      for (const key in resData) {
        if (resData.hasOwnProperty(key)) {
          categories.push(
            new Category(
              key,
              resData[key].title,
              resData[key].icon,
              resData[key].userId
            )
          );
        }
      }
      return categories;
    }),
      tap(categories => {
        this._categories.next(categories.sort((a, b) => (a.title < b.title ? -1 : 1)));
      })
    );
  }

  getCategory(id: string) {
    return this.authService.token.pipe(take(1), switchMap(token => {
      return this.http
        .get<CategoryData>(`https://my-finances-b77a0.firebaseio.com/categories/${id}.json?auth=${token}`)
        .pipe(
          map(categoryData => {
            return new Category(id, categoryData.title, categoryData.icon, categoryData.userId);
          })
        );
    }));
  }
  addCategory(
    title: string,
    icon: string) {
    let generatedId: string;
    let newCategory: Category;
    let fetchedUserId: string;
    return this.authService.userId.pipe(take(1), switchMap(userId => {
      if (!userId) {
        throw new Error('No user id found!');
      }
      fetchedUserId = userId;
      return this.authService.token;
    }), take(1), switchMap(token => {
      newCategory = new Category(Math.random().toString(), title, icon, fetchedUserId);
      return this.http.post<{ name: string }>(`https://my-finances-b77a0.firebaseio.com/categories.json?auth=${token}`, { ...newCategory, id: null })

    }), switchMap(resData => {
      generatedId = resData.name;
      return this.categories;
    }),
      take(1),
      tap(categories => {
        newCategory.id = generatedId;
        this._categories.next(categories.concat(newCategory));
      })

    );
  }

  updateCategory(
    categoryId: string,
    title: string,
    icon: string) {
    let updatedCategories: Category[];
    return this.authService.token.pipe(take(1), switchMap(token => {
      return this.categories.pipe(
        take(1),
        switchMap(categories => {
          if (categories || categories.length <= 0) {
            return this.fetchCategories();
          }
          else {
            return of(categories);
          }

        }),
        switchMap(categories => {
          const updatedCategoriesIndex = categories.findIndex(tr => tr.id === categoryId);
          const updatedCategories = [...categories];
          const oldCategory = updatedCategories[updatedCategoriesIndex]
          updatedCategories[updatedCategoriesIndex] = new Category(
            oldCategory.id,
            title,
            icon,
            oldCategory.userId);
          return this.http.put(`https://my-finances-b77a0.firebaseio.com/categories/${categoryId}.json?auth=${token}`,
            { ...updatedCategories[updatedCategoriesIndex], id: null });
        }),
        tap(() => {
          this._categories.next(updatedCategories);
        })
      );
    }));
  }
  deleteCategory(categoryId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(`https://my-finances-b77a0.firebaseio.com/categories/${categoryId}.json?auth=${token}`);
      }),
      switchMap(() => {
        return this.categories;
      }),
      take(1),
      tap(categories => {
        this._categories.next(categories.filter(a => a.id !== categoryId));
      })
    );
  }
}
