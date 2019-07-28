function showRidersAsNumbers(riders) {
  riders.classed("rider-as-number", true);
  riders
    .append("circle")
    .attr("x", 0)
    .attr("y", 0)
    .attr("r", 20);

  riders
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .text(d => d.number)
    .attr("text-anchor", "middle")
    .attr("dy", "0.3em");
}

function showRidersAsPoints(riders) {
  riders.classed("rider-as-point", true);
  riders
    .append("circle")
    .attr("x", 0)
    .attr("y", 0)
    .attr("r", 5)
    .style("fill", rider => rider.color);

  riders
    .append("text")
    .attr("x", 10)
    .attr("y", 0)
    .text(d => `${d.name} (${d.rank})`)
    .attr("text-anchor", "left")
    .attr("dy", "0.3em");
}

function showRidersElements(riders, type = "point") {
  if (type === "number") {
    showRidersAsNumbers(riders);
  } else {
    showRidersAsPoints(riders);
  }
}

export function showRiders(parent, dims, general, stageId) {
  const data = general[stageId].reverse();
  const g = parent
    .append("g")
    .attr("id", `riders-stage${stageId}`)
    .attr("transform", `translate(${dims.x}, ${dims.y})`);

  g.selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("id", d => `riders-stage${stageId}-rider${d.number}`)
    .classed("rider", true)
    .attr(
      "transform",
      d => `translate(${dims.rider.getX(d)}, ${dims.rider.getY(d)})`
    )
    .call(showRidersElements);
  // set the data in its original order
  data.reverse();
  return g;
}
