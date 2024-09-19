import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { D3Service } from '../d3.service';

@Directive({
    selector: '[zoomableOf]',
    standalone: true
})
export class ZoomableDirective implements OnInit {
    // @Input('zoomableOf') zoomableOf!: ElementRef;
    @Input('zoomableOf') zoomableOf!: HTMLElement;
    constructor(private d3Service: D3Service, private _element: ElementRef) {}

    ngOnInit() {
        this.d3Service.applyZoomableBehaviour(this.zoomableOf, this._element.nativeElement);
    }
}

