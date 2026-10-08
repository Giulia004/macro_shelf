import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../app/components/navbar/navbar.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  standalone: true,
  imports: [CommonModule, NavbarComponent],
})
export class MainLayoutComponent { }