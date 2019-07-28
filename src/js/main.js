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
  const infoYOffset = margin.info.top;

  const nbRiders = general[0].length;
  const nbStages = 21;
  const rankHeight = 20;
  const stageHeight =
    nbRiders * rankHeight + margin.ranks.top + margin.ranks.bottom;
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

  const getInfoDims = stageId => ({
    image: {
      height: 193,
      width: 320,
      x: 0,
      y: 0
    },
    height: 193,
    width: 320,
    x: 0,
    y: stageY(stageId) + infoYOffset + 40
  });
  const getAnnotationsDims = stageId => ({
    x: 0,
    y: stageY(stageId) + infoYOffset
  });
  const getGridDims = stageId => ({
    x: 0,
    y: stageY(stageId) + infoYOffset
  });
  const getRidersDims = stageId => ({
    x: 0,
    y: stageY(stageId)
  });

  const getDims = stageId => ({
    info: getInfoDims(stageId),
    annotations: getAnnotationsDims(stageId),
    grid: getGridDims(stageId),
    riders: getRidersDims(stageId)
  });

  general.forEach((_, stageId) => {
    const dims = getDims(stageId);
    if (stageId === 0) return;
    showGrid(grid, dims, stageId, x, width, margin, maxGap);
    if (stageId > 1) showLinks(links, general, stageId, x, rankY, stageY);
    showRiders(riders, dims, general, stageId, x, rankY);
    showInfo(info, dims, stageId);
    showAnnotations(
      annotations,
      dims,
      general,
      stageId,
      x,
      rankY,
      stageY,
      infoYOffset
    );
  });
  const remainingStages = d3.range(general.length, nbStages + 1, 1);
  remainingStages.forEach(stageId => {
    showGrid(grid, getDims(stageId), stageId, x, width, margin, maxGap);
    showInfo(info, getDims(stageId), stageId);
  });
}

load().then(svg);
