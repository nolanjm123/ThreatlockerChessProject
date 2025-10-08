import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ChessApp';
}


// import { Component, OnInit } from '@angular/core';
// import { HttpClientModule } from '@angular/common/http';
// import { RouterOutlet } from '@angular/router';
// import { WeatherService } from './services/weather.service';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [HttpClientModule, RouterOutlet],
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.scss']
// })
// export class AppComponent implements OnInit {
//   title = 'ChessApp';
//   weatherData: any[] = [];

//   constructor(private weatherService: WeatherService) {}

//   ngOnInit(): void {
//     this.weatherService.getForecast().subscribe({
//       next: (data) => {
//         console.log('Weather data received:', data);
//         this.weatherData = data;
//       },
//       error: (err) => {
//         console.error('Error fetching weather data:', err);
//       }
//     });
//   }
// }