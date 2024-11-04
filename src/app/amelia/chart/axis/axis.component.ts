import { Component, Input, SimpleChanges, OnChanges } from '@angular/core'
import * as d3 from "d3"
import { DimensionsType, ScaleType } from '../../utils/types'
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common'
@Component({
  selector: '[appAxis]',
  standalone: true,
  imports: [NgFor, NgIf, NgTemplateOutlet],
  templateUrl: './axis.component.html',
  styleUrls: ['./axis.component.css']
})
export class AxisComponent implements OnChanges {
  @Input() dimensions!: DimensionsType
  @Input() dimension: "x" | "y" = "x"
  @Input() public scale!: ScaleType
  @Input() label!: string
  @Input() formatTick: (value: any) => (string|number) = d3.format(",")
  public ticks!: any // Function[]

  updateTicks() {
    if (!this.dimensions || !this.scale) return

    // let numberOfTicks = this.dimension == "x"
    //   ? this.dimensions.boundedWidth || 0 < 600
    //     ? this.dimensions.boundedWidth || 0 / 100
    //     : this.dimensions.boundedWidth || 0 / 250
    //   : this.dimensions.boundedHeight || 0 / 70

      let numberOfTicks =
      this.dimension == "x"
        ? (this.dimensions.boundedWidth || 0)  < 600
          ? (this.dimensions.boundedWidth || 0) / 100
          : (this.dimensions.boundedWidth || 0) / 250
        : (this.dimensions.boundedHeight || 0) / 70;

    // if (numberOfTicks > 10) {numberOfTicks = 5}

    this.ticks = this.scale.ticks(numberOfTicks)
    // console.log('************', { dimension: this.dimension, dimensions: this.dimensions, ticks: this.ticks, numberOfTicks})
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateTicks()
  }
}
