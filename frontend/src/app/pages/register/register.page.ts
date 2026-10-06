import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { lockClosedOutline, mailOutline, nutritionOutline, personAddOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.css'],
  imports: [IonContent, CommonModule, FormsModule,IonItem,IonIcon,IonInput,IonButton,RouterLink]
})
export class RegisterPage {
  name = '';
  surname = '';
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router, private toastController: ToastController) {
    addIcons({
      mailOutline, lockClosedOutline, personAddOutline, nutritionOutline, personOutline
    });
  }

  onRegister() {
    const name = this.name.trim();
    const surname = this.surname.trim();
    if (!name || !surname) {
      this.showToast('Inserisci nome e cognome.', 'warning');
      return;
    }

    this.authService.register(this.email, this.password, name, surname).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Registrazione completata! Ora puoi effettuare il login.',
          duration: 2000,
          color: 'success'
        });
        toast.present();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }, error: () => {
        this.showToast('Errore durante la registrazione (email già in uso?)', 'danger');
      }
    });
  }

  private async showToast(message: string, color: 'warning' | 'danger') {
    const toast = await this.toastController.create({ message, duration: 2000, color });
    await toast.present();
  }

}
