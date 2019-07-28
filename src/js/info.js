export function showInfo(parent, dims, stageId) {
  const g = parent
    .append("g")
    .attr("id", `info-stage${stageId}`)
    .attr("transform", `translate(${dims.info.x}, ${dims.info.y})`);

  g.append("image")
    .attr(
      "xlink:href",
      `https://github.com/severo/tour_de_france_2019_data/raw/master/profile_images/stage-${stageId}.jpeg`
    )
    .attr("x", dims.info.image.x)
    .attr("y", dims.info.image.y)
    .attr("width", dims.info.image.width)
    .attr("height", dims.info.image.height)
    .classed("profile", true);

  return g;
}
