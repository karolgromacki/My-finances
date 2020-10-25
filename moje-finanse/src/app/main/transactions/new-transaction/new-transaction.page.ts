import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-transaction',
  templateUrl: './new-transaction.page.html',
  styleUrls: ['./new-transaction.page.scss'],
})
export class NewTransactionPage implements OnInit {
  form: FormGroup;

  constructor() { }

  ngOnInit() {
    this.form = new FormGroup({
      type: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
      title: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.maxLength(20)] }),
      amount: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.min(0.01)] }),
      note: new FormControl(null, { updateOn: 'blur' }),
      date: new FormControl(new Date(Date.now()).toISOString(), { updateOn: 'change', validators: [Validators.required] }),
      account: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
      category: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
    })
  }
  onCreateOffer() {
    console.log(this.form);
  }
}
