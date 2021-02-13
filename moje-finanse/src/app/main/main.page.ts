
import { Component, OnInit, Input } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AccountsPage } from './accounts/accounts.page';
import { Achievement } from './achievements/achievement.model';
import { AchievementsService } from './achievements/achievements.service';
import { CategoriesPage } from './categories/categories.page';
import { Transaction } from './transactions/transaction.model';
import { TransactionsPage } from './transactions/transactions.page';
import { TransactionsService } from './transactions/transactions.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {
  loadedAchievements: Achievement[];
  achievementSub: Subscription;
  accountsPage = AccountsPage;
  categoriesPage = CategoriesPage;
  transactionsPage = TransactionsPage;


  @Input() tutorial: string;
  constructor(private achievementsService: AchievementsService, private storage: Storage,) { }

  ngOnInit() {
    this.achievementsService.fetchAchievements().subscribe(achievements => {
      this.loadedAchievements = achievements;
      if (this.loadedAchievements.length == 0) {
        let newAchievements = [
          { title: 'achievementA', description: 'achievementAdescription', date: new Date(), image: 'transaction', obtained: true },
          { title: 'achievementB', description: 'achievementBdescription', date: new Date(), image: 'transaction10', obtained: true },
          { title: 'achievementC', description: 'achievementCdescription', date: new Date(), image: 'transaction20', obtained: true },
          { title: 'achievementD', description: 'achievementDdescription', date: new Date(), image: 'transaction50', obtained: true },
          { title: 'achievementE', description: 'achievementEdescription', date: new Date(), image: 'transaction100', obtained: true},
          { title: 'achievementF', description: 'achievementFdescription', date: new Date(), image: 'transaction150', obtained: true },
          { title: 'achievementG', description: 'achievementGdescription', date: new Date(), image: 'transaction200', obtained: true },
          { title: 'achievementH', description: 'achievementHdescription', date: new Date(), image: 'transfer', obtained: true },
          { title: 'achievementI', description: 'achievementIdescription', date: new Date(), image: 'transfer10', obtained: true },
          { title: 'achievementJ', description: 'achievementJdescription', date: new Date(), image: 'transfer20', obtained: true },
          { title: 'achievementK', description: 'achievementKdescription', date: new Date(), image: 'transfer50', obtained: true },
          { title: 'achievementL', description: 'achievementLdescription', date: new Date(), image: 'transfer100', obtained: true },
          { title: 'achievementM', description: 'achievementMdescription', date: new Date(), image: 'piggybank', obtained: true },
          { title: 'achievementN', description: 'achievementNdescription', date: new Date(), image: 'medal', obtained: false },
        ]
        newAchievements.forEach(achievement => {
          this.achievementsService.addAchievement(achievement.title, achievement.description, achievement.date, achievement.image, achievement.obtained).subscribe();
        });
      }
    });

  }
  ionViewDidEnter() {


  }
}