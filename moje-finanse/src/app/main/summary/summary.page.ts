import { Component, OnInit, ViewChild } from '@angular/core';
import { Label } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { Transaction } from '../transactions/transaction.model';
import { TransactionsService } from '../transactions/transactions.service';
import { SegmentChangeEventDetail } from '@ionic/core';
import * as Chart from 'chart.js';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
})
export class SummaryPage implements OnInit {
  hide;
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
  constructor(private transactionsService: TransactionsService, private translate: TranslateService,) { }

  ngOnInit() {
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
          for (let amount of this.loadedTransactions) {
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
        console.log(this.expences)
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
    // this.Expences = 0;
    // this.Deposits = 0;
    if (this.expenseChart && this.balanceChart) {
      this.expenseChart.destroy();
      this.balanceChart.destroy();
    }
  }

  onFilterUpdate() {
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
      this.dateTo = new Date(new Date().getTime() + ((7 - (new Date().getDay())) * 24 * 60 * 60 * 1000))
      // 21 {dzisiejsza data do milisekund} + (7 {ilość dni w tyg} - 1 {dzisiejszy dzień tyg do milisekund}  
      this.dateFrom = new Date(this.dateTo.getTime() - (6 * 24 * 60 * 60 * 1000))
      this.relevantTransactions = this.loadedTransactions.filter(transaction => new Date(transaction.date).getTime() >= this.dateFrom.getTime() && new Date(transaction.date).getTime() <= this.dateTo.getTime());

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
      this.expenseChartLabels = []
      this.expenseChartData = []
      this.expenseChart = new Chart('expenses', this.expenseConfig)
      this.balanceChart = new Chart('balance', this.balanceConfig)
    }
    else if (this.expenseChartData.length === 0 && this.balanceChart) {
      this.hide = true;
      this.expenseChart.destroy()
      this.balanceChart.destroy()
    }
    this.expenseChartLabels = []
    this.expenseChartData = []
    this.expences = 0;
    this.deposits = 0;
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
          position: 'right',
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

                label += value.toFixed(2) + '$ ' + Number((value / sum) * 100).toFixed(2) + '%';
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

                label += value.toFixed(2) + '$ ' + Number((value / sum) * 100).toFixed(2) + '%';
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


