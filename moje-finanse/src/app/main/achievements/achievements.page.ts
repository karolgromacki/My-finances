import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Achievement } from './achievement.model';
import { AchievementsService } from './achievements.service';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.page.html',
  styleUrls: ['./achievements.page.scss'],
})
export class AchievementsPage implements OnInit {
  loadedAchievements: Achievement[];
  constructor(private modalCtrl: ModalController, private achievementsService: AchievementsService) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.achievementsService.fetchAchievements().subscribe(achievements => {
      this.loadedAchievements = achievements.sort((a, b) => a.title !== b.title ? a.title < b.title ? -1 : 1 : 0);
      this.loadedAchievements = this.loadedAchievements.sort((a, b) => b.obtained !== a.obtained ? b.obtained < a.obtained ? -1 : 1 : 0);
    });
  }
  onClose() {
    this.modalCtrl.dismiss();
  }

}
