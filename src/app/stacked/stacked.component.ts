import {
    AfterViewInit,
    Component,
    Input,
    OnInit,
    ViewEncapsulation
  } from "@angular/core";
//   import { DivergingBarModel } from "./models/charts.model";
  import { D3Service } from "./services/d3.service";
  
  // https://stackblitz.com/edit/angular-d3-js-bar-diverging-bar?file=src%2Fapp%2Fapp.component.ts,package.json

  
export interface StackedDataItem {
    position: number,
    name: string,
    category: string,
    bar: string,
    value: number,
    color?: string
}

  @Component({
    selector: 'app-stacked',
    standalone: true,
    imports: [],
    templateUrl: './stacked.component.html',
    styleUrl: './stacked.component.scss',
    encapsulation: ViewEncapsulation.None
  })
  export class StackedComponent implements AfterViewInit {
    // @Input("data") private data: DivergingBarModel[] = [];
    @Input("data") private data: StackedDataItem[] = [];
    
    @Input("legendTitle") legendTitle: string = 'legendTitle';
    @Input("legendSubtitle") legendSubtitle: string = 'legendSubtitle';
    public chartId: string;
    constructor(private d3: D3Service) {
      this.chartId = this.d3.generateId(5);

    // {name: 'Shamir', category: 'SHAMIR', value: 0.11728827117288271}

    //   this.data = [
    //     { position: 0, name: "Pie 1", value: 10 },
    //     { position: 1, name: "Pie 2", value: 20 },
    //     { position: 2, name: "Pie 3", value: 30 },
    //     { position: 3, name: "Pie 4", value: 40 },
    //     { position: 4, name: "Pie 5", value: -50 },
    //     { position: 5, name: "Pie 6", value: 60 },
    //     { position: 6, name: "Pie 7", value: 70 },
    //     { position: 7, name: "Pie 8", value: 80 },
    //     { position: 8, name: "Pie 9", value: 90 },
    //     { position: 9, name: "Pie 10", value: -100 },
    //     { position: 10, name: "Pie 11", value: 110 },
    //     { position: 11, name: "Pie 12", value: -120 },
    //     { position: 12, name: "Pie 13", value: 130 },
    //     { position: 13, name: "Pie 14", value: 140 },
    //     { position: 14, name: "Pie 15", value: 150 },
    //     { position: 15, name: "Pie 16", value: 100 },
    //     { position: 16, name: "Pie 16", value: 60 },
    //     { position: 17, name: "Pie 16", value: -60 }
    //   ];
     
    }
  
    async ngAfterViewInit() {
      await this.createDiverginChart();
    }
  
    async createDiverginChart() {


  const categories = await <Promise<any[]>>this.d3.d3.json("assets/stacks-categories.json")
  console.table(categories)
  const barsData = await <Promise<any[]>>this.d3.d3.json("assets/stacks-bars.json")
  console.table(barsData)
    const dataset = this.stacks_generate_dataset(categories, barsData)
  console.table(dataset)

  const results = this.stacks_get_data(categories[0].CATEGORY_CODE, categories, dataset)
  this.data = results.data
  const options = results.options

  const signs = new Map([].concat(
    options.negatives.map((d:any) => [d, -1]),
    options.positives.map((d:any) => [d, +1])
  ));

  console.log(signs)

//   const bias = this.d3.d3.sort(
//     this.d3.d3.rollup(this.data, v => this.d3.d3.sum(v, (d:any) => {return d.value * Math.min(0, (signs.get(d.category) as number)) }), (d:any) => d.name),
//     ([, a]) => a
//   );

this.data.forEach((d:StackedDataItem) => {
    // console.log({d, sign: signs.get(d.category), value: d.value, calc: Math.abs(d.value) * (signs.get(d.category) as number)})
    d.value = Math.abs(d.value) * (signs.get(d.category) as number)
})

      var margin = { top: 40, right: 50, bottom: 60, left: 50 };
  
      var width = 960 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;
  
      var svg = this.d3.d3
        .select("div#" + this.chartId)
        .append("svg")
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        // Responsive with viewbox
        .attr(
          "viewBox",
          `0 0 ${width + margin.left + margin.right} ${height +
            margin.top +
            margin.bottom}`
        )
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
      // Config
      var cfg = {
        labelMargin: 5,
        xAxisMargin: 10,
        legendRightMargin: 0
      };
  
      var x = this.d3.d3.scaleLinear().range([0, width]);
  
      var colour = this.d3.d3.scaleSequential(this.d3.d3.interpolatePRGn);
  
      var y = this.d3.d3
        .scaleBand()
        .range([height, 0])
        .padding(0.1);
  
    //   function parse(d) {
    //     d.position = +d.position;
    //     d.value = +d.value;
    //     return d;
    //   }
  
      /**
       * Inserting legends on the top right corner
       */
      if (this.legendTitle || this.legendSubtitle) {
        var legend = svg.append("g").attr("class", "legend");
  
        if (this.legendTitle) {
          legend
            .append("text")
            .attr("x", width - cfg.legendRightMargin)
            .attr("text-anchor", "end")
            .text(this.legendTitle);
        }
  
        if (this.legendSubtitle) {
          legend
            .append("text")
            .attr("x", width - cfg.legendRightMargin)
            .attr("y", 20)
            .attr("text-anchor", "end")
            .style("opacity", 0.5)
            .text(this.legendSubtitle);
        }
      }
  
      y.domain(
        this.data.map(function(d) {
          return d.name;
        })
      );

      // https://stackoverflow.com/questions/55963129/error-type-number-undefined-is-not-assignable-to-type-number-valueof

      // https://stackoverflow.com/questions/29493843/finding-d3-extent-of-multiple-values-in-object-array
      x.domain(
        this.d3.d3.extent(this.data.map((x:any) => {return x.value})) as [number,number]
        // extent
        // this.d3.d3.extent(this.data, function(d) {
        // return d.value;
        // })          
      );
  
      var max = this.d3.d3.max(this.data, function(d) {
        return d.value;
      });
      colour.domain([-(max || 0), max || 0]);
    //   colour.domain([-max, max]);
  
      var yAxis = svg
        .append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + x(0) + ",0)")
        .append("line")
        .attr("y1", 0)
        .attr("y2", height);
  
      var xAxis = svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + (height + cfg.xAxisMargin) + ")")
        .call(this.d3.d3.axisBottom(x).tickSizeOuter(0));
  
      var bars = svg.append("g").attr("class", "bars");
  
      const formatValue = ((format) => (x:number) => format(Math.abs(x)))(this.d3.d3.format(".0%"));

      bars
        .selectAll("rect")
        .data(this.data)
        .enter()
        .append("rect")
        .attr("class", "annual-growth")
        .attr("x", function(d) {
          return x(Math.min(0, d.value));
        })
        .attr("y", (d:any) => { return y(d.name) as number })
        // .attr("y", function(d) {
        //   return y(d.name);
        // })
        .attr("height", y.bandwidth())
        .attr("width", function(d) {
          return Math.abs(x(d.value) - x(0));
        })
        .style("fill", function(d) {
          return d.color ? d.color : colour(d.value);
        })
        .append("title")
        // .text(({category, data: [name, value]}) => `${name}
        // ${formatValue(value.get(category))} ${category}`);
        .text(({category, name, bar, value}) => `${name}
        ${formatValue(value)} ${bar}`);
  
      var labels = svg.append("g").attr("class", "labels");
  
      labels
        .selectAll("text")
        .data(this.data)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", x(0))
        .attr("y", (d:any) => { return y(d.name) as number })
        .attr("dx", function(d) {
          return d.value < 0 ? cfg.labelMargin : -cfg.labelMargin;
        })
        .attr("dy", y.bandwidth())
        .attr("text-anchor", function(d) {
          return d.value < 0 ? "start" : "end";
        })
        .text(function(d) {
          return d.name;
        });
      /* example of selective fill
        .style("fill", function (d) {
          if (d.name == "European Union") {
            return "blue";
          }
        })*/
    }



    stacks_generate_dataset(categories: any[], bars: any[]): any[] {
        let dataset = <any>[]
        
        categories.forEach((c:any) => {
      
          let bd = <any>[]
          bars.forEach((b:any) => {
            let v = +(1000 * Math.random()).toFixed(0)
            // if (v<100) {v = 0}
            let d = {CATEGORY_CODE: c.CATEGORY_CODE, BAR_CODE: b.BAR_CODE, VALUE: v, PCT: 0}
            bd.push(d)
          })
      
          let t = bd.reduce(function (acc:number, obj:any) { return acc + obj.VALUE }, 0);
          // console.log({bd, c, t})
          bd.forEach((b:any) => {
            let v = b.VALUE
            b.PCT = +(100 * v/t).toFixed(2)
          })
      
          dataset.push (...bd)
        }) 
        
        return dataset
      
      }

      

      
