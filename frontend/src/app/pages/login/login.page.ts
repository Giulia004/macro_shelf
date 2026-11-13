import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IonButton, IonContent, IonIcon, IonInput, IonItem} from '@ionic/angular';
import { TimeoutError} from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { lockClosedOutline, mailOutline, logInOutline, alertCircleOutline, arrowBackCircleOutline, leafOutline, arrowBackOutline, arrowForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css'],
  imports: [IonContent, CommonModule, FormsModule, IonItem, IonButton, IonIcon, RouterModule, IonInput]
})
export class LoginPage {
  email = '';
  password = '';
  loginMessage = '';

  constructor(
    private authService: AuthService,
    private router:Router
  ) {
    addIcons({ mailOutline, lockClosedOutline, logInOutline,alertCircleOutline,arrowBackOutline,leafOutline,arrowForwardOutline });
  }

  onLogin() {
    this.loginMessage = '';
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard'],{replaceUrl:true});
        this.loginMessage = "Login avvenuto con successo";
      },
      error: (err: unknown) => {
        if (err instanceof TimeoutError) {
          this.loginMessage = 'Il server non ha risposto. Controlla che backend e database siano attivi, poi riprova.';
        } else if (err instanceof HttpErrorResponse && err.status === 0) {
          this.loginMessage = 'Impossibile raggiungere il server. Controlla la connessione e riprova.';
        } else if (err instanceof HttpErrorResponse && err.status === 401) {
          this.loginMessage = 'Email o password non corretti.';
        } else {
          this.loginMessage = 'Si è verificato un errore durante l’accesso. Riprova più tardi.';
        }
      }
    });
  }
}
