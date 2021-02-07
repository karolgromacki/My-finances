import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ImagePickerComponent } from './pickers/image-picker/image-picker.component';
import { GroupByPipe } from '../Pipes/groupByPipe';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ImagePickerComponent,
    GroupByPipe
  ],
  imports: [CommonModule, IonicModule, TranslateModule],
  exports: [ImagePickerComponent, GroupByPipe],

})

export class SharedModule { }
