/** The slice of D3 this app uses. Named imports keep the bundle tree-shaken. */
export {
  select,
  scaleLinear,
  scaleBand,
  scaleSqrt,
  scaleDiverging,
  interpolateRgb,
  interpolateRgbBasis,
  axisBottom,
  axisLeft,
  line,
  curveMonotoneX,
  bin,
  extent,
  max,
  min,
  easeBackOut,
  easeCubicOut,
  easeElasticOut,
  // Re-exporting `transition` keeps d3-transition in the bundle; it patches selection.transition().
  transition,
} from 'd3';
