import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { basketOutline, homeOutline, libraryOutline, logOutOutline, personOutline } from 'ionicons/icons';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-bottom-navbar',
  templateUrl: './bottom-navbar.component.html',
  styleUrls: ['./bottom-navbar.component.css'],
  imports: [IonIcon, RouterLink, RouterLinkActive],
  standalone: true
})
export class BottomNavbarComponent {

  isProfileMenuOpen = signal<boolean>(false);

  constructor(private authService: AuthService, private router: Router) {
    addIcons({
      homeOutline, basketOutline, libraryOutline, personOutline, logOutOutline
    });
  }

  toggleProfileMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.isProfileMenuOpen.update(open => !open);
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl("/login");
  }
}