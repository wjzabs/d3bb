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
    // position: number,
    CATEGORY_DESC: string,
    CATEGORY_CODE: string,
    BAR_CODE: string,
    BAR_DESC: string,
    VALUE: number,
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
    }
  
    async ngAfterViewInit() {
      await this.createDivergingChart();
    }
  
    async createDivergingChart() {

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
//     this.d3.d3.rollup(this.data, v => this.d3.d3.sum(v, (d:any) => {return d.VALUE * Math.min(0, (signs.get(d.category) as number)) }), (d:any) => d.name),
//     ([, a]) => a
//   );

this.data.forEach((d:StackedDataItem) => {
    d.VALUE = Math.abs(d.VALUE) * (signs.get(d.CATEGORY_CODE) as number)
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
          return d.CATEGORY_DESC;
        })
      );

      // https://stackoverflow.com/questions/55963129/error-type-number-undefined-is-not-assignable-to-type-number-valueof

      // https://stackoverflow.com/questions/29493843/finding-d3-extent-of-multiple-values-in-object-array
      x.domain(
        this.d3.d3.extent(this.data.map((x:StackedDataItem) => {return x.VALUE})) as [number,number]
        // extent
        // this.d3.d3.extent(this.data, function(d) {
        // return d.value;
        // })          
      );
  
      var max = this.d3.d3.max(this.data, (d:StackedDataItem) => {
        return d.VALUE;
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
          return x(Math.min(0, d.VALUE));
        })
        .attr("y", (d:StackedDataItem) => { return y(d.CATEGORY_DESC) as number })
        // .attr("y", function(d) {
        //   return y(d.name);
        // })
        .attr("height", y.bandwidth())
        .attr("width", (d:StackedDataItem) => {
          return Math.abs(x(d.VALUE) - x(0));
        })
        .style("fill", (d:StackedDataItem) => {
          return d.color ? d.color : colour(d.VALUE);
        })
        .append("title")
        // .text(({category, data: [name, value]}) => `${name}
        // ${formatValue(value.get(category))} ${category}`);
        .text(({CATEGORY_CODE, CATEGORY_DESC, BAR_CODE, VALUE}) => `${CATEGORY_DESC}
        ${formatValue(VALUE)} ${BAR_CODE}`);
  
      var labels = svg.append("g").attr("class", "labels");
  
      labels
        .selectAll("text")
        .data(this.data)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", x(0))
        .attr("y", (d:StackedDataItem) => { return y(d.CATEGORY_DESC) as number })
        .attr("dx", (d:StackedDataItem) => {
          return d.VALUE < 0 ? cfg.labelMargin : -cfg.labelMargin;
        })
        .attr("dy", y.bandwidth())
        .attr("text-anchor", (d:StackedDataItem) => {
          return d.VALUE < 0 ? "start" : "end";
        })
        .text((d:StackedDataItem) => {
          return d.CATEGORY_DESC;
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
      let o = {CATEGORY_DESC: c.CATEGORY_DESC, CATEGORY_CODE: d.CATEGORY_CODE, BAR_CODE: d.BAR_CODE,  BAR_DESC: d.BAR_DESC, VALUE: +d.PCT}
      data.push(o)
    })
  
  
  
    // Normalize absolute values to percentage.
    this.d3.d3.rollup(data, group => {
      const sum = this.d3.d3.sum(group, (d:StackedDataItem) => d.VALUE);
      for (const d of group) d.VALUE /= sum;
    }, (d:StackedDataItem) => d.CATEGORY_DESC);
  
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
      columns: ["CATEGORY_DESC", "CATEGORY_CODE", "VALUE"], // WHAT IS THIS FOR?
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

  
  