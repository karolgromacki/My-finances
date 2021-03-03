// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { AuthService } from './auth.service';

// @Component({
//   selector: 'app-auth',
//   templateUrl: './auth.page.html',
//   styleUrls: ['./auth.page.scss'],
// })
// export class AuthPage implements OnInit {

//   constructor(private authService: AuthService, private router: Router) { }

//   ngOnInit() {
//   }
//   onLogin() {
//     this.authService.login();
//     this.router.navigateByUrl('/main/tabs/categories')
//   }
// }




import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { AuthService, AuthResponseData } from './auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss']
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;
  form: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")] }),
      password: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.minLength(6), this.check('confirmPassword')] }),
      confirmPassword: new FormControl(null, { updateOn: 'change', validators: [this.matchValues('password')] }),
    });

    this.form?.get('password').valueChanges.subscribe(() => {
      if (this.isLogin === true) {
        this.form?.get('confirmPassword').setValidators(null);
        this.form?.get('confirmPassword').setValue(this.form.get('password').value);
      }
      else {
        this.form?.get('confirmPassword').setValidators(this.matchValues('password'));
      }
    })
  }

  check(matchTo: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.parent && control.parent.value && control.value !== control.parent.controls[matchTo].value)
        this.form.controls['confirmPassword'].setErrors({ 'incorrect': true });
      else {
        this.form?.controls['confirmPassword'].setErrors(null);
      }
      return null;
    };
  }

  matchValues(matchTo: string): (AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      return !!control.parent &&
        !!control.parent.value &&
        control.value === control.parent.controls[matchTo].value
        ? null
        : { isMatching: false };
    };
  }

  authenticate(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: this.translate.instant('loggingIn') })
      .then(loadingEl => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>;
        if (this.isLogin) {
          authObs = this.authService.login(email, password);
        } else {
          authObs = this.authService.signup(email, password);
        }
        authObs.subscribe(
          () => {
            this.isLoading = false;
            loadingEl.dismiss();
            this.router.navigateByUrl('/main/tabs/transactions');
          },
          errRes => {
            loadingEl.dismiss();
            const code = errRes.error.error.message;
            let message = this.translate.instant('cannotSignUp');
            if (code === 'EMAIL_EXISTS') {
              message = this.translate.instant('emailExists');
            } else if (code === 'EMAIL_NOT_FOUND') {
              message = this.translate.instant('emailNotFound');
            } else if (code === 'INVALID_PASSWORD') {
              message = this.translate.instant('invalidPassword');
            }
            this.showAlert(message);
          }
        );
      });
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    this.authenticate(email, password);
    form.controls['email'].reset();
    form.controls['password'].reset();
    form.controls['confirmPassword'].reset();
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: this.translate.instant('authFailed'),
        message: message,
        buttons: ['Ok']
      })
      .then(alertEl => alertEl.present());
  }
}

