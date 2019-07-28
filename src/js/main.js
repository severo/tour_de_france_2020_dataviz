import * as d3 from "d3";
import { load } from "./load";
import { showAnnotations } from "./annotations";
import { showGrid } from "./grid";
import { showLinks } from "./links";
import { showRiders } from "./riders";
import { showInfo } from "./info";

function svg(general) {
  // Dimensions
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

  // SVG elements
  const el = d3
    .select("svg#stages-svg")
    .attr("width", width)
    .attr("height", height);
  const grid = el.append("g").attr("id", "grid");
  const links = el.append("g").attr("id", "links");
  const riders = el.append("g").attr("id", "riders");
  const info = el.append("g").attr("id", "info");
  const annotations = el.append("g").attr("id", "annotations");

  const x = d3
    .scaleLinear()
    .domain([0, maxGap])
    .range([margin.left, width - margin.right]);
  const stageY = d3
    .scaleLinear()
    .domain([1, nbStages])
    .range([margin.stages.top, height - margin.stages.bottom - stageHeight]);
  const rankY = d3
    .scaleLinear()
    .domain([0, nbRiders - 1])
    .range([margin.ranks.top, stageHeight - margin.ranks.bottom]);

  general.forEach((_, stageId) => {
    if (stageId === 0) return;
    showGrid(grid, stageId, x, width, margin, maxGap).attr(
      "transform",
      `translate(${0}, ${stageY(stageId) + infoYOffset})`
    );
    if (stageId > 1) showLinks(links, general, stageId, x, rankY, stageY);
    showRiders(riders, general, stageId, x, rankY).attr(
      "transform",
      `translate(0, ${stageY(stageId)})`
    );
    showInfo(info, stageId).attr(
      "transform",
      `translate(${0}, ${stageY(stageId) + infoYOffset})`
    );
    showAnnotations(
      annotations,
      general,
      stageId,
      x,
      rankY,
      stageY,
      infoYOffset
    ).attr("transform", `translate(${0}, ${stageY(stageId) + infoYOffset})`);
  });
  const remainingStages = d3.range(general.length, nbStages + 1, 1);
  remainingStages.forEach(stageId => {
    showGrid(grid, stageId, x, width, margin, maxGap).attr(
      "transform",
      `translate(${0}, ${stageY(stageId) + infoYOffset})`
    );
    showInfo(info, stageId).attr(
      "transform",
      `translate(${0}, ${stageY(stageId) + infoYOffset})`
    );
  });
}

load().then(svg);
