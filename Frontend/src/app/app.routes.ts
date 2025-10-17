import { Routes } from '@angular/router';
import { MenuPage } from './menu/menu.component';
import { GamePage } from './game/game.component';
import { HistoryPage } from './history/history.component';
import { ReplayPage } from './replay/replay.component';

export const routes: Routes = [
  { path: '', redirectTo: '/menu', pathMatch: 'full' },
  { path: 'menu', component: MenuPage },
  { path: 'game', component: GamePage },
  { path: 'history', component: HistoryPage},
  { path: 'replay', component: ReplayPage},
];
