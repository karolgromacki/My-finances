import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Achievement } from './achievement.model';

interface AchievementData {
    title: string,
    description: string,
    date: Date,
    points: number,
    obtained: boolean,
    image: string,
    userId: string
}

@Injectable({
    providedIn: 'root'
})


export class AchievementsService {
    private _achievements = new BehaviorSubject<Achievement[]>([]);
    get achievements() {
        return this._achievements.asObservable()
    }

    constructor(private authService: AuthService, private alertController: AlertController, private translate: TranslateService,
        private http: HttpClient,) { }

    fetchAchievements() {
        let fetchedUserId: string;
        return this.authService.userId.pipe(take(1), switchMap(userId => {
            fetchedUserId = userId;
            return this.authService.token;
        }), take(1),
            switchMap(token => {
                if (!fetchedUserId) {
                    throw new Error('No user id found!')
                }
                return this.http.get<{ [key: string]: AchievementData }>(`https://my-finances-b77a0.firebaseio.com/achievements.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`)
            }), map(resData => {
                const achievements = [];
                for (const key in resData) {
                    if (resData.hasOwnProperty(key)) {
                        achievements.push(
                            new Achievement(
                                key,
                                resData[key].title,
                                resData[key].description,
                                resData[key].date,
                                resData[key].obtained,
                                resData[key].image,
                                resData[key].userId
                            )
                        );
                    }
                }
                return achievements;

            }),
            tap(achievements => {
                this._achievements.next(achievements);
            })
        );
    }

    getAchievement(id: string) {
        return this.authService.token.pipe(take(1), switchMap(token => {
            return this.http
                .get<AchievementData>(`https://my-finances-b77a0.firebaseio.com/achievements/${id}.json?auth=${token}`)

        }), map(achievementData => {
            return new Achievement(id, achievementData.title, achievementData.description, achievementData.date, achievementData.obtained, achievementData.image, achievementData.userId);
        })
        );
    }

    addAchievement(
        title: string,
        description: string,
        date: Date,
        image: string,
        obtained: boolean) {
        let generatedId: string;
        let newAchievement: Achievement;
        let fetchedUserId: string;
        return this.authService.userId.pipe(take(1), switchMap(userId => {
            if (!userId) {
                throw new Error('No user id found!')
            }
            fetchedUserId = userId;
            return this.authService.token;
        }), take(1),
            switchMap(token => {
                newAchievement = new Achievement(Math.random().toString(), title, description, date, obtained, image, fetchedUserId);
                return this.http.post<{ name: string }>(`https://my-finances-b77a0.firebaseio.com/achievements.json?auth=${token}`, { ...newAchievement, id: null });
            }),
            switchMap(resData => {
                generatedId = resData.name;
                return this.achievements;
            }),
            take(1),
            tap(achievements => {
                newAchievement.id = generatedId;
                this._achievements.next(achievements.concat(newAchievement));
            })

        );
    }

    updateAchievement(
        achievementId: string,
        date: Date,
        obtained: boolean) {
        let updatedAchievements: Achievement[];
        return this.authService.token.pipe(take(1), switchMap(token => {
            return this.achievements.pipe(
                take(1),
                switchMap(achievements => {
                    if (achievements || achievements.length <= 0) {
                        return this.fetchAchievements();
                    }
                    else {
                        return of(achievements);
                    }

                }),
                switchMap(achievements => {
                    const updatedAchievementsIndex = achievements.findIndex(tr => tr.id === achievementId);
                    const updatedAchievements = [...achievements];
                    const oldAchievement = updatedAchievements[updatedAchievementsIndex]
                    updatedAchievements[updatedAchievementsIndex] = new Achievement(
                        oldAchievement.id,
                        oldAchievement.title,
                        oldAchievement.description,
                        date,
                        obtained, oldAchievement.image, oldAchievement.userId);
                    this.presentAlert(this.translate.instant(oldAchievement.title), oldAchievement.description, oldAchievement.image);
                    return this.http.put(`https://my-finances-b77a0.firebaseio.com/achievements/${achievementId}.json?auth=${token}`,
                        { ...updatedAchievements[updatedAchievementsIndex], id: null });
                }),
                tap(() => {
                    this._achievements.next(updatedAchievements);
                })
            );
        }));
    }
    async presentAlert(header: string, description: string, image: string) {
        const alert = await this.alertController.create({

            header: this.translate.instant('achievementUnlocked'),
            subHeader: header,
            message: `<div class="ion-text-center"><img src="assets/icon/${image}.png" alt="g-maps" style="border-radius: 2px"><p>${this.translate.instant(description)}</p><div>`,
            buttons: ['OK!'],
            cssClass: 'custom-alert',
        });

        await alert.present();
    }
}