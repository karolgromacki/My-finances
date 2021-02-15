import { Component, OnInit, ViewChild } from '@angular/core';
import { Label } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { Transaction } from '../transactions/transaction.model';
import { TransactionsService } from '../transactions/transactions.service';
import { SegmentChangeEventDetail } from '@ionic/core';
import * as Chart from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { LegendService } from 'src/app/Services/legend.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
})
export class SummaryPage implements OnInit {
  hide;
  legend;
  transactionSub: Subscription;
  loadedTransactions: Transaction[];
  relevantTransactions: Transaction[];
  expenseChartLabels: Label[] = [];
  expenseChart: Chart;
  expenseChartData = [];
  expenseConfig;
  balanceChart: Chart;
  balanceConfig;
  expences: number = 0;
  deposits: number = 0;
  segment = 'year';
  dateFrom: Date = new Date();
  dateTo: Date;
  constructor(private transactionsService: TransactionsService,
    private translate: TranslateService,
    private storage: Storage,
    private legendService: LegendService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.legendService.selected.subscribe(selected => this.legend = selected);
    this.transactionSub = this.transactionsService.transactions.subscribe(transaction => {
      this.loadedTransactions = transaction;
      this.relevantTransactions = this.loadedTransactions;
    });
  }

  addDataToChart(relevant) {
    for (let transaction of relevant) {
      let expences = 0;
      let deposits = 0;
      let sum = 0;
      if (transaction.type === 'expense') {
        //For expense chart
        if (!this.expenseChartLabels.includes(transaction.category)) {
          this.expenseChartLabels.push(transaction.category);
          for (let amount of relevant) {
            if (amount.type == 'expense' && transaction.category === amount.category) {
              sum += amount.amount;
            }
          }
        }
        //For balance chart
        expences += transaction.amount;
        //console.log(expences)
        this.expenseChartData.push(sum);
        this.expences += expences;
      }
      else {
        //For balance chart
        deposits += transaction.amount;
        this.deposits += deposits
      }
    }
    this.expences.toFixed(2)

  }


  ionViewWillEnter() {
    this.transactionsService.fetchTransactions().subscribe(() => {
      if (this.relevantTransactions.length > 0 && document.getElementById('expenses')) {
        this.onFilterUpdate();
      }
    });
  }

  ionViewWillLeave() {
    if (this.expenseChart && this.balanceChart) {
      this.expenseChart.destroy();
      this.balanceChart.destroy();
    }
  }
  // hideLegend(event) {
  //   this.legendService.setLegend(event.detail.checked);
  //   this.onFilterUpdate();
  // }

  onFilterUpdate() {
    if (this.expenseChartData.length === 0 && this.balanceChart) {
      this.hide = true;
      this.expenseChart.destroy()
      this.balanceChart.destroy()
    }
    if (this.segment === 'day') {
      this.segment = 'day';
      this.dateTo = null;
      this.dateFrom = new Date()
      this.relevantTransactions = [];
      this.relevantTransactions = this.loadedTransactions.filter(transaction => new Date(transaction.date).toDateString() === new Date().toDateString());
    }
    else if (this.segment === 'week') {
      this.segment = 'week';
      this.relevantTransactions = [];
      if (new Date().getDay() == 0) {
        this.dateTo = new Date(new Date().getTime())
      }
      else {
        this.dateTo = new Date(new Date(new Date().getTime() + ((7 - (new Date().getDay())) * 24 * 60 * 60 * 1000)).toDateString())
        // 21 {dzisiejsza data do milisekund} + (7 {ilość dni w tyg} - 1 {dzisiejszy dzień tyg do milisekund}  
      }
      console.log(this.dateTo)
      this.dateFrom = new Date(this.dateTo.getTime() - (6 * 24 * 60 * 60 * 1000))
      this.relevantTransactions = this.loadedTransactions.filter(transaction => new Date(transaction.date).getTime() >= this.dateFrom.getTime() && new Date(transaction.date).getTime() <= this.dateTo.getTime());
      console.log(this.dateFrom)
    }
    else if (this.segment === 'month') {
      this.segment = 'month';
      let now = new Date()
      this.dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      this.dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
      this.relevantTransactions = [];
      this.relevantTransactions = this.loadedTransactions.filter(transaction => new Date(transaction.date).getMonth() === new Date().getMonth());

    }
    else if (this.segment === 'year') {
      this.segment = 'year';
      this.dateTo = null
      this.dateFrom = new Date()
      this.relevantTransactions = [];
      this.relevantTransactions = this.loadedTransactions.filter(transaction => new Date(transaction.date).getFullYear() === new Date().getFullYear());
    }
    if (this.relevantTransactions.length > 0) {
      this.addDataToChart(this.relevantTransactions);
      this.configChart();
      if (this.expenseChartData.length === 0) {
        this.hide = true;
      }
      else if (this.expenseChartData.length !== 0) {
        this.hide = false;
      }
      this.expenseChart = new Chart('expenses', this.expenseConfig)
      this.balanceChart = new Chart('balance', this.balanceConfig)
    }

    this.expenseChartLabels = []
    this.expenseChartData = []
    this.expences = 0;
    this.deposits = 0;
  }

