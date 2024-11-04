export interface ScaleType {
  (d: any): any,
  range: any,
  domain: any,
  ticks: any,
}

export interface DimensionsType {
  marginTop: number
  marginRight: number
  marginBottom: number
  marginLeft: number
  height: number
  width: number
  boundedHeight?: number
  boundedWidth?: number
}

export interface AccessorType {
  (value: any): any
}