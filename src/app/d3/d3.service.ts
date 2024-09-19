import { Injectable, EventEmitter, ElementRef } from '@angular/core';
import { Node, Link, ForceDirectedGraph } from './models';
import * as d3 from 'd3';

@Injectable()
export class D3Service {
  /** This service will provide methods to enable user interaction with elements
    * while maintaining the d3 simulations physics
    */
  constructor() { }

  // this.d3Service.applyZoomableBehaviour(this.zoomableOf, this._element.nativeElement);
  /** A method to bind a pan and zoom behaviour to an svg element */
  applyZoomableBehaviour(svgElement: any, containerElement: any) {
    let svg: any;
    let container: any;
    let zoomed: any;
    let zoom:any;

    svg = d3.select(svgElement);
    container = d3.select(containerElement);

    zoomed = (event: any) => {
      const transform = event.transform;
      container.attr('transform', 'translate(' + transform.x + ',' + transform.y + ') scale(' + transform.k + ')');
    }

    zoom = d3.zoom().on('zoom', zoomed);
    svg.call(zoom);
  }

  /** A method to bind a draggable behaviour to an svg element */
  applyDraggableBehaviour(element: any, node: Node, graph: ForceDirectedGraph) {
    const d3element = d3.select(element);

    const started = (event: any) => {
      /** Preventing propagation of dragstart to parent elements */
      event.sourceEvent.stopPropagation();

      if (!event.active) {
        graph.simulation.alphaTarget(0.3).restart();
      }

      const dragged = (event: any) => {
        // added event to parameter list to resolve drag/drop issue
        node.fx = event.x;
        node.fy = event.y;
      }

      const ended = (event: any) => {
        if (!event.active) {
          graph.simulation.alphaTarget(0);
        }

        node.fx = null;
        node.fy = null;
      }

      event.on('drag', dragged).on('end', ended);
    }

    d3element.call(d3.drag()
      .on('start', started));
  }

  /** The interactable graph we will simulate in this article
  * This method does not interact with the document, purely physical calculations with d3
  */
  getForceDirectedGraph(nodes: Node[], links: Link[], options: { width: number, height: number }) {
    const sg = new ForceDirectedGraph(nodes, links, options);
    return sg;
  }
}
