import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseballComponent } from './baseball/baseball.component';
import { BubbleChartComponent } from './bubble-chart/bubble-chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BaseballComponent, BubbleChartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'd3bb';
}
