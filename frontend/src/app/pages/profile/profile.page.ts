import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonTitle, IonToolbar, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, chevronForwardOutline, createOutline, keyOutline, mailOutline, personCircleOutline, personOutline, saveOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { User, UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.css'],
  imports: [CommonModule, FormsModule, IonButton, IonContent, IonIcon, IonInput,IonHeader,IonTitle,IonToolbar,IonIcon,IonButton,IonButtons]
})
export class ProfilePage implements OnInit {
  constructor(private authService: AuthService, private userService: UserService, private toastController: ToastController,private router:Router) {
    addIcons({ arrowBackOutline,personOutline,mailOutline,shieldCheckmarkOutline,createOutline,keyOutline,chevronForwardOutline });
  }

  currentUser = this.authService.currentUser();

  name = this.currentUser?.name || '';
  surname = this.currentUser?.surname || '';
  email = this.currentUser?.email || '';

  isEditing = false;
  isLoading = true;
  isSaving = false;

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

  loadProfile() {
    this.userService.getProfile().subscribe({
      next:user=> {
        this.isLoading = true;
        this.setProfile(user);
      },
      error: (error) => {
        console.log(error);
        this.isLoading = false;
        this.showToast('Impossibile caricare il profilo', 'danger');
      }
    })
  }

  goBack() {
    this.router.navigate(['/settings']);
  }

  toggleEdit() {
    if (this.isEditing) this.saveProfile();
    else this.isEditing = true;
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
      next: (user: Partial<User>) => {
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

  private setProfile(user: Partial<User>) {
    this.name = user.name ?? '';
    this.surname = user.surname ?? '';
    this.email = user.email ?? this.email;
    this.isLoading = false;
  }

  private async showToast(message: string, color: 'warning' | 'success' | 'danger') {
    const toast = await this.toastController.create({ message, duration: 2200, color,position:'bottom' });
    await toast.present();
  }

  openEditModal() {
    
  }
}
