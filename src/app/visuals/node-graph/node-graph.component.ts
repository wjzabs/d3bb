import { Component } from '@angular/core';
import APP_CONFIG from '../../app.config';
import { Node, Link } from '../../d3';
import { GraphComponent } from '../graph/graph.component';

@Component({
  selector: 'app-node-graph',
  standalone: true,
  imports: [GraphComponent],
  templateUrl: './node-graph.component.html',
  styleUrl: './node-graph.component.css'
})
export class NodeGraphComponent {
  nodes: Node[] = [];
  links: Link[] = [];

  constructor() {
    const N = APP_CONFIG.N,
          getIndex = (number: number) => number - 1;

    /** constructing the nodes array */
    for (let i = 1; i <= N; i++) {
      this.nodes.push(new Node(i));
    }

    for (let i = 1; i <= N; i++) {
      for (let m = 2; i * m <= N; m++) {
        /** increasing connections toll on connecting nodes */
        this.nodes[getIndex(i)].linkCount++;
        this.nodes[getIndex(i * m)].linkCount++;

        /** connecting the nodes before starting the simulation */
        this.links.push(new Link(i, i * m));
      }
    }
  }
}
