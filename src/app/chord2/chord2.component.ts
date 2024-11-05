import { Component, OnInit, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-chord2',
  standalone: true,
  imports: [],
  templateUrl: './chord2.component.html',
  styleUrls: ['./chord2.component.scss']
})
export class Chord2Component implements OnInit {
  
  constructor(private element: ElementRef) {}

  ngOnInit(): void {
    
    this.hair();
  }

  async hair() {
    
    console.log('about to get hair')
    //const data = await d3.csv("assets/hair.csv");
    const dataX= await d3.json("assets/chorddata.json");
    let data: any[] = (dataX as any[]) || []
    let f1 = 'LENS_DESIGNER_CODE'
    let f2 = 'AR_COATING_GROUP_CODE'
        let f3 = 'JOBS'
    let mapCaption = new Map()
    mapCaption.set(f1,'Designer')
    mapCaption.set(f2,'AR Group')
    mapCaption.set(f3,'Jobs')
    
    let total = 0
    total = data.reduce((prev, curr) => { return prev += curr[f3]}, 0)
    console.log({total})

    let dataZ : any[] = []
    data.forEach(d => {
      let z1 = {'Field1' : f1 + ':' + d[f1], 'Field2' : f2 + ':' + d[f2], 'JOBS' : d['JOBS'], 'SLS' : d['SLS']}
      dataZ.push(z1)
    })
    data.forEach(d => {
      let z2 = {'Field1' : f2 + ':' + d[f2], 'Field2' : f1 + ':' + d[f1], 'JOBS' : d['JOBS'], 'SLS' : d['SLS']}
      dataZ.push(z2)
    })
    data = dataZ
    // data.forEach(d => {
    //   d[f1] = f1 + ':' + d[f1]
    //   d[f2] = f2 + ':' + d[f2]
    // })
    console.log({data})

    const designerTotalJobs = new Map();
    data.forEach(d => {
      if (d['Field1'].startsWith(f1)) {
        const designer = d['Field1'];
        designerTotalJobs.set(designer, (designerTotalJobs.get(designer) || 0) + d['JOBS']);
      }
    });

    //get the colors 
    //const names1 = Array.from(new Set(data.map(d => f1 + ':' + d[f1])));
    //const names2 = Array.from(new Set(data.map(d => f2 + ':' + d[f2])));

    const names1 = Array.from(new Set(data.filter(x => {return x['Field1'].indexOf(f1)===0}).map(d => d['Field1'])));
    const names2 = Array.from(new Set(data.filter(x => {return x['Field2'].indexOf(f2)===0}).map(d => d['Field2'])));

    // const names1 = Array.from(new Set(data.map(d => d['Field1'])));  
    // const names2 = Array.from(new Set(data.map(d => d['Field2'])));

    const names = [...names1, ...names2]
    console.log(names)
    const matrix = Array(names.length).fill(0).map(() => Array(names.length).fill(0));
    let mColor = new Map()
    
    names1.forEach(n => {
      if (n.indexOf(f1)===0) {mColor.set(n,"blue")}
    })

    names2.forEach(n => {
      if (n.indexOf(f2)===0) {mColor.set(n,"pink")}
    })

    data.forEach(d => {
      const sourceIndex = names.indexOf(d['Field1']);
      const targetIndex = names.indexOf(d['Field2']);
      matrix[sourceIndex][targetIndex] = +d[f3];
    });

    this.drawChordDiagram(matrix, names, mColor, mapCaption, total, designerTotalJobs, f1, f2, f3);
  }

  drawChordDiagram(matrix: number[][], names: string[], mColor: any, mapCaption: any, total: number, designerTotalJobs: Map<string, number>, f1: string, f2: string, f3: string): void {
    const width = 1000;
    const height = 1000;
    const outerRadius = Math.min(width, height) * 0.35;
    const innerRadius = outerRadius - 30;

  
    const color = d3.scaleOrdinal() 
    .domain(names) 
    .range([ 
      "#000000",  // black 
      "#ffdd89", // blonde 
      "#8b4513",// brown 
      "#d62728" // red 
    ]); 
  
    

  //layout of circle, with a space between each
    const chord = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const ribbon = d3.ribbon()
      .radius(innerRadius);

    const svg = d3.select(this.element.nativeElement)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
      .style("font", "10px sans-serif");

      svg.append("text")
      .attr("x", 0)
      .attr("y", -height / 2 + 30)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .text(`${mapCaption.get(f3)} by ${mapCaption.get(f1)} and ${mapCaption.get(f2)}`);

      svg.append("text")
      .attr("x", 0)
      .attr("y", -height / 2 + 70)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`Total ${mapCaption.get(f3)}: ${d3.format(",")(total)}`);

      const legend = svg.append("g")
      .attr("transform", `translate(${-(width / 2) + 20}, ${-height / 2 + 80})`);

