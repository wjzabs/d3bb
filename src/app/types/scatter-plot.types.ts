import { IColor } from "./color.type";

export interface IScatterPlotDatum {
  x: number;
  y: number;
  r: number;
  color?: IColor;
  label?: string;
}