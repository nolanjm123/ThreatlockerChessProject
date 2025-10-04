import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuPage {
  constructor(private router: Router) {}

  startGame() {
    this.router.navigate(['/game']);
  }
}