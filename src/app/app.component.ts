import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThreeDContainerComponent } from './three-d-container/three-d-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ThreeDContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'container';
}
