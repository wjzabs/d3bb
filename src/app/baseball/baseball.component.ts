import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-baseball',
  standalone: true,
  imports: [],
  templateUrl: './baseball.component.html',
  styleUrl: './baseball.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class BaseballComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    let that = this;

    d3.csv("assets/Baseball.csv", (d: any) => {
      // console.log(data)
        d.y = +d["runs86"];
        d.x = +d["atbat86"];
        d.r = +d["homer86"];
        d.xa = 0;
        d.ya = 0;
        d.xaa = 0;
        d.yaa = 0;
      return d;
    }).then((data:stats[]) => {
      data.sort(function (a: any, b:any) { return b.r - a.r; });
      that.createChart(data);
      console.log(data)
    }).catch (e => console.error(e))  
  }



  createChart(data: stats[]) {
    let that = this;

    let margin = { top: 30, right: 50, bottom: 40, left: 50 };
    let width = 960 - margin.left - margin.right;
    let height = 500 - margin.top - margin.bottom;

    // let svg = d3.select("body")
    let svg = d3.select("#baseball")

      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    // let zoomed = function () {
    //   svg.attr("transform", d3.event.transform);
    //   console.log(svg)
    // }

    let view = svg.append("rect")
      .attr("class", "view")
      .attr("x", 0.5)
      .attr("y", 0.5)
      .attr("width", width - 1)
      .attr("height", height - 1)
      .style("fill", "none")
      .style("pointer-events", "all")
      // .call(d3.zoom()
      //   .scaleExtent([1 / 2, 10])
      //   .on("zoom", zoomed));


    let xscale = d3.scaleLinear()
      .domain([0, 800])
      .range([0, width]);

    let yscale = d3.scaleLinear()
      .range([height, 0]);

    let radius = d3.scaleSqrt()
      .range([2, 8]);

    let xAxis = d3.axisBottom(xscale).tickSize(-height)
    // let xAxis = d3.axisBottom()
    //   .tickSize(-height)
    //   .scale(xscale);

    let yAxis = d3.axisLeft(yscale).tickSize(-width)
    // let yAxis = d3.axisLeft()
    //   .tickSize(-width)
    //   .scale(yscale)

    // let color = d3.scaleCategory20();
    let color = d3.scaleOrdinal(d3.schemeCategory10);

    // https://snyk.io/advisor/npm-package/d3/functions/d3.extent
    // const yDomain = d3.extent(data, d => d.y);

    console.log({y: (d3.extent(data, (d:stats) => d.y))})
    // yscale.domain(d3.extent(data, (d:stats) => d.y)).nice();
    yscale.domain([0, 130])

    // yscale.domain(d3.extent(data, function (d) {
    //   return d.y;
    // })).nice();

    console.log({r: (d3.extent(data, (d:stats) => d.r))})
    // radius.domain(d3.extent(data, (d:stats) => d.r)).nice();
    radius.domain([0, 40])

    // radius.domain(d3.extent(data: any[], function (d) {
    //   return d.r;
    // })).nice();

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis")
      .call(xAxis);

    svg.append("g")
      .attr("transform", "translate(0,0)")
      .attr("class", "y axis")
      .call(yAxis);

    let group = svg.selectAll("g.bubble")
      .data(data)
      .enter().append("g")
      .attr("class", "bubble")
      .attr("transform", function (d) {
        return "translate(" + xscale(d.x) + "," + yscale(d.y) + ")"
      });

    group
      .append("circle")
      .attr("r", function (d:stats) { return radius(d.r); })
      .style("fill", (d:stats) => { return color( d["team86"]) })
      .on("mouseover", (event: any, d:stats) => {
        // console.log(event, d);
        let player = d["name1"] + " " + d["name2"];
        d3.selectAll(".mytooltip")
          .html("<div>Player:" + player + "<br/><br/>"
          + "<span>Runs:" + d["runs86"] + "</span>" + "<br/>"
          + "<span>At-Bats:" + d["atbat86"] + "</span>" + "<br/>"
          + "<span>Homers:" + d["homer86"] + "</span>" + "<br/>")
          .style("left", function (d) { return event.pageX + "px" })
          .style("top", function (d) { return (event.pageY - 120) + "px" })
          .transition().duration(200)
          .style("opacity", .9);
      })
      .on("mouseout", (event: any, d:stats) => {
        // console.log({event, d})
        d3.selectAll(".mytooltip")
          .transition().duration(600)
          .style("opacity", 0);
      })

    group
      .append("text")
      .attr("x", function (d) { return radius(d.r); })
      .attr("alignment-baseline", "middle")
      .text(function (d) {
        return d["name1"] + " " + d["name2"];
      });

    // group
    //   .call(d3.drag()
    //     .on("start", function (d: any, i) {
    //       d3.select(this).raise().classed("drag-active", true);
    //       d.xm0 = d3.event.x;
    //       d.ym0 = d3.event.y;
    //       d.xm1 = d3.event.x;
    //       d.ym1 = d3.event.y;
    //     }) // this.dragstarted)
    //     .on("drag", function (d: any, i) {
    //       console.log('drag started', d.xa, d.ya, d3.event);
    //       d.xm1 = d3.event.x;
    //       d.ym1 = d3.event.y;
    //       d.xa = d.xm1 - d.xm0;
    //       d.ya = d.ym1 - d.ym0;
    //       d3.selectAll(".drag-active")
    //         .attr("transform", function (d: any, i) {
    //           return "translate(" + (xscale(d.x) + d.xaa + d.xa) + "," + (yscale(d.y) + d.yaa + d.ya) + ")"
    //         })
    //     }) // this.dragged)
    //     .on("end", function (d: any, i) {
    //       console.log('drag ended', d.xa, d.ya, d3.event)
    //       d.xaa = d.xaa + d.xa;
    //       d.yaa = d.yaa + d.ya;
    //       d3.select(this).classed("drag-active", false);
    //     }) // this.dragended))
    //   )

    svg.append("text")
      .attr("x", 6)
      .attr("y", -2)
      .attr("class", "label")
      .text("Runs (86)");

    svg.append("text")
      .attr("x", width - 2)
      .attr("y", height - 6)
      .attr("text-anchor", "end")
      .attr("class", "label")
      .text("At Bats (86)");

    let legend = svg.selectAll(".legend")
      .data(color.domain())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) { return "translate(2," + i * 14 + ")"; });

    legend.append("rect")
      .attr("x", width)
      .attr("width", 12)
      .attr("height", 12)
      .style("fill", color);

    legend.append("text")
      .attr("x", width + 16)
      .attr("y", 6)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(function (d) { return d; });

    legend.on("mouseover", function (type) {
      d3.selectAll(".legend")
        .style("opacity", 0.1);
      d3.select(this)
        .style("opacity", 1);
      d3.selectAll(".bubble")
        .style("opacity", 0.1)
        .filter(function (d:any) { return d["team86"] == type; })
        .style("opacity", 1);
    })
      .on("mouseout", function (type) {
        d3.selectAll(".legend")
          .style("opacity", 1);
        d3.selectAll(".bubble")
          .style("opacity", 1);
      });
  }
}

export interface stats {

  row: number;
  name1: string;
  name2: string;
  atbat86: number;
  hits86: number;
  homer86: number;
  runs86: number;
  rbi86: number;
  walks86: number;
  years: number;
  atbat: number;
  hits: number;
  homeruns: number;
  runs: number;
  rbi: number;
  walks: number;
  league86: string;
  div86: string;
  team86: string;
  posit86: string;
  outs86: number;
  assist86: number;
  error86: number;
  sal87: number;
  league87 :string;
  team87: string;
  y: number;
  x: number;
  r: number;
  xa: number;
  ya: number;
  xaa: number;
  yaa: number;
}
