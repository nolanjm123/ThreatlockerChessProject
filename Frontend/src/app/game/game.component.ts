import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GamePage {
  constructor(private router: Router) {}

  backToMenu() {
    this.router.navigate(['/menu']);
  }
}
