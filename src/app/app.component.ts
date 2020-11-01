import { Component } from '@angular/core';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.scss', 
    '../../node_modules/@fortawesome/fontawesome-free/css/brands.min.css'
  ]
})
export class AppComponent {
  title = 'Hades Heat Randomizer';
  faTwitter = faTwitter;
}