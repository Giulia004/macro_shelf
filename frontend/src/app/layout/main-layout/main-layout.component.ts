import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular';
import { BottomNavbarComponent } from '../../components/bottom-navbar/bottom-navbar.component';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  standalone: true,
  imports: [CommonModule, IonRouterOutlet, BottomNavbarComponent],
})
export class MainLayoutComponent { }