stacks_get_data(selectedCATEGORY_CODE: string, categories: any[], dataset: any[]): any {
    let catgys = <any>{};
    categories.forEach((c:any) => {
      catgys[c.CATEGORY_CODE] = c.CATEGORY_DESC
    })
    
    let selectedCATEGORY = categories.find((x:any) => {return x.CATEGORY_CODE === selectedCATEGORY_CODE})
    // const catgys = {
    //   "pants-fire": "Pants on fire!",
    //   "false": "False",
    //   "mostly-false": "Mostly false",
    //   "barely-true": "Mostly false", // recategorized
    //   "half-true": "Half true",
    //   "mostly-true": "Mostly true",
    //   "true": "True"
    // };
  
    // const data = d3.csvParse(await FileAttachment("politifact.csv").text(), ({speaker: name, ruling: category, count: value}) => categories[category] ? {name, category: categories[category], value: +value} : null);
  
    let data: any[] = []
    dataset.forEach((d:any) => {
      let c = categories.find((x:any) => {return x.CATEGORY_CODE === d.CATEGORY_CODE})
      let o = {name: c.CATEGORY_DESC, category: d.CATEGORY_CODE, bar: d.BAR_CODE, value: +d.PCT}
      data.push(o)
    })
  
  
  
    // Normalize absolute values to percentage.
    this.d3.d3.rollup(data, group => {
      const sum = this.d3.d3.sum(group, d => d.value);
      for (const d of group) d.value /= sum;
    }, d => d.name);
  
    // let result = Object.assign(data, {
    //   columns: ["speaker", "ruling", "count"],
    //   negative: "← Others",
    //   positive: selectedCATEGORY_CODE + " →",
    //   // negatives: ["Pants on fire!", "False", "Mostly false"],
    //   // positives: ["Half true", "Mostly true", "True"]
    //   negatives: [...categories
    //     .filter((x:any) => {return x.CATEGORY_CODE !== selectedCATEGORY_CODE})
    //     .map((x:any) => {return x.CATEGORY_DESC})],
    //   positives: [selectedCATEGORY.CATEGORY_DESC]
    // });
  
    let result = {data: Object.assign(data), options: {
      columns: ["name", "category", "value"],
      negative: "← Others",
      positive: selectedCATEGORY_CODE + " →",
      negatives: [...categories
        .filter((x:any) => {return x.CATEGORY_CODE !== selectedCATEGORY_CODE})
        .map((x:any) => {return x.CATEGORY_CODE})],
      positives: [selectedCATEGORY.CATEGORY_CODE]
    }};
  
    console.log({result})
    return result
  }

  
  }

  
  