import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Link, Node } from '../../../d3';


@Component({
  selector: '[linkVisual]',
  standalone: true,
  imports: [],
  template: `
    <svg:line
        class="link"
        [attr.x1]="sourceX"
        [attr.y1]="sourceY"
        [attr.x2]="targetX"
        [attr.y2]="targetY"
    ></svg:line>
  `,
  styleUrls: ['./link-visual.component.css']
})
export class LinkVisualComponent implements OnInit, OnChanges {

  @Input('linkVisual') link?: Link;

  sourceX = 0;
  sourceY = 0;
  targetX = 0;
  targetY = 0;

  ngOnInit() {
    this.redraw()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.redraw()
  }

  redraw() {
    if(this.link?.source instanceof Node && this.link.source.x) {
      this.sourceX = this.link.source.x;
    }
    if(this.link?.source instanceof Node && this.link.source.y) {
      this.sourceY = this.link.source.y;
    }
    if(this.link?.target instanceof Node && this.link.target.x) {
      this.targetX = this.link.target.x;
    }
    if(this.link?.target instanceof Node && this.link.target.y) {
      this.targetX = this.link.target.y;
    }
  }
}
