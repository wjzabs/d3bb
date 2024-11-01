import { Component, ElementRef, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-abblabh',
  templateUrl: './abblabh.component.html',
  styleUrl: './abblabh.component.scss'
})
export class AbblabhComponent implements OnInit {

  // look for the comment " // error on this line" for issues

  data: any;

  constructor(
    private element: ElementRef
  ) {}

  async ngOnInit() {

  }

  async showChord() {
    this.chord(this.element.nativeElement);
    //https://observablehq.com/@d3/chord-diagram/2
  }

  async showUber() {
    this.chordUber(this.element.nativeElement);
    //https://bost.ocks.org/mike/uberdata/
  }

  chord(parentNode: any) {
        
    this.data = Object.assign([
      [11975,  5871, 8916, 2868],
      [ 1951, 10048, 2060, 6171],
      [ 8010, 16145, 8090, 8045],
      [ 1013,   990,  940, 6907]
    ], {
      names: ["black", "blond", "brown", "red"],
      colors: ["#000000", "#ffdd89", "#957244", "#f26223"]
    })
      const width = 640;
      const height = width;
      const outerRadius = Math.min(width, height) * 0.5 - 30;
      const innerRadius = outerRadius - 20;
      const {names, colors} = this.data;
      const sum = d3.sum(this.data.flat());
      const tickStep = d3.tickStep(0, sum, 100);
      const tickStepMajor = d3.tickStep(0, sum, 20);
      const formatValue = d3.formatPrefix(",.0", tickStep);
    
      const chord = d3.chord()
          .padAngle(20 / innerRadius)
          .sortSubgroups(d3.descending);
    
      const arc = d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius);
    
      const ribbon = d3.ribbon()
          .radius(innerRadius);
    
          console.log('this.data', this.data)

      const svg = d3.create("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [-width / 2, -height / 2, width, height])
          .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");
    
        console.log({svg})

      const chords = chord(this.data);
    
      const group = svg.append("g")
        .selectAll()
        .data(chords.groups)
        .join("g");
    
      group.append("path")
          .attr("fill", d => colors[d.index])
          // .attr("d", arc) // error on this line
        .append("title")
          .text(d => `${d.value.toLocaleString("en-US")} ${names[d.index]}`);
    
      const groupTick = group.append("g")
        .selectAll()
        .data(d => this.groupTicks(d, tickStep))
        .join("g")
          .attr("transform", d => `rotate(${d.angle * 180 / Math.PI - 90}) translate(${outerRadius},0)`);
    
      groupTick.append("line")
          .attr("stroke", "currentColor")
          .attr("x2", 6);
    
      groupTick
        .filter(d => d.value % tickStepMajor === 0)
        .append("text")
          .attr("x", 8)
          .attr("dy", ".35em")
          .attr("transform", d => d.angle > Math.PI ? "rotate(180) translate(-16)" : null)
          .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
          .text(d => formatValue(d.value));
    
      svg.append("g")
          .attr("fill-opacity", 0.7)
        .selectAll()
        .data(chords)
        .join("path")
          // .attr("d", ribbon) // error on this line
          .attr("fill", d => colors[d.target.index])
          .attr("stroke", "white")
        .append("title")
          .text(d => `${d.source.value.toLocaleString("en-US")} ${names[d.source.index]} → ${names[d.target.index]}${d.source.index !== d.target.index ? `\n${d.target.value.toLocaleString("en-US")} ${names[d.target.index]} → ${names[d.source.index]}` : ``}`);
    
      // return svg.node();
      console.log('chord', svg)
      parentNode.appendChild(svg.node())
  }


  groupTicks(d: any, step:any) {
    const k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, step).map(value => {
      return {value: value, angle: value * k + d.startAngle};
    });
  }


  async chordUber(parentNode: any) {

    
  let cities: any;
  let matrix: any;

  await d3.csv('assets/cities.json').then((data: any) => {
    cities = data;
    console.log('cities', {data})
  })

  await d3.json('assets/matrix.json').then((data: any) => {
    matrix = data;
    console.log('matrix', {data})
  })

  let width = 720,
      height = 720,
      outerRadius = Math.min(width, height) / 2 - 10,
      innerRadius = outerRadius - 24;

  let formatPercent = d3.format(".1%");

  // let arc = d3.svg.arc() // error on this line
  let arc = (d3.svg as any).arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

  // let layout = d3.layout.chord() // error on this line
  let layout = (d3 as any).layout.chord()
      .padding(.04)
      .sortSubgroups(d3.descending)
      .sortChords(d3.ascending);

  // let path = d3.svg.chord() // error on this line
  let path = (d3.svg as any).chord()
      .radius(innerRadius);

  let svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("id", "circle")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  svg.append("circle")
      .attr("r", outerRadius);

  // queue()
  //     .defer(d3.csv, "cities.csv")
  //     .defer(d3.json, "matrix.json")
  //     .await(ready);

    // Compute the chord layout.
    layout.matrix(matrix);

    // Add a group per neighborhood.
    let group = svg.selectAll(".group")
        .data(layout.groups)
      .enter().append("g")
        .attr("class", "group")
        .on("mouseover", mouseover);

    // Add a mouseover title.
    group.append("title").text(function(d:any, i:any) {
      return cities[i].name + ": " + formatPercent(d.value) + " of origins";
    });

    // Add the group arc.
    let groupPath = group.append("path")
        .attr("id", function(d, i) { return "group" + i; })
        .attr("d", arc)
        .style("fill", function(d, i) { return cities[i].color; });

    // Add a text label.
    let groupText = group.append("text")
        .attr("x", 6)
        .attr("dy", 15);

    groupText.append("textPath")
        .attr("xlink:href", function(d, i) { return "#group" + i; })
        .text(function(d, i) { return cities[i].name; });

    // Remove the labels that don't fit. :(
    // groupText.filter(function(d: any, i: any) { 
    // // error on this line - next line has an issue with groupPath[0]
    //   return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength() 
    // })
    //     .remove();

    // Add the chords.
    let chord = svg.selectAll(".chord")
        .data(layout.chords)
      .enter().append("path")
        .attr("class", "chord")
        .style("fill", function(d:any) { return cities[d.source.index].color; })
        .attr("d", path);

    // Add an elaborate mouseover title for each chord.
    chord.append("title").text(function(d: any) {
      return cities[d.source.index].name
          + " → " + cities[d.target.index].name
          + ": " + formatPercent(d.source.value)
          + "\n" + cities[d.target.index].name
          + " → " + cities[d.source.index].name
          + ": " + formatPercent(d.target.value);
    });

    function mouseover(d: any, i: any) {
      chord.classed("fade", function(p: any) {
        return p.source.index != i
            && p.target.index != i;
      });
    }

    console.log('chordUber', svg)
    parentNode.appendChild(svg.node())
  }

}
