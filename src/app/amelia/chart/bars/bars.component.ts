import { Component, Input } from '@angular/core'
import { useAccessor } from '../utils'
import { AccessorType } from '../../utils/types'
import { NgFor, NgTemplateOutlet } from '@angular/common'

// [attr.x]="useAccessor(xAccessor, bar, $index)"
// [attr.y]="useAccessor(yAccessor, bar, $index)"
// [attr.width]="max(useAccessor(widthAccessor, bar, $index), 0)"
// [attr.height]="max(useAccessor(heightAccessor, bar, $index), 0)"

@Component({
  selector: '[appBars]',
  template: `
    <svg:rect
      *ngFor="let bar of data; trackBy: keyAccessor"
      [attr.x]="useAccessor(xAccessor, bar)"
      [attr.y]="useAccessor(yAccessor, bar)"
      [attr.width]="max(useAccessor(widthAccessor, bar), 0)"
      [attr.height]="max(useAccessor(heightAccessor, bar), 0)"
      [attr.fill]="fill || '#9980FA'">
    </svg:rect>
  `,
  standalone: true,
  imports: [NgFor, NgTemplateOutlet],
  styleUrls: ['./bars.component.css']
})
export class BarsComponent {
  @Input() data: any[] = [] // object[]
  @Input() public keyAccessor!: AccessorType
  @Input() public xAccessor!: AccessorType
  @Input() public yAccessor!: AccessorType
  @Input() public widthAccessor!: AccessorType
  @Input() public heightAccessor!: AccessorType
  @Input() public fill?: string = ''
  public useAccessor: Function = useAccessor
  public max = Math.max
}
