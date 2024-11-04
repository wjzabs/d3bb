import { Component, Input, SimpleChanges, OnChanges } from '@angular/core'
import * as d3 from "d3"
import { DimensionsType, ScaleType } from '../../utils/types'
import { FormsModule } from '@angular/forms'
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
  @Input() public scale!: any // ScaleType
  @Input() label!: string
  @Input() formatTick: (value: any) => (string|number) = d3.format(",")
  public ticks!: Function[]

  updateTicks() {
    if (!this.dimensions || !this.scale) return

    const numberOfTicks = this.dimension == "x"
      ? this.dimensions.boundedWidth || 0 < 600
        ? this.dimensions.boundedWidth || 0 / 100
        : this.dimensions.boundedWidth || 0 / 250
      : this.dimensions.boundedHeight || 0 / 70

    this.ticks = this.scale.ticks(numberOfTicks)
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateTicks()
  }
}
