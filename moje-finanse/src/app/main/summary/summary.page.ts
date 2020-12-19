import { Component, OnInit, ViewChild } from '@angular/core';
import { Label } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { Transaction } from '../transactions/transaction.model';
import { TransactionsService } from '../transactions/transactions.service';
import { SegmentChangeEventDetail } from '@ionic/core';
import * as Chart from 'chart.js';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
})
export class SummaryPage implements OnInit {
  transactionSub: Subscription;
  loadedTransactions: Transaction[];
  relevantTransactions: Transaction[];
  expenseChartLabels: Label[] = [];
  expenseChart: Chart;
  expenseChartData = [];
  expenseConfig;
  balanceChartLabels: Label[] = [];
  balanceChart: Chart;
  balanceChartData = [];
  balanceConfig;
  Expences: number = 0;
  Deposits: number = 0;
  segment = 'day';
  dateFrom: Date = new Date();
  dateTo: Date = null;
  constructor(private transactionsService: TransactionsService) { }

  ngOnInit() {
    this.transactionSub = this.transactionsService.transactions.subscribe(transaction => {
      this.loadedTransactions = transaction;
      this.relevantTransactions = this.loadedTransactions
    });
  }

  addDataToChart(relevant) {
    for (let transaction of relevant) {
      let Expences = 0;
      let Deposits = 0;
      let sum = 0;
      if (transaction.type === 'expense') {
        if (!this.expenseChartLabels.includes(transaction.category)) {
          this.expenseChartLabels.push(transaction.category);
          for (let amount of this.loadedTransactions) {
            if (amount.type == 'expense' && transaction.category === amount.category) {
              sum += amount.amount;
              Expences += transaction.amount;
            }
          }
        }
        this.expenseChartData.push(sum);
        this.Expences += Expences;
      }
      else {
        Deposits += transaction.amount;
        this.Deposits += Deposits
      }
    }
  }


  ionViewWillEnter() {
    this.transactionsService.fetchTransactions().subscribe(() => {
      this.relevantTransactions.filter(transaction => new Date(transaction.date).toDateString() === new Date().toDateString());
      setTimeout(() => {
        if (this.relevantTransactions.length != 0 && document.getElementById('expenses')) {
          this.onFilterUpdate()
          this.expenseChart = new Chart('expenses', this.expenseConfig)
          this.balanceChart = new Chart('balance', this.balanceConfig)
        }
      }, 0)
    });
  }
  
  ionViewWillLeave(){
    this.Expences = 0;
    this.Deposits = 0;
    this.expenseChart.destroy();
    this.balanceChart.destroy();
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
    console.log(this.relevantTransactions)
    this.addDataToChart(this.relevantTransactions);
    this.configChart();
    this.expenseChart = new Chart('expenses', this.expenseConfig)
    this.balanceChart = new Chart('balance', this.balanceConfig)
    this.Expences = 0;
    this.Deposits = 0;
    this.expenseChartLabels = []
    this.expenseChartData = []
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
        cutoutPercentage: 80,
        legend: {
          position: 'right'
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

                label += value + '$ ' + Number((value / sum) * 100).toFixed(2) + '%';
                return label;
              } catch (error) {
                console.log(error);
              }
            }
          }
        },
        responsive: true,
        title: {
          display: false,
          text: 'Chart'
        },
        pan: {
          enabled: true,
          mode: 'xy'
        },
        zoom: {
          enabled: true,
          mode: 'xy'
        }
      }
    }


    this.balanceConfig = {
      type: 'horizontalBar',
      data: {
        labels: this.balanceChartLabels,
        datasets: [{
          label: 'Expences',
          data: [this.Expences],
          backgroundColor: '#f94144',
          borderWidth: 1
        },
        {
          label: 'Deposits',
          data: [this.Deposits],
          backgroundColor: '#2dd36f',
          borderWidth: 1
        }
        ]
      },
      legend: {
        display: true
      },
      responsive: true,

    }
    Chart.scaleService.updateScaleDefaults('linear', {
      ticks: {
        min: 0
      }
    });
  }


}


