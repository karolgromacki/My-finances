import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AccountsService } from '../../accounts/accounts.service';
import { TransactionsService } from '../transactions.service';
import { Account } from '../../accounts/account.model';
import { CategoriesService } from '../../categories/categories.service';
import { Category } from '../../categories/category.model';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { switchMap } from 'rxjs/operators';

function base64toBlob(base64Data, contentType) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}


@Component({
  selector: 'app-new-transaction',
  templateUrl: './new-transaction.page.html',
  styleUrls: ['./new-transaction.page.scss'],
})
export class NewTransactionPage implements OnInit {
  form: FormGroup;
  loadedAccounts: Account[];
  loadedCategories: Category[];
  private accountsSub: Subscription;
  private categoriesSub: Subscription;
  categoryIcon: Category;
  icon;
  scannedCode = null;
  constructor(
    private storage: Storage,
    private toastController: ToastController,
    private translate: TranslateService,
    private transactionService: TransactionsService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private accountsService: AccountsService,
    private categoriesService: CategoriesService,
    private BarcodeScanner: BarcodeScanner,
    private platform: Platform
  ) { }

  ngOnInit() {

    this.categoriesSub = this.categoriesService.categories.subscribe(categories => {
      this.accountsSub = this.accountsService.accounts.subscribe(account => {
        this.form = new FormGroup({
          type: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
          title: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.maxLength(20)] }),
          amount: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.min(0.01)] }),
          note: new FormControl(null, { updateOn: 'blur' }),
          date: new FormControl(new Date().toISOString(), { updateOn: 'change', validators: [Validators.required] }),
          account: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
          category: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
          image: new FormControl(null, { updateOn: 'change' })
        });

        const categoryControl = this.form.get('category');
        this.form.get('type').valueChanges
          .subscribe(userType => {
            if (userType === 'expense') {
              categoryControl.setValue(null);
              categoryControl.setValidators([Validators.required]);
              categoryControl.valueChanges
                .subscribe(userCategory => {
                  if (this.form.value.type === 'expense') {
                    this.categoryIcon = this.loadedCategories.find(category => category.title === userCategory);
                  }
                });
            }
            else if (userType === 'deposit') {
              categoryControl.setValidators(null);
              categoryControl.setValue('deposit');
              this.icon = 'card';
            }
            categoryControl.updateValueAndValidity();
          });

        this.loadedAccounts = account;
        this.loadedCategories = categories?.filter(category => category.title !== 'deposit');
      });
    });
  }
  ngOnDestroy(): void {
    if (this.categoriesSub) {
      this.categoriesSub.unsubscribe();
    }
    if (this.accountsSub)
      this.accountsSub.unsubscribe();

  }
  scanCode() {
    this.BarcodeScanner.scan().then(barcodeData => {
      this.scannedCode = barcodeData.text;
      if (this.scannedCode != null) {
        let tab = this.scannedCode.split('|')
        this.form.get('amount').setValue((tab[3] / 100).toFixed(2));
        this.form.get('title').setValue(tab[4]);
        this.form.get('note').setValue(tab[5]);
      }
    })


  }

  ionViewWillEnter() {
    this.accountsService.fetchAccounts().subscribe(() => {
    });
    this.categoriesService.fetchCategories().subscribe(() => {
    });
  }

  onCreateTransaction() {
    if (!this.form.valid) {
      return;
    }
    else if (this.form.value.type === 'deposit') {
      this.form.value.category = 'Deposit';
      this.icon = 'card';
    }
    else if (this.form.value.type === 'expense') {
      this.icon = this.loadedCategories.find(category => category.title === this.form.value.category).icon;
    }
    console.log(this.form.value);
    this.loadingCtrl.create({
      message: this.translate.instant('creatingTransaction')
    }).then(loadingEl => {
      loadingEl.present();
      this.transactionService.uploadImage(this.form.get('image').value).pipe(switchMap(uploadRes => {
        return this.transactionService.addTransaction(
          this.form.value.type,
          this.form.value.title,
          this.form.value.note,
          this.form.value.category,
          this.form.value.account,
          this.form.value.amount,
          new Date(this.form.value.date),
          uploadRes.imageUrl,
          this.icon)
      })).subscribe(() => {
        loadingEl.dismiss();
        this.presentToast();
        this.form.reset();
        this.router.navigate(['/', 'main', 'tabs', 'transactions']);
      });
    });
  }
  async presentToast() {
    const toast = await this.toastController.create({
      message: this.translate.instant('createdTransaction') + `'${this.form.value.title}' <ion-icon name="checkmark"></ion-icon>`,
      duration: 1400,
      position: 'bottom',
      cssClass: 'tabs-bottom'
    });
    toast.present();
  }
  onImagePicked(imageData: string | File) {
    let imageFile
    if (typeof imageData === 'string') {
      try {
        imageFile = base64toBlob(imageData.replace('data:image/jpeg;base64', ''), 'image/jpeg')
      }
      catch (error) {
        console.log(error);
        return;
      }
    }
    else {
      imageFile = imageData;
    }
    this.form.patchValue({ image: imageFile });
  }
}
