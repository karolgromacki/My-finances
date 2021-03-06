import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { take, tap, switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  constructor(private authService: AuthService, private router: Router, private menuCtrl: MenuController) { }

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {

    return this.authService.userIsAuthenticated.pipe(take(1), switchMap(isAuthenticated => {
      if (!isAuthenticated) {
        return this.authService.autoLogin();
      }
      else {
        return of(isAuthenticated);
      }
    }), tap(isAuthenticated => {
      if (!isAuthenticated) {
        this.menuCtrl.close();
        this.router.navigateByUrl('/auth');

      }
    }));
  }
}
