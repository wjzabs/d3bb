import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-choropleth',
  templateUrl: './choropleth.component.html',
  styleUrls: ['./choropleth.component.scss'],
})
export class ChoroplethComponent implements OnInit {
  private svg: any;
  private tooltip: any;

  ngOnInit(): void {
    this.createSvg();
    this.drawMap();
  }

  private createSvg(): void {
    this.svg = d3.select('#map')
      .append('g')
      .attr('transform', 'translate(0,0)');

    this.tooltip = d3.select('#tooltip');
  }

  private drawMap(): void {
    const width = 960;
    const height = 600;

// https://github.com/topojson/us-atlas/tree/master/img

    const projection = d3.geoAlbersUsa()
      .translate([width / 2, height / 2])
      .scale(1000);
      // .scale([1000]);
    const path = d3.geoPath().projection(projection);
    
    // d3.json('assets/counties-albers-10m').then((data: any) => {
    d3.json('assets/counties.json').then((data: any) => {
      this.svg.selectAll('path')
        .data(data.features)
        .enter().append('path')
        .attr('d', path)
        .attr('fill', '#ccc')
        .attr('stroke', '#fff')
        .on('mouseover', (event: any, d: any) => {
          this.tooltip.transition().duration(200).style('opacity', 0.9);
          this.tooltip.html(`County: ${d.properties.NAME}<br>Value: ${d.properties.density}`)
            .style('left', (event.pageX + 5) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
          this.tooltip.transition().duration(500).style('opacity', 0);
        });
    });

    console.log(this.svg)
  }
}
