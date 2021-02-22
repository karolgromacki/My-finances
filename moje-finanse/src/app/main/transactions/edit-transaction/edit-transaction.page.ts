import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, NavController, Platform, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AccountsService } from '../../accounts/accounts.service';
import { TransactionsService } from '../transactions.service';
import { Account } from '../../accounts/account.model';
import { CategoriesService } from '../../categories/categories.service';
import { Category } from '../../categories/category.model';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Transaction } from '../transaction.model';
import { TranslateService } from '@ngx-translate/core';
import { switchMap } from 'rxjs/operators';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Component({
    selector: 'app-edit-account',
    templateUrl: './edit-transaction.page.html',
    styleUrls: ['./edit-transaction.page.scss'],
})
export class EditTransactionPage implements OnInit {
    form: FormGroup;
    transaction: Transaction;
    loadedAccounts: Account[];
    loadedCategories: Category[];
    categoryIcon: Category;
    icon;
    scannedCode = null;
    isLoading = false;
    transactionId: string;
    private accountsSub: Subscription;
    private transactionsSub: Subscription;
    private categoriesSub: Subscription;
    constructor(
        private alertCtrl: AlertController,
        private translate: TranslateService,
        private toastController: ToastController,
        private route: ActivatedRoute,
        private navCtrl: NavController,
        private transactionsService: TransactionsService,
        private accountsService: AccountsService,
        private categoriesService: CategoriesService,
        private loadingCtrl: LoadingController,
        private router: Router,
        private barcodeScanner: BarcodeScanner
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(paramMap => {
            if (!paramMap.has('transactionId')) {
                this.navCtrl.navigateBack('/main/tabs/transactions');
                return;
            }
            this.transactionId = paramMap.get('transactionId');
            this.isLoading = true;
            this.transactionsSub = this.transactionsService.getTransaction(paramMap.get('transactionId')).subscribe(transaction => {
                this.categoriesSub = this.categoriesService.categories.subscribe(categories => {
                    this.accountsSub = this.accountsService.accounts.subscribe(account => {
                        this.transaction = transaction;
                        this.form = new FormGroup({
                            type: new FormControl(this.transaction.type, { updateOn: 'change', validators: [Validators.required] }),
                            title: new FormControl(this.transaction.title, { updateOn: 'change', validators: [Validators.required, Validators.maxLength(20)] }),
                            amount: new FormControl(this.transaction.amount, { updateOn: 'change', validators: [Validators.required, Validators.min(0.01)] }),
                            note: new FormControl(this.transaction.note, { updateOn: 'blur' }),
                            date: new FormControl(this.transaction.date, { updateOn: 'change', validators: [Validators.required] }),
                            account: new FormControl(this.transaction.account, { updateOn: 'change', validators: [Validators.required] }),
                            category: new FormControl(this.transaction.category, { updateOn: 'change', validators: [Validators.required] }),
                            image: new FormControl(this.transaction.imageUrl, { updateOn: 'change' })
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
                                    categoryControl.setValue('Deposit');
                                    this.icon = 'card';
                                }
                                categoryControl.updateValueAndValidity();
                            });
                        this.loadedAccounts = account;
                        this.loadedCategories = categories?.filter(category => category.title !== 'Deposit');
                        this.isLoading = false;
                    },
                        error => {
                            this.alertCtrl
                                .create({
                                    header: 'An error occurred!',
                                    message: 'Transaction could not be fetched. Please try again later.',
                                    buttons: [
                                        {
                                            text: 'Okay',
                                            handler: () => {
                                                this.router.navigate(['/main/tabs/transactions']);
                                            }
                                        }
                                    ]
                                })
                                .then(alertEl => {
                                    alertEl.present();
                                });
                        });

                });
            });
        });
    }
    ionViewWillEnter() {
        this.accountsService.fetchAccounts().subscribe(() => {
        });
        this.categoriesService.fetchCategories().subscribe(() => {
        });
    }
    ngOnDestroy() {
        if (this.accountsSub) {
            this.accountsSub.unsubscribe();
        }
        if (this.categoriesSub) {
            this.categoriesSub.unsubscribe();
        }
        if (this.transactionsSub) {
            this.transactionsSub.unsubscribe();
        }
    }
    onUpdateTransaction() {
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
        if (this.form.value.image != null) {
            this.loadingCtrl.create({
                message: this.translate.instant('creatingTransaction')
            }).then(loadingEl => {
                loadingEl.present();

                this.transactionsService.uploadImage(this.form.get('image').value).pipe(switchMap(uploadRes => {
                    return this.transactionsService.updateTransaction(
                        this.transaction.id,
                        this.form.value.title,
                        this.form.value.type,
                        this.form.value.note,
                        this.form.value.category,
                        this.form.value.account,
                        this.form.value.amount,
                        uploadRes.imageUrl,
                        this.form.value.date,
                        this.icon)
                })).subscribe(() => {
                    loadingEl.dismiss();
                    this.presentToast();
                    this.form.reset();
                    this.router.navigate(['/', 'main', 'tabs', 'transactions']);
                });
            });
        }
        else {
            this.loadingCtrl.create({
                message: this.translate.instant('creatingTransaction')
            }).then(loadingEl => {
                loadingEl.present();
                this.transactionsService.updateTransaction(
                    this.transactionId,
                    this.form.value.title,
                    this.form.value.type,
                    this.form.value.note,
                    this.form.value.category,
                    this.form.value.account,
                    this.form.value.amount,
                    '',
                    new Date(this.form.value.date), this.icon).subscribe(() => {
                        loadingEl.dismiss();
                        this.presentToast();
                        this.form.reset();
                        this.router.navigate(['/', 'main', 'tabs', 'transactions']);
                    });

            });

        }
    }

    async presentToast() {
        const toast = await this.toastController.create({
            message: this.translate.instant('editedTransaciton') + `'${this.form.value.title}' <ion-icon name="checkmark"></ion-icon>`,
            duration: 1400,
            position: 'bottom',
            cssClass: 'tabs-bottom'
        });
        toast.present();
    }
    scanCode() {
        this.barcodeScanner.scan().then(barcodeData => {
          this.scannedCode = barcodeData.text;
          if (this.scannedCode != null) {
            let tab = this.scannedCode.split('|')
            this.form.get('amount').setValue((tab[3] / 100).toFixed(2));
            this.form.get('title').setValue(tab[4]);
            this.form.get('note').setValue(tab[5]);
          }
        }).catch(() => {
          this.alertCtrl
            .create({
              header: this.translate.instant('error'),
              message: this.translate.instant('errorScanner'),
              buttons: [
                {
                  text: 'Okay',
                  handler: () => {
                    return;
                  }
                }
              ]
            })
            .then(alertEl => {
              alertEl.present();
            });
        });
      }
      onImagePicked(imageData: string | File) {
        let imageFile;
        if (typeof imageData === 'string') {
          try {
            imageFile = base64toBlob(
              imageData.replace('data:image/jpeg;base64,', ''),
              'image/jpeg'
            );
          } catch (error) {
            console.log(error);
            return;
          }
        } else {
          imageFile = imageData;
        }
        this.form.patchValue({ image: imageFile });
      }
}
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





