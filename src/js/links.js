import * as d3 from "d3";

function showStraightLinks(riders, dims) {
  riders
    .append("line")
    .attr("x1", dims.rider.getPreviousX)
    .attr("y1", dims.rider.getPreviousY)
    .attr("x2", dims.rider.getX)
    .attr("y2", dims.rider.getX);
}

function curve(path, x1, y1, x2, y2) {
  const deltaY = 100;
  const sign = y1 > y2 ? -1 : 1;
  path.moveTo(x1, y1);
  path.bezierCurveTo(x1, y1 + sign * deltaY, x2, y2 - sign * deltaY, x2, y2);
  return path;
}
function showCurvedLinks(riders, dims) {
  riders
    .append("path")
    .attr("d", rider =>
      curve(
        d3.path(),
        dims.rider.getPreviousX(rider),
        dims.rider.getPreviousY(rider),
        dims.rider.getX(rider),
        dims.rider.getY(rider)
      ).toString()
    )
    .style("stroke", rider => rider.color);
}

function addLinks(riders, dims, type = "curved") {
  if (type === "curved") {
    return showCurvedLinks(riders, dims);
  } else {
    return showStraightLinks(riders, dims);
  }
}

export function showLinks(parent, dims, general, stageId) {
  const data = general[stageId].reverse();
  const g = parent
    .append("g")
    .attr("id", `links-stage${stageId - 1}to${stageId - 1}`)
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr(
      "id",
      d => `links-stage${stageId - 1}to${stageId - 1}-rider${d.number}`
    )
    .classed("link", true)
    .call(riders => addLinks(riders, dims));
  // set the data in its original order
  data.reverse();
  return g;
}
