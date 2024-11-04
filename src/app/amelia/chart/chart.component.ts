import { Component, Input } from '@angular/core';
import { DimensionsType } from './../utils/types';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [NgFor],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent {
  @Input() dimensions!: DimensionsType

constructor() {

}

ngOnInit() {
  // console.log('chart ngOnInit', this.dimensions)
}
}

