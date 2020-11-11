import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, IonItemSliding, LoadingController } from '@ionic/angular';
import { ChartDataSets, ChartType } from 'chart.js';
import { Color, Label, MultiDataSet, PluginServiceGlobalRegistrationAndOptions } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { TransactionsService } from '../transactions/transactions.service';
import { CategoriesService } from './categories.service';
import { Category } from './category.model';


@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {
  // public ChartLabels: Label[] = [
  //   "Download Sales",
  //   "In-Store Sales",
  //   "Mail-Order Sales"
  // ];
  // public ChartData: MultiDataSet = [[350, 450, 100]];
  // public ChartType: ChartType = "doughnut";
  // public ChartOptions = {
  //   responsive: true,
  // title: {
  //   display: true,
  //   text: 'Categories'
  // },
  //   cutoutPercentage: 80
  // }
  // public chartColors: Color[] = [
  //   { backgroundColor: ["#8d5ea8", "#c96ca1", "#fb8986", "#fbbc86", "#fbd486", "#fbe786", "#fbf986", "#c6ea7d", "#6ac670", "#529996", "#6179a7", "#7666ad"] }

  // ];
  // public ChartPlugins: PluginServiceGlobalRegistrationAndOptions[] = [
  //   {
  //     beforeDraw(chart) {
  //       const ctx = chart.ctx;
  //       const txt = "Center Text";

  //       //Get options from the center object in options
  //       const sidePadding = 70;
  //       const sidePaddingCalculated =
  //         (sidePadding / 100) * (chart.innerRadius * 2);

  //       ctx.textAlign = "center";
  //       ctx.textBaseline = "middle";
  //       const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
  //       const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

  //       //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
  //       const stringWidth = ctx.measureText(txt).width;
  //       const elementWidth = chart.innerRadius * 2 - sidePaddingCalculated;

  //       // Find out how much the font can grow in width.
  //       const widthRatio = elementWidth / stringWidth;
  //       const newFontSize = Math.floor(30 * widthRatio);
  //       const elementHeight = chart.innerRadius * 2;

  //       // Pick a new font size so it will not be larger than the height of label.
  //       const fontSizeToUse = Math.min(newFontSize, elementHeight);

  //       ctx.font = fontSizeToUse + "px Arial";
  //       ctx.fillStyle = "white";

  //       // Draw text in center
  //       ctx.fillText("Center Text", centerX, centerY - (centerY * 0.1));
  //       ctx.fillText("Center Text", centerX, centerY + (centerY * 0.1));
  //     }
  //   }
  // ];

  relevantCategories: Category[];
  private categoriesSub: Subscription;

  constructor(
    private categoriesService: CategoriesService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private transactionsService: TransactionsService
    // private modalCtrl: ModalController
  ) { }

  // public chartClicked({
  //   event,
  //   active
  // }: {
  //   event: MouseEvent;
  //   active: {}[];
  // }): void {
  //   console.log(event, active);
  // }

  // public chartHovered({
  //   event,
  //   active
  // }: {
  //   event: MouseEvent;
  //   active: {}[];
  // }): void {
  //   console.log(event, active);
  // }

  ngOnInit() {
  }

  onCategory(categoryId) {
    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Detail',
          icon: 'list',
          handler: () => {
            this.router.navigate(['/', 'main', 'tabs', 'categories', categoryId]);
          }
        },
        {
          text: 'Edit',
          icon: 'create-outline',
          handler: () => {
            this.router.navigate(['/', 'main', 'tabs', 'categories', 'edit', categoryId]);
          }
        },
        {
          text: 'Delete',
          icon: 'trash',
          handler: () => {
            this.onDelete(categoryId);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          icon: 'close-circle'
        }
      ]
    }).then(actionSheetEl => { actionSheetEl.present(); });
  }


  // chart() {
  //   this.categoriesService.categories.subscribe(categories => {
  //     this.transactionsService.transactions.subscribe(transactions => {
  //       let sum;
  //       categories.forEach(category => {
  //         sum = 0;
  //         transactions.forEach(transaction => {
  //           if (category.title === transaction.category) {
  //             if (transaction.category !== 'Deposit') {
  //               sum -= transaction.amount;
  //             }
  //           }
  //         });
  //       });
  //     });
  //   });

  // }
  onDelete(categoryId: string) {
    this.categoriesService.deleteCategory(categoryId).subscribe(() => {
    });
    this.relevantCategories = this.relevantCategories.filter(category => category.title !== 'Deposit');
    this.relevantCategories = this.relevantCategories.filter(category => category.title !== 'Transfer');
  }
  ionViewWillEnter() {

    this.categoriesSub = this.categoriesService.categories.subscribe(categories => {
      this.relevantCategories = categories;
    });
    this.relevantCategories = this.relevantCategories.filter(category => category.title !== 'Deposit');
    this.relevantCategories = this.relevantCategories.filter(category => category.title !== 'Transfer');
  }
  ngOnDestroy() {
    if (this.categoriesSub) {
      this.categoriesSub.unsubscribe();
    }

  }
  onEdit(categoryId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'main', 'tabs', 'categories', 'edit', categoryId]);
  }
}