    // Legend for f1 (blue)
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "blue");

    legend.append("text")
      .attr("x", 25)
      .attr("y", 12)
      .style("font-size", "14px")
      .text(mapCaption.get(f1));

    // Legend for f2 (pink)
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 25)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "pink");

    legend.append("text")
      .attr("x", 25)
      .attr("y", 37)
      .style("font-size", "14px")
      .text(mapCaption.get(f2));

    const chords = chord(matrix);

// new group for every color
    const group = svg.append("g")
      .selectAll("g")
      .data(chords.groups)
      .join("g");

      //outer arc for each color
      group.append("path")
      //.attr("fill", d => color(names[d.index]) as string)
      .attr("fill", d => mColor.get(names[d.index]) as string)
      .attr("stroke", d => d3.color(color(names[d.index]) as string)?.darker()?.toString() || "#000")
      .attr("d", arc as any)
      .append("title")
      .html(d => {
        const designer = names[d.index];
        const designerJobs = designerTotalJobs.get(designer) || 1; 
        const percentage = d3.format(".1%")(d.value / total); 
        return `<strong>${mapCaption.get(designer.split(':')[0])}</strong> ${designer.split(':')[1]}: <strong>${d3.format(",")(d.value)}</strong> ${mapCaption.get(f3)}, <strong>${percentage}</strong>`;
      });
      // .text(d => `${names[d.index]}: ${d.value}`);
      //.text(d => `${mapCaption.get(names[d.index].split(':')[0])} ${names[d.index].split(':')[1]}: ${d3.format(",.0f")(d.value)} ${mapCaption.get(f3)}, ${d3.format(",.0f")(100 * d.value / total)}%`);
      // Add labels to each segment (hair color)

      group.append("text")
      .attr("dy", ".35em")
      .attr("transform", d => {
        const angle = (d.startAngle + d.endAngle) / 2;
        return `
          rotate(${angle * 180 / Math.PI - 90})
          translate(${outerRadius + 10})
          ${angle > Math.PI ? "rotate(180)" : ""}
        `;
      })
      .attr("text-anchor", d => ((d.startAngle + d.endAngle) / 2 > Math.PI) ? "end" : null)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(d => names[d.index].split(':')[1]);

      const maxCount = d3.max(matrix.flat()) || 1;

      // Add the ribbons between segments to represent relationships
      const defs = svg.append("defs");
  chords.forEach((d, i) => {
    const gradientId = `gradient${i}`;
    const gradient = defs.append("linearGradient")
      .attr("id", gradientId)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", innerRadius * Math.cos((d.source.startAngle + d.source.endAngle) / 2 - Math.PI / 2))
      .attr("y1", innerRadius * Math.sin((d.source.startAngle + d.source.endAngle) / 2 - Math.PI / 2))
      .attr("x2", innerRadius * Math.cos((d.target.startAngle + d.target.endAngle) / 2 - Math.PI / 2))
      .attr("y2", innerRadius * Math.sin((d.target.startAngle + d.target.endAngle) / 2 - Math.PI / 2));

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color(names[d.source.index]) as string);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color(names[d.target.index]) as string);
  });

  // Add the ribbons with gradient fills
  svg.append("g")
    .attr("fill-opacity", 0.75)
    .selectAll("path")
    .data(chords)
    .join("path")
    .attr("d", ribbon as any)
    //.attr("fill", (d, i) => `url(#gradient${i})`)
    .style(
      "fill"
      , function(d) { return mColor.get(names[d.source.index]); })
    .attr("stroke", d => d3.color(color(names[d.source.index]) as string)?.darker()?.toString() || "#000")
    .style("opacity", d => Math.max(0.3, d.source.value / (d3.max(matrix.flat()) || 1)))
    .append("title")
    .html(d => {
      const sourceDesigner = names[d.source.index];
      const targetGroup = names[d.target.index];
      const designerJobs = designerTotalJobs.get(sourceDesigner) || 1;
      const percentage = d3.format(".1%")(d.source.value / designerJobs); // Designer-specific percentage for this ribbon
      return `<strong>${mapCaption.get(sourceDesigner.split(':')[0])}</strong> ${sourceDesigner.split(':')[1]} → <strong>${mapCaption.get(targetGroup.split(':')[0])}</strong> ${targetGroup.split(':')[1]}: <strong>${d3.format(",")(d.source.value)}</strong> ${mapCaption.get(f3)}, <strong>${percentage}</strong>`;
    });
    // .text(d => `${names[d.source.index]} → ${mapCaption.get(names[d.target.index])}): ${d3.format(",.0f")(d.source.value)}\n${names[d.target.index]} → ${names[d.source.index]}: ${d3.format(",.0f")(d.source.value)}`);
    //.text(d => `${mapCaption.get(names[d.source.index].split(':')[0])} ${names[d.source.index].split(':')[1]} → ${mapCaption.get(names[d.target.index].split(':')[0])} ${names[d.target.index].split(':')[1]}: ${d3.format(",.0f")(d.source.value)} ${mapCaption.get(f3)}, ${d3.format(",.0f")(100 * d.source.value / total)}%`);
    //.html((d:any) => `<span>hi <strong>Mom ${total}</strong></span>`);
  }
  
}

