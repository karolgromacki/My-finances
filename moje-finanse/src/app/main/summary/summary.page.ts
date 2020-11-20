import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { Transaction } from '../transactions/transaction.model';
import { TransactionsService } from '../transactions/transactions.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
})
export class SummaryPage implements OnInit {
  @ViewChild('slides', { static: true }) slides: IonSlides;
  loadedTransactions: Transaction[];
  private transactionsSub: Subscription;
  isLoading = false;
  Expences = 0;
  Deposits = 0;
  barChartColors: Color[] = [
    { backgroundColor: '#f94144' },
    { backgroundColor: '#2dd36f' },

  ]
  public barChartOptions: ChartOptions = {
    legend: {
      position: 'top'
    },
    responsive: true,
    scales: {

      xAxes: [{
        gridLines: {
          color: '#CCCCCC'
        },
        display: true,
        ticks: {
          suggestedMin: 0,
          beginAtZero: true
        }
      }], yAxes: [{

      }]
    },
  };
  public barChartLabels: Label[] = [' '];
  public barChartType: ChartType = 'horizontalBar';
  public barChartLegend = true;

  public barChartData: ChartDataSets[] = [
    { data: [], label: 'Expences' },
    { data: [], label: 'Deposits' }
  ];


  chartData: ChartDataSets[] = [{ data: [], label: 'transactions' }];
  chartLabels: Label[];
  chartOptions = {
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
  };
  chartColors: Color[] = [
    {
      backgroundColor: ['#277DA1', '#577590', '#43aa8b', '#90be6d', '#F9C74F', '#F9844A', '#f8961e', '#f3722c', '#f94144',],
      borderWidth: 1
    },
  ]
  chartType = 'doughnut';


  constructor(private http: HttpClient, private transactionsService: TransactionsService) { }

  ngOnInit() {
    // this.slides.isEnd().then(isEnd => isEnd = true);

    this.transactionsSub = this.transactionsService.transactions.subscribe(transactions => {
      this.chartData[0].data = [];
      this.barChartData[0].data = [];
      this.barChartData[1].data = [];
      this.chartLabels = [];
 

      this.loadedTransactions = transactions;
      // this.slides.slideTo(this.loadedTransactions.length);
      this.loadedTransactions = this.loadedTransactions.sort((a, b) => b.date.valueOf() - a.date.valueOf());
      this.loadedTransactions.forEach(element => {
        element.date = new Date(new Date(element.date).toDateString())
      });
      for (let category of this.loadedTransactions) {
        let Expences = 0;
        let Deposits = 0;
        let sum = 0;
        if (category.type === 'expense') {
          if (!this.chartLabels.includes(category.category)) {
            this.chartLabels.push(category.category);
            console.log(this.chartLabels)
            for (let amount of this.loadedTransactions) {
               if (amount.type == 'expense' && category.category === amount.category) {
                sum += amount.amount;
                Expences += category.amount;
              }
            }
          }


          this.chartData[0].data.push(sum);
          this.Expences += Expences;

        }
        else {
          Deposits += category.amount;
          this.Deposits += Deposits

        }
      }
      if (this.Expences != 0) {
        console.log(this.Expences)
        this.barChartData[0].data.push(this.Expences);
        this.barChartData[1].data.push(this.Deposits);
        this.Expences = 0;
        this.Deposits = 0;
      }
    });

  }
  ionViewWillEnter() {
    this.isLoading = true;
    this.transactionsService.fetchTransactions().subscribe(() => {
      this.isLoading = false;
    });
  }
}
