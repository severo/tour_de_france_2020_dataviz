import * as d3 from "d3";

function showPicture(riders, x, y) {
  const radius = 20;
  riders
    .append("image")
    .attr(
      "xlink:href",
      rider =>
        `https://github.com/severo/tour_de_france_2019_data/raw/master/riders_images/${rider.name.replace(
          " ",
          "_"
        )}.jpeg`
    )
    .attr("x", d => x(d) - radius)
    .attr("y", d => y(d) - radius)
    .attr("width", 2 * radius)
    .attr("height", 2 * radius)
    .attr("clip-path", "circle() fill-box");
  riders
    .append("circle")
    .attr("cx", d => x(d))
    .attr("cy", d => y(d))
    .attr("r", radius)
    .style("stroke", rider => rider.color);
}

function curve(path, x1, y1, x2, y2, deltaX1, deltaX2) {
  path.moveTo(x1, y1);
  path.bezierCurveTo(x1 + deltaX1, y1, x2 + deltaX2, y2, x2, y2);
  return path;
}
function curvePrevious(path, x1, y1, x2, y2, deltaX) {
  curve(path, x1, y1, x2, y2, deltaX, deltaX);
  return path;
}
function curveStartToEnd(path, x1, y1, x2, y2) {
  const deltaX = (x2 - x1) / 3;
  curve(path, x1, y1, x2, y2, deltaX, -deltaX);
  return path;
}

export function showRiders(ridersParent, linksParent, dims, general, stageId) {
  const data = general[stageId].reverse();
  const g = ridersParent.append("g").attr("id", `riders-stage${stageId}`);

  const riders = g
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("id", d => `riders-stage${stageId}-rider${d.number}`)
    .classed("rider", true);
  showPicture(riders, dims.getStartX, dims.getStartY);
  showPicture(riders, dims.getEndX, dims.getEndY);

  // links
  const links = linksParent
    .append("g")
    .attr("id", `links-stage${stageId}`)
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("id", d => `links-stage${stageId}-rider${d.number}`);
  if (stageId > 1) {
    links
      .append("path")
      .attr("d", rider =>
        curvePrevious(
          d3.path(),
          dims.getPreviousX(rider),
          dims.getPreviousY(rider),
          dims.getStartX(rider),
          dims.getStartY(rider),
          (dims.getStartX(rider) - dims.getEndX(rider)) / 2
        ).toString()
      )
      .style("stroke", rider => rider.color);
  }
  links
    .append("path")
    .attr("d", rider =>
      curveStartToEnd(
        d3.path(),
        dims.getStartX(rider),
        dims.getStartY(rider),
        dims.getEndX(rider),
        dims.getEndY(rider)
      ).toString()
    )
    .style("stroke", rider => rider.color);

  /*riders
    .append("text")
    .attr("x", d => dims.getX(d) + 10)
    .attr("y", d => dims.getY(d))
    .text(d => `${d.name.split(" ").reverse()[0]} (${d.rank})`)
    .attr("text-anchor", "left")
    .attr("dy", "0.3em");
*/
  // set the data in its original order
  data.reverse();
  return g;
}
