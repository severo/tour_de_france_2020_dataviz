import * as d3 from "d3";
export function showScale(parent, dims, stageId, gapX, maxGap) {
  const g = parent
    .append("g")
    .attr("id", `grid-stage${stageId}`)
    .attr("transform", `translate(${dims.x}, ${dims.y})`);

  g.append("line")
    .attr("x1", 0)
    .attr("y1", dims.height)
    .attr("x2", dims.width)
    .attr("y2", dims.height);

  const secondsPerMinute = 60;
  const ticksValues = d3.range(0, maxGap, secondsPerMinute);
  const ticks = g
    .selectAll("g")
    .data(ticksValues)
    .enter()
    .append("g")
    .classed("tick", true)
    .attr("transform", d => `translate(${gapX(d)}, ${0})`);

  ticks
    .append("line")
    .attr("x1", 0)
    .attr("y1", dims.height)
    .attr("x2", 0)
    .attr("y2", 0);
  ticks
    .append("text")
    .attr("x", 5)
    .attr("y", dims.height - 5)
    .attr("text-anchor", "left")
    .text(d => `${d / secondsPerMinute}'`);

  return g;
}
