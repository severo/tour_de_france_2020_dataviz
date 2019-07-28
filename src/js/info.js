export function showInfo(parent, dims, stageId) {
  const g = parent
    .append("g")
    .attr("id", `info-stage${stageId}`)
    .attr("transform", `translate(${dims.x}, ${dims.y})`);

  g.append("image")
    .attr(
      "xlink:href",
      `https://github.com/severo/tour_de_france_2019_data/raw/master/profile_images/stage-${stageId}.jpeg`
    )
    .attr("x", dims.image.x)
    .attr("y", dims.image.y)
    .attr("width", dims.image.width)
    .attr("height", dims.image.height)
    .classed("profile", true);

  return g;
}
