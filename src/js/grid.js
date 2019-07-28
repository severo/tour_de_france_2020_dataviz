import * as d3 from "d3";
export function showGrid(parent, dims, stageId, gapY, maxGap) {
  const g = parent
    .append("g")
    //.attr("id", `scale-stage${stageId}`)
    .attr("transform", `translate(${dims.x}, ${dims.y})`);

  const minutes = Math.floor(maxGap / 60);
  d3.range(0, minutes).forEach(minute => {
    const y = gapY(minute * 60);
    /*
    const height = gapY((minute + 1) * 60) - gapY(minute * 60);
    g.append("rect")
      .attr("x", 0)
      .attr("y", y)
      .attr("height", height)
      .attr("width", dims.width)
      .attr("fill-opacity", 0.02 + minute * 0.03);
*/
    if (minute > 0) {
      g.append("text")
        .attr("x", dims.width / 2)
        .attr("y", y)
        //        .attr("dy", "-0.3em")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(`+${minute}min`);
    }
  });

  return g;
}
