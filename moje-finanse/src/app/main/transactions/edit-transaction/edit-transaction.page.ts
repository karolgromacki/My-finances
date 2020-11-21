import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AccountsService } from '../../accounts/accounts.service';
import { TransactionsService } from '../transactions.service';
import { Account } from '../../accounts/account.model';
import { CategoriesService } from '../../categories/categories.service';
import { Category } from '../../categories/category.model';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Transaction } from '../transaction.model';

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
    isLoading = false;
    transactionId: string;
    private accountsSub: Subscription;
    private transactionsSub: Subscription;
    private categoriesSub: Subscription;
    constructor(
        private alertCtrl: AlertController,
        private toastController: ToastController,
        private route: ActivatedRoute,
        private navCtrl: NavController,
        private transactionsService: TransactionsService,
        private accountsService: AccountsService,
        private categoriesService: CategoriesService,
        private loadingCtrl: LoadingController,
        private router: Router
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
                        console.log(this.transaction)
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
            console.log(this.form)
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
            message: 'Creating transaction...'
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
                new Date(this.form.value.date), this.icon).subscribe(() => {
                    loadingEl.dismiss();
                    this.presentToast();
                    this.form.reset();
                    this.router.navigate(['/', 'main', 'tabs', 'transactions']);
                });
        });
    }
    //   onUpdateAccount() {
    //     if (!this.form.valid) {
    //       return;
    //     }
    //     this.loadingCtrl.create({
    //       message: 'Updating account...'
    //     }).then(loadingEl => {
    //       loadingEl.present();
    //       this.transactionsService.updateTransaction(
    //         this.transaction.id,
    //         this.form.value.title,
    //         this.form.value.note,
    //         this.form.value.baseAmount,
    //       ).subscribe(() => {
    //         loadingEl.dismiss();
    //         this.presentToast();
    //         this.form.reset();
    //         this.router.navigate(['/', 'main', 'tabs', 'accounts']);
    //       });
    //     });
    //   }

    async presentToast() {
        const toast = await this.toastController.create({
            message: `Created transaction '${this.form.value.title}' <ion-icon name="checkmark"></ion-icon>`,
            duration: 1500,
            position: 'top'
        });
        toast.present();
    }
}






// function base64toBlob(base64Data, contentType) {
//   contentType = contentType || '';
//   const sliceSize = 1024;
//   const byteCharacters = atob(base64Data);
//   const bytesLength = byteCharacters.length;
//   const slicesCount = Math.ceil(bytesLength / sliceSize);
//   const byteArrays = new Array(slicesCount);

//   for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
//     const begin = sliceIndex * sliceSize;
//     const end = Math.min(begin + sliceSize, bytesLength);

//     const bytes = new Array(end - begin);
//     for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
//       bytes[i] = byteCharacters[offset].charCodeAt(0);
//     }
//     byteArrays[sliceIndex] = new Uint8Array(bytes);
//   }
//   return new Blob(byteArrays, { type: contentType });
// }

// export class EditTransactionPage implements OnInit {
//   form: FormGroup;
//   loadedAccounts: Account[];
//   loadedCategories: Category[];
//   private accountsSub: Subscription;
//   private categoriesSub: Subscription;
//   private transactionsSub: Subscription;
//   categoryIcon: Category;
//   icon;
//   transactionId;
//   constructor(
//     private toastController: ToastController,
//     private transactionService: TransactionsService,
//     private router: Router,
//     private route: ActivatedRoute,
//     private navCtrl: NavController,
//     private loadingCtrl: LoadingController,
//     private accountsService: AccountsService,
//     private categoriesService: CategoriesService
//   ) { }

//   ngOnInit() {
//     this.route.paramMap.subscribe(paramMap => {
//       if (!paramMap.has('transactionId')) {
//         this.navCtrl.navigateBack('/main/tabs/transactions');
//         return;
//       }
//       this.transactionId = paramMap.get('transactionId');
//       // this.isLoading = true;
//       this.transactionsSub = this.accountsService.getAccount(paramMap.get('accountId')).subscribe(transaction => {
//         this.categoriesSub = this.categoriesService.categories.subscribe(categories => {
//           this.accountsSub = this.accountsService.accounts.subscribe(account => {
//             this.form = new FormGroup({
//               type: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
//               title: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.maxLength(20)] }),
//               amount: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.min(0.01)] }),
//               note: new FormControl(null, { updateOn: 'blur' }),
//               date: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
//               account: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
//               category: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
//               image: new FormControl(null, { updateOn: 'change' })
//             });

//             const categoryControl = this.form.get('category');
//             this.form.get('type').valueChanges
//               .subscribe(userType => {
//                 if (userType === 'expense') {
//                   categoryControl.setValue(null);
//                   categoryControl.setValidators([Validators.required]);
//                   categoryControl.valueChanges
//                     .subscribe(userCategory => {
//                       if (this.form.value.type === 'expense') {
//                         this.categoryIcon = this.loadedCategories.find(category => category.title === userCategory);
//                       }
//                     });
//                 }
//                 else if (userType === 'deposit') {
//                   categoryControl.setValidators(null);
//                   categoryControl.setValue('Deposit');
//                   this.icon = 'card';
//                 }
//                 categoryControl.updateValueAndValidity();
//               });

//             this.loadedAccounts = account;
//             this.loadedCategories = categories.filter(category => category.title !== 'Deposit');
//           });
//         });
//       });
//     });
//   }

//   
//   
//   
//   
//   
//   

//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   
//   onImagePicked(imageData: string | File) {
//     let imageFile
//     if (typeof imageData === 'string') {
//       try {
//         imageFile = base64toBlob(imageData.replace('data:image/jpeg;base64', ''), 'image/jpeg')
//       }
//       catch (error) {
//         console.log(error);
//         return;
//       }
//     }
//     else {
//       imageFile = imageData;
//     }
//     this.form.patchValue({ image: imageFile });
//   }
// }
