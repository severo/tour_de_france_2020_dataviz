import * as d3 from "d3";
import { annotation } from "d3-svg-annotation";
import { load } from "./load";
import { stagesAnnotations } from "./annotations";

function showStraightLinks(riders, x, rankY, stageY) {
  riders
    .append("line")
    .attr("x1", rider => x(rider.previous.gap))
    .attr(
      "y1",
      rider => stageY(rider.previous.stageId) + rankY(rider.previous.topRank)
    )
    .attr("x2", rider => x(rider.gap))
    .attr("y2", rider => stageY(rider.stageId) + rankY(rider.topRank));
}

function curve(path, x1, y1, x2, y2) {
  const deltaY = 100;
  const sign = y1 > y2 ? -1 : 1;
  path.moveTo(x1, y1);
  path.bezierCurveTo(x1, y1 + sign * deltaY, x2, y2 - sign * deltaY, x2, y2);
  return path;
}
function showCurvedLinks(riders, x, rankY, stageY) {
  riders
    .append("path")
    .attr("d", rider =>
      curve(
        d3.path(),
        x(rider.previous.gap),
        stageY(rider.previous.stageId) + rankY(rider.previous.topRank),
        x(rider.gap),
        stageY(rider.stageId) + rankY(rider.topRank)
      ).toString()
    )
    .style("stroke", rider => rider.color);
}

function showLinks(riders, x, rankY, stageY, type = "curved") {
  if (type === "curved") {
    return showCurvedLinks(riders, x, rankY, stageY);
  } else {
    return showStraightLinks(riders, x, rankY, stageY);
  }
}

function showRiderAsNumbers(riders) {
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

function showRiders(riders, type = "point") {
  if (type === "number") {
    showRiderAsNumbers(riders);
  } else {
    showRidersAsPoints(riders);
  }
}
function addLinksStage(links, general, stageId, x, rankY, stageY) {
  const data = general[stageId].reverse();
  links
    .append("g")
    .attr("id", `links-stage${stageId - 1}to${stageId - 1}`)
    //.attr("transform", `translate(0, ${stageY(stageId)})`)
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr(
      "id",
      d => `links-stage${stageId - 1}to${stageId - 1}-rider${d.number}`
    )
    .classed("link", true)
    .call(riders => showLinks(riders, x, rankY, stageY));
  // set the data in its original order
  data.reverse();
}

function addRidersStage(riders, general, stageId, x, rankY, stageY) {
  const data = general[stageId].reverse();
  riders
    .append("g")
    .attr("id", `riders-stage${stageId}`)
    .attr("transform", `translate(0, ${stageY(stageId)})`)
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("id", d => `riders-stage${stageId}-rider${d.number}`)
    .classed("rider", true)
    .attr("transform", d => `translate(${x(d.gap)}, ${rankY(d.topRank)})`)
    .call(showRiders);
  // set the data in its original order
  data.reverse();
}

function addStageInfo(
  info,
  general,
  stageId,
  x,
  rankY,
  stageY,
  yOffset,
  width,
  margin,
  maxGap,
  stagesAnnotations
) {
  const g = info
    .append("g")
    .attr("id", `stages-stage${stageId}`)
    .attr("transform", `translate(${0}, ${stageY(stageId) + yOffset})`);

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

  if (stageId in stagesAnnotations) {
    const tooltip = g.append("g").classed("annotation", true);
    tooltip.call(
      createAnnotation(
        stagesAnnotations[stageId],
        general[stageId],
        x,
        rankY,
        stageY,
        yOffset
      )
    );
  }
}

function createAnnotation(stageAnnotations, riders, x, rankY, stageY, yOffset) {
  const rider = riders.find(r => r.name === stageAnnotations.riderName);
  const subject =
    "subject" in stageAnnotations
      ? stageAnnotations.subject
      : {
          radius: 20,
          radiusPadding: 0,
          xOffset: 0,
          yOffset: 0
        };
  return annotation()
    .type(stageAnnotations.type)
    .annotations([
      {
        note: {
          label: stageAnnotations.text,
          title: stageAnnotations.title,
          wrap: 280
        },
        nx: 320,
        ny: 193 + 40 + 10,
        subject: subject,
        x: x(rider.gap) + subject.xOffset,
        y: rankY(rider.topRank) + subject.yOffset - yOffset
      }
    ]);
}
function svg(general) {
  const width = 980;
  const margin = {
    left: 400,
    right: 150,
    stages: { top: 40, bottom: 40 },
    ranks: { top: 80, bottom: 200 },
    info: { top: 20 }
  };

  const nbRiders = general[0].length;
  const nbStages = 21;
  const rankHeight = 20;
  const stageHeight =
    nbRiders * rankHeight + margin.ranks.top + margin.ranks.bottom;
  const infoYOffset = margin.info.top;
  const height = nbStages * stageHeight;
  //const maxGap = d3.max(general, stage => d3.max(stage, rider => rider.gap));
  const maxGap = 60 * 5.5;

  const el = d3
    .select("svg#stages-svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3
    .scaleLinear()
    .domain([0, maxGap])
    .range([margin.left, width - margin.right]);
  const stageY = d3
    .scaleLinear()
    //.domain([nbStages - 1, 0])
    .domain([1, nbStages])
    .range([margin.stages.top, height - margin.stages.bottom - stageHeight]);
  const rankY = d3
    .scaleLinear()
    .domain([0, nbRiders - 1])
    //.domain([nbRiders - 1, 0])
    .range([margin.ranks.top, stageHeight - margin.ranks.bottom]);

  const info = el.append("g").attr("id", "info");
  const links = el.append("g").attr("id", "links");
  const riders = el.append("g").attr("id", "riders");

  general.forEach((_, stageId) => {
    if (stageId === 0) {
      return;
    }
    if (stageId > 1) addLinksStage(links, general, stageId, x, rankY, stageY);
    addRidersStage(riders, general, stageId, x, rankY, stageY);
    addStageInfo(
      info,
      general,
      stageId,
      x,
      rankY,
      stageY,
      infoYOffset,
      width,
      margin,
      maxGap,
      stagesAnnotations
    );
  });
  const remainingStages = d3.range(general.length, nbStages + 1, 1);
  remainingStages.forEach(stageId => {
    addStageInfo(
      info,
      general,
      stageId,
      x,
      rankY,
      stageY,
      infoYOffset,
      width,
      margin,
      maxGap,
      stagesAnnotations
    );
  });
}

load().then(svg);
