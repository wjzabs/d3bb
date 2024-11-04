import { NgFor, NgTemplateOutlet } from '@angular/common'
import { Component, Input, SimpleChanges, OnChanges } from '@angular/core'

@Component({
  selector: '[appGradient]',
  standalone: true,
  imports: [NgFor, NgTemplateOutlet],
  template: `
    <svg:linearGradient
      [id]="id"
      gradientUnits="userSpaceOnUse"
      spreadMethod="pad"
      [attr.x1]="x1"
      [attr.x2]="x2"
      [attr.y1]="y1"
      [attr.y2]="y2">

      <svg:stop
        [attr.offset]="'0%'"
        [attr.stop-color]="'rgb(226, 222, 243)'">
      </svg:stop>
      <svg:stop
        [attr.offset]="'100%'"
        [attr.stop-color]="'#f8f9fa'">
      </svg:stop>
    </svg:linearGradient>
  `,
})
export class GradientComponent implements OnChanges {
  @Input() id: string = ''
  @Input() colors: string[] = []
  @Input() x1?: string[]
  @Input() x2?: string[]
  @Input() y1?: string[]
  @Input() y2?: string[]
  public colorStops: any[] = []

//   <svg:stop
//   *ngFor="let stopx of colorStops"
//   [attr.offset]="stopx.offset"
//   [attr.stop-color]="stopx.color">
// </svg:stop>

  ngOnChanges(changes: SimpleChanges): void {
    this.updateColorStops()
  }

  updateColorStops() {
    this.colorStops = this.colors.map((color, index) => ({
      offset: `${index * 100 / (this.colors.length - 1)}%`,
      color: color,
    }))

    // console.log('this.colorStops', this.colorStops)
  }
}
