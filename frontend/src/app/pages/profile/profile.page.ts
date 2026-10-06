import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCard, IonCardContent, IonContent, IonIcon, IonInput, IonItem, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { mailOutline, personCircleOutline, personOutline, saveOutline } from 'ionicons/icons';
import { User, UserService } from '../../../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.css'],
  imports: [CommonModule, FormsModule, IonButton, IonCard, IonCardContent, IonContent, IonIcon, IonInput, IonItem]
})
export class ProfilePage implements OnInit {
  name = '';
  surname = '';
  email = '';
  isLoading = true;
  isSaving = false;

  constructor(private userService: UserService, private toastController: ToastController) {
    addIcons({ mailOutline, personCircleOutline, personOutline, saveOutline });
  }

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: user => this.setProfile(user),
      error: error => {
        console.error('Errore nel caricamento del profilo utente', error);
        this.isLoading = false;
        this.showToast('Impossibile caricare il profilo. Riprova più tardi.', 'danger');
      }
    });
  }

  saveProfile() {
    const name = this.name.trim();
    const surname = this.surname.trim();
    if (!name || !surname) {
      this.showToast('Nome e cognome sono obbligatori.', 'warning');
      return;
    }

    this.isSaving = true;
    this.userService.updateProfile(name, surname).subscribe({
      next: user => {
        this.setProfile(user);
        this.isSaving = false;
        this.showToast('Profilo aggiornato.', 'success');
      },
      error: error => {
        console.error('Errore nel salvataggio del profilo utente', error);
        this.isSaving = false;
        this.showToast('Impossibile salvare il profilo. Riprova.', 'danger');
      }
    });
  }

  private setProfile(user: User) {
    this.name = user.name ?? '';
    this.surname = user.surname ?? '';
    this.email = user.email;
    this.isLoading = false;
  }

  private async showToast(message: string, color: 'warning' | 'success' | 'danger') {
    const toast = await this.toastController.create({ message, duration: 2200, color });
    await toast.present();
  }
}