//each segment represents a different hair color
//reach ribbon represents the relationship between 2 colors
//thickness of the ribbon relates to count in CSV
//https://d3-graph-gallery.com/graph/chord_basic.html
//https://www.freshconsulting.com/insights/blog/d3-js-gradients-the-easy-way/

      // d3.csv('asset/hair.csv', function (error, data) {
      //   var mpr = chordMpr(data);

      //   mpr
      //     .addValuesToMap(f1)
      //     .setFilter(function (row, a, b) {
      //       return (row.has === a.name && row.prefers === b.name)
      //     })
      //     .setAccessor(function (recs, a, b) {
      //       if (!recs[0]) return 0;
      //       return +recs[0].count;
      //     });
      //   drawChords(mpr.getMatrix(), mpr.getMap());
      // });
      // //*******************************************************************
      // //  DRAW THE CHORD DIAGRAM
      // //*******************************************************************
      // function drawChords (matrix, mmap) {
      //   var w = 980, h = 800, r1 = h / 2, r0 = r1 - 100;

      //   var fill = d3.scale.ordinal()
      //       .domain(d3.range(4))
      //       .range(["#000000", "#FFDD89", "#957244", "#F26223"]);

      //   var chord = d3.layout.chord()
      //       .padding(.02)
      //       .sortSubgroups(d3.descending)
      //       .sortChords(d3.descending);

      //   var arc = d3.svg.arc()
      //       .innerRadius(r0)
      //       .outerRadius(r0 + 20);

      //   var svg = d3.select("body").append("svg:svg")
      //       .attr("width", w)
      //       .attr("height", h)
      //     .append("svg:g")
      //       .attr("id", "circle")
      //       .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

      //       svg.append("circle")
      //           .attr("r", r0 + 20);

      //   var rdr = chordRdr(matrix, mmap);
      //   chord.matrix(matrix);

      //   var g = svg.selectAll("g.group")
      //       .data(chord.groups())
      //     .enter().append("svg:g")
      //       .attr("class", "group")
      //       .on("mouseover", mouseover)
      //       .on("mouseout", function (d) { d3.select("#tooltip").style("visibility", "hidden") });

      //   g.append("svg:path")
      //       .style("stroke", "black")
      //       .style("fill", function(d) { return fill(d.index); })
      //       .attr("d", arc);

      //   g.append("svg:text")
      //       .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
      //       .attr("dy", ".35em")
      //       .style("font-family", "helvetica, arial, sans-serif")
      //       .style("font-size", "10px")
      //       .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      //       .attr("transform", function(d) {
      //         return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
      //             + "translate(" + (r0 + 26) + ")"
      //             + (d.angle > Math.PI ? "rotate(180)" : "");
      //       })
      //       .text(function(d) { return rdr(d).gname; });

      //     var chordPaths = svg.selectAll("path.chord")
      //           .data(chord.chords())
      //         .enter().append("svg:path")
      //           .attr("class", "chord")
      //           .style("stroke", function(d) { return d3.rgb(fill(d.target.index)).darker(); })
      //           .style("fill", function(d) { return fill(d.target.index); })
      //           .attr("d", d3.svg.chord().radius(r0))
      //           .on("mouseover", function (d) {
      //             d3.select("#tooltip")
      //               .style("visibility", "visible")
      //               .html(chordTip(rdr(d)))
      //               .style("top", function () { return (d3.event.pageY - 100)+"px"})
      //               .style("left", function () { return (d3.event.pageX - 100)+"px";})
      //           })
      //           .on("mouseout", function (d) { d3.select("#tooltip").style("visibility", "hidden") });

      //     function chordTip (d) {
      //       var p = d3.format(".2%"), q = d3.format(",.3r")
      //       return "Chord Info:<br/>"
      //         + p(d.svalue/d.stotal) + " (" + q(d.svalue) + ") of "
      //         + d.sname + " prefer " + d.tname
      //         + (d.sname === d.tname ? "": ("<br/>while...<br/>"
      //         + p(d.tvalue/d.ttotal) + " (" + q(d.tvalue) + ") of "
      //         + d.tname + " prefer " + d.sname))
      //     }

      //     function groupTip (d) {
      //       var p = d3.format(".1%"), q = d3.format(",.3r")
      //       return "Group Info:<br/>"
      //           + d.gname + " : " + q(d.gvalue) + "<br/>"
      //           + p(d.gvalue/d.mtotal) + " of Matrix Total (" + q(d.mtotal) + ")"
      //     }

      //     function mouseover(d, i) {
      //       d3.select("#tooltip")
      //         .style("visibility", "visible")
      //         .html(groupTip(rdr(d)))
      //         .style("top", function () { return (d3.event.pageY - 80)+"px"})
      //         .style("left", function () { return (d3.event.pageX - 130)+"px";})

      //       chordPaths.classed("fade", function(p) {
      //         return p.source.index != i
      //             && p.target.index != i;
      //       });
      //     }
      // }
  

