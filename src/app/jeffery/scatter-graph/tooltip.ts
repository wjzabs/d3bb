/**
 * This file was derived from https://observablehq.com/@clhenrick/tooltip-d3-convention
 */
import * as d3 from 'd3';

function setContents(datum: any, tooltipDiv: any) {
  // customize this function to set the tooltip's contents however you see fit
  tooltipDiv
    .selectAll("p")
    .data(Object.entries(datum))
    .join("p")
    .filter(([key, value]: [any, any]) => value !== null && value !== undefined)
    .html(
      ([key, value]: [any, any]) =>
        `<strong>${key}</strong>: ${
          typeof value === "object" ? value.toLocaleString("en-US") : value
        }`
    );
}

function setStyle(selection: any) {
  selection.attr("fill", "magenta");
}

function resetStyle(selection: any) {
  selection.attr("fill", "#333");
}

export const tooltip = (selectionGroup: any, tooltipDiv: any) => {

  const MOUSE_POS_OFFSET = 8
  const height = 500
  const width = 900
  const margin = ({ top: 30, right: 30, bottom: 30, left: 30 })

  selectionGroup.each(function (this: any) {
    d3.select(this)
      .on("mouseover.tooltip", handleMouseover)
      .on("mousemove.tooltip", handleMousemove)
      .on("mouseleave.tooltip", handleMouseleave);
  });

  function handleMouseover(this: any) {
    // show/reveal the tooltip, set its contents,
    // style the element being hovered on
    showTooltip();
    setContents(d3.select(this).datum(), tooltipDiv);
    setStyle(d3.select(this));
  }

  function handleMousemove(this: any, event: any) {
    // update the tooltip's position
    const [mouseX, mouseY] = d3.pointer(event, this);
    // add the left & top margin values to account for the SVG g element transform
    setPosition(mouseX + margin.left, mouseY + margin.top);
  }

  function handleMouseleave(this: any) {
    // do things like hide the tooltip
    // reset the style of the element being hovered on
    hideTooltip();
    resetStyle(d3.select(this));
  }

  function showTooltip() {
    tooltipDiv.style("display", "block");
  }

  function hideTooltip() {
    tooltipDiv.style("display", "none");
  }

  function setPosition(mouseX: number, mouseY: number) {
    tooltipDiv
      .style(
        "top",
        mouseY < height / 2 ? `${mouseY + MOUSE_POS_OFFSET}px` : "initial"
      )
      .style(
        "right",
        mouseX > width / 2
          ? `${width - mouseX + MOUSE_POS_OFFSET}px`
          : "initial"
      )
      .style(
        "bottom",
        mouseY > height / 2
          ? `${height - mouseY + MOUSE_POS_OFFSET}px`
          : "initial"
      )
      .style(
        "left",
        mouseX < width / 2 ? `${mouseX + MOUSE_POS_OFFSET}px` : "initial"
      );
  }
}