  onOptionButtonClick() {
    let legendLabel;
    if (!this.legend)
      legendLabel = "showLegend"
    else
      legendLabel = "hideLegend"
    console.log(this.legend)
    this.alertCtrl.create({
      header: 'Legenda',
      inputs: [
        {
          type: 'radio',
          label: this.translate.instant(legendLabel),
          value: !this.legend
        },
      ],
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
        },
        {
          text: 'Ok',
          handler: data => {
            if (data != null) {
              this.legendService.setLegend(data);
              this.onFilterUpdate();
            }
          }
        }
      ]
    }).then(alertEl => {
      alertEl.present();
    });
  }

  configChart() {
    this.expenseConfig = {
      type: 'doughnut',
      data: {
        labels: this.expenseChartLabels,
        datasets: [{
          label: '# of Votes',
          data: this.expenseChartData,
          backgroundColor: ['#277DA1', '#577590', '#43aa8b', '#90be6d', '#F9C74F', '#F9844A', '#f8961e', '#f3722c', '#f94144',],
          borderWidth: 1

        }]
      },
      options: {
        title: {
          display: true,
          text: this.translate.instant('expenses')
        },
        responsive: true,
        cutoutPercentage: 80,
        legend: {
          display: this.legend,
          position: 'left',
          onClick: (e) => e.stopPropagation()
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              try {
                let label = ' ' + data.labels[tooltipItem.index] || '';

                if (label) {
                  label += ': ';
                }

                const sum = data.datasets[0].data.reduce((accumulator, curValue) => {
                  return accumulator + curValue;
                });
                const value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

                label += value.toFixed(2) + ', ' + Number((value / sum) * 100).toFixed(2) + '%';
                return label;
              } catch (error) {
                console.log(error);
              }
            }
          },
          pan: {
            enabled: false,
            mode: "x",
            speed: 100,
            threshold: 100
          },
          zoom: {
            enabled: false,
            drag: false,
            mode: "xy",
            limits: {
              max: 0,
              min: 0
            }
          }
        },

      }
    }


    this.balanceConfig = {
      responsive: true,
      type: 'horizontalBar',
      data: {
        labels: ' ',
        datasets: [{
          label: this.translate.instant('expenses'),
          data: [this.expences],
          backgroundColor: '#f94144',
          borderWidth: 1
        },
        {
          label: this.translate.instant('deposits'),
          data: [this.deposits],
          backgroundColor: '#2dd36f',
          borderWidth: 1
        }
        ]
      },
      options: {
        title: {
          display: true,
          text: this.translate.instant('balance')
        },
        legend: {
          onClick: (e) => e.stopPropagation()
        },
        scales: {
          xAxes: [{
            display: true,
            gridLines: {
              display: true,
              color: "#777777"
            },
          }],
          yAxes: [{
            display: true,
            gridLines: {
              display: true,
              color: "#777777"
            },
          }]
        },
        tooltips: {
          titleFontSize: 0,
          callbacks: {
            label: function (tooltipItem, data) {
              try {
                let label = ' ' + data.labels[tooltipItem.index] || '';

                if (label) {
                  label += ': ';
                }

                const sumExpense = data.datasets[0].data.reduce((accumulator, curValue) => {
                  return accumulator + curValue;
                });
                const sumDeposit = data.datasets[1].data.reduce((accumulator, curValue) => {
                  return accumulator + curValue;
                });
                const sum = sumExpense + sumDeposit
                const value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

                label += value.toFixed(2) + ', ' + Number((value / sum) * 100).toFixed(2) + '%';
                return label;
              } catch (error) {
                console.log(error);
              }
            }
          },
          pan: {
            enabled: false,
            mode: "x",
            speed: 100,
            threshold: 100
          },
          zoom: {
            enabled: false,
            drag: false,
            mode: "xy",
            limits: {
              max: 0,
              min: 0
            }
          }
        },
      }
    }

    Chart.scaleService.updateScaleDefaults('linear', {
      ticks: {
        min: 0
      }
    });
  }


}


