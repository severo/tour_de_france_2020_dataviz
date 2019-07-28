export function showInfo(parent, stageId) {
  const g = parent.append("g").attr("id", `info-stage${stageId}`);

  g.append("image")
    .attr(
      "xlink:href",
      `https://github.com/severo/tour_de_france_2019_data/raw/master/profile_images/stage-${stageId}.jpeg`
    )
    .attr("x", 0)
    .attr("y", 40)
    .attr("width", 320)
    .attr("height", 193)
    .classed("profile", true);

  return g;
}
