
export class curveMonotoneSolver {
    /* Solver for the monotonic curve interpolation algorithm laid out in
    http://adsbit.harvard.edu//full/1990A%26A...239..443S/0000443.000.html
    Unfortunately I was not able to get the the curves do not match d3's path 
    generator around the boundary points, so I opted to implement the first
    set of solutions for boundary conditions enumerated in the paper,
    "define the unknown slope by the one-sided finite differences" (you can
    CTRL-F that sentence).  */
    
    private controlPoints: any[] = []
  
    constructor(controlPoints: any[]) {
      this.doPreCalculations(controlPoints);
    }
  
    update(controlPoints: any[]) {
      this.doPreCalculations(controlPoints);
    }
  
    doPreCalculations(controlPoints: any[]) {
      this.controlPoints = controlPoints.map((cp:any, i:number) => {
        const nextCP = controlPoints[i + 1];
        if (nextCP) {
          return {
            ...cp,
            h: nextCP.x - cp.x,
            s: (nextCP.y - cp.y) / (nextCP.x - cp.x),
          };
        }
        return cp;
      });
  
      this.controlPoints = this.controlPoints.map((cp:any, i:number) => ({
        ...cp,
        dy: this.getDY(cp, i),
      }));
    }
  
    getDY(cp: any, i: number) {
      const lastCP = this.controlPoints[i - 1];
      if (i === 0) return cp.s;
      if (i === this.controlPoints.length - 1) return lastCP.s;
      if (lastCP.s * cp.s <= 0) return 0;
      const p = (lastCP.s * cp.h + cp.s * lastCP.h) / (cp.h + lastCP.h);
      const comparitor = 2 * Math.min(Math.abs(cp.s), Math.abs(lastCP.s));
      if (Math.abs(p) > comparitor) {
        return 2 * Math.sign(cp.s) * Math.min(Math.abs(cp.s), Math.abs(lastCP.s));
      }
      return p;
    }
  
    solve(x: any) {
      if (x === null) return null;
      const startIndex = this.controlPoints.findIndex(cp => cp.x >= x) - 1;
      const startCP = this.controlPoints[startIndex];
      const endCP = this.controlPoints[startIndex + 1];
      const a = (startCP.dy + endCP.dy - 2 * startCP.s) / Math.pow(startCP.h, 2);
      const b = (3 * startCP.s - 2 * startCP.dy - endCP.dy) / startCP.h;
      const cubicComponent = a * Math.pow(x - startCP.x, 3);
      const squaredComponent = b * Math.pow(x - startCP.x, 2);
      const linearComponent = startCP.dy * (x - startCP.x);
      return cubicComponent + squaredComponent + linearComponent + startCP.y;
    }
  }
  