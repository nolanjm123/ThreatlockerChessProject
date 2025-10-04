import { Routes } from '@angular/router';
import { MenuPage } from './menu/menu.component';
import { GamePage } from './game/game.component';

export const routes: Routes = [
  { path: '', redirectTo: '/menu', pathMatch: 'full' },
  { path: 'menu', component: MenuPage },
  { path: 'game', component: GamePage },
];
