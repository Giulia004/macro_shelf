import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonSpinner, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { alertCircleOutline, arrowBackOutline, leafOutline, lockClosedOutline, mailOutline, nutritionOutline, personAddOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.css'],
  imports: [IonContent, CommonModule, FormsModule, IonItem, IonIcon, IonInput, IonButton, RouterLink, IonSpinner]
})
export class RegisterPage {
  name = '';
  surname = '';
  email = '';
  password = '';

  isRegistering = false;
  registerMessage = '';

  constructor(private authService: AuthService, private router: Router, private toastController: ToastController) {
    addIcons({
      mailOutline, lockClosedOutline, personAddOutline, nutritionOutline, personOutline, leafOutline, arrowBackOutline, alertCircleOutline
    });
  }

  onRegister() {
    if (this.isRegistering) return;

    const name = this.name.trim();
    const surname = this.surname.trim();

    this.registerMessage = '';

    if (!name || !surname) {
      this.registerMessage = "Inserisci il tuo indirizzo email";
      return;
    }

    if (!this.password) {
      this.registerMessage = "Inserisci una password";
      return;
    }

    this.isRegistering = true;
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
        this.registerMessage = "Errore durante la registrazione."
        this.isRegistering = false;
      }, complete: () => this.isRegistering = false
    });
  }

  private async showToast(message: string, color: 'warning' | 'danger') {
    const toast = await this.toastController.create({ message, duration: 2000, color });
    await toast.present();
  }

}
