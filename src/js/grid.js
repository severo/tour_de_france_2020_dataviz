import * as d3 from "d3";
export function showGrid(parent, dims, stageId, x, width, margin, maxGap) {
  const g = parent
    .append("g")
    .attr("id", `grid-stage${stageId}`)
    .attr("transform", `translate(${dims.x}, ${dims.y})`);

  g.append("text")
    .classed("title", true)
    .attr("x", 20)
    .attr("y", 20)
    .text(`Classement général après l'étape ${stageId}`);

  g.append("line")
    .attr("x1", 10)
    .attr("y1", 0)
    .attr("x2", 10)
    .attr("y2", 30);

  g.append("line")
    .attr("x1", 10)
    .attr("y1", 30)
    .attr("x2", width - margin.right)
    .attr("y2", 30);

  // Scale
  const ticksValues = d3.range(0, maxGap, 60);
  const ticks = g
    .selectAll("g")
    .data(ticksValues)
    .enter()
    .append("g")
    .classed("tick", true)
    .attr("transform", d => `translate(${x(d)}, ${20})`);

  ticks
    .append("line")
    .attr("x1", 0)
    .attr("y1", 10)
    .attr("x2", 0)
    .attr("y2", 0);
  ticks
    .append("text")
    .attr("x", 5)
    .attr("y", 5)
    .attr("text-anchor", "left")
    .text(d => `${d / 60}'`);

  return g;
}
