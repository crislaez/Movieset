import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private translate: TranslateService,
    public toastController: ToastController,
  ) { }


  notificationSuccess(message: string): void {
    this.presentToast(this.translate.instant(message), 'success')
  }

  notificationFailure(message: string): void {
    this.presentToast(this.translate.instant(message), 'danger')
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      color: color,
      duration: 1000,
      cssClass: 'toast-wrapper'
    });
    toast.present();
  }

}
