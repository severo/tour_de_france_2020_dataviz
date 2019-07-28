export function showInfo(parent, dims, stageId) {
  const g = parent
    .append("g")
    .attr("id", `info-stage${stageId}`)
    .attr("transform", `translate(${dims.x}, ${dims.y})`);

  g.append("text")
    .classed("title", true)
    .attr("x", dims.title.x + 10)
    .attr("y", dims.title.height - 10)
    .text(`Classement général après l'étape ${stageId}`);

  g.append("line")
    .attr("x1", dims.title.x)
    .attr("y1", 0)
    .attr("x2", dims.title.x)
    .attr("y2", dims.title.height);

  g.append("line")
    .attr("x1", dims.title.x)
    .attr("y1", dims.title.height)
    .attr("x2", dims.title.x + dims.title.width)
    .attr("y2", dims.title.height);

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
