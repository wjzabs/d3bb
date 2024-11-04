import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import * as d3 from "d3"
import { AccessorType } from '../../utils/types'
import { curveMonotoneSolver } from '../../curveMonotoneSolver'

// [ngClass]="type"

@Component({
  selector: '[appLine]',
  standalone: true,
  imports: [],
  template: `
    <svg:path
      [attr.class]="type" 
      [attr.d]="lineString"
      [style.fill]="fill">
    </svg:path>
  `,
  styleUrls: ['./line.component.css']
})
export class LineComponent implements OnChanges {
  @Input() type: "area" | "line" = "line"
  @Input() data: any[] = [] // object[]
  @Input() xAccessor!: AccessorType
  @Input() yAccessor!: AccessorType
  @Input() y0Accessor?: AccessorType
  // @Input() interpolation: curveMonotoneSolver //  any; // d3.curveMonotoneX
  // @Input() interpolation?: Function = d3.curveMonotoneX
  @Input() fill?: string
  public lineString: string = ""

  public curveMonotoneSolver!: curveMonotoneSolver

  updateLineString(): void {
    let lineGenerator: any;

    if (this.type === 'line') {
      lineGenerator = d3[this.type]()
      .x(this.xAccessor)
      .y(this.yAccessor)
      // .curve(this.interpolation)
    }

    if (this.type === 'area') {
      lineGenerator = d3[this.type]()
      .x(this.xAccessor)
      .y(this.yAccessor)
      // .curve(this.interpolation)

      lineGenerator
        .y0(this.y0Accessor)
        .y1(this.yAccessor)
    }


    if (this.type == "area") {
      // alert ('need to address lineGenerator for area')
      // lineGenerator
      //   .y0(this.y0Accessor)
      //   .y1(this.yAccessor)
    }

    this.lineString = lineGenerator(this.data) || ''
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateLineString()
  }

}
