import * as d3 from "d3";
import { load } from "./load";
//import { showAnnotations } from "./annotations";
import { showGrid } from "./grid";
import { showRiders } from "./riders";
import { showInfo } from "./info";

function svg(general) {
  // Dimensions
  const deviceWidth = document.body.clientWidth;
  const width = deviceWidth < 640 ? deviceWidth : 640;
  const margin = {
    stages: { top: 10, bottom: 10 },
    ranks: { top: 40, bottom: 40 }
  };
  const ridersMargin = width / 4;
  const imageWidth = width - 2 * ridersMargin + 100;
  const imageHeight = (imageWidth * 579) / 960;
  const infoHeight = imageHeight + 70;
  const infoLeft = ridersMargin - 50;
  const annotationHeight = 0;
  const ridersHeight = 400;
  //const scaleHeight = 40;
  const ridersTop = margin.ranks.top + infoHeight + 10 + annotationHeight;

  //const nbRiders = general[0].length;
  const nbStages = 21;
  //const rankHeight = 20;
  const stageHeight = ridersTop + ridersHeight + margin.ranks.bottom;
  const height = nbStages * stageHeight;
  //const maxGap = d3.max(general, stage => d3.max(stage, rider => rider.gap));
  const maxGap = 60 * 5;

  // SVG elements
  const el = d3
    .select("svg#stages-svg")
    .attr("width", width)
    .attr("height", height);
  const info = el.append("g").attr("id", "info");
  const grid = el.append("g").attr("id", "grid");
  const links = el.append("g").attr("id", "links");
  const riders = el.append("g").attr("id", "riders");
  //const annotations = el.append("g").attr("id", "annotations");

  const gapY = d3
    .scaleLinear()
    .domain([0, maxGap])
    .range([0, ridersHeight]);
  const stageY = d3
    .scaleLinear()
    .domain([1, nbStages])
    .range([margin.stages.top, height - margin.stages.bottom - stageHeight]);

  const getInfoDims = stageId => ({
    height: infoHeight,
    image: {
      height: imageHeight,
      width: imageWidth,
      x: 0,
      y: 70
    },
    title: {
      height: 30,
      width: imageWidth - 20,
      x: 10,
      y: 0
    },
    x: infoLeft,
    y: stageY(stageId)
  });
  const getGridDims = stageId => ({
    width: width - 2 * ridersMargin,
    x: ridersMargin,
    y: stageY(stageId) + ridersTop
  });
  const getLinksDims = stageId => ({
    getPreviousX: () =>
      stageId % 2 === 1 ? ridersMargin : width - ridersMargin,
    getPreviousY: rider =>
      gapY(rider.previous.gap) + stageY(stageId - 1) + ridersTop,
    getStartX: () => (stageId % 2 === 1 ? ridersMargin : width - ridersMargin),
    getStartY: rider => gapY(rider.previous.gap) + stageY(stageId) + ridersTop,
    getEndX: () => (stageId % 2 === 0 ? ridersMargin : width - ridersMargin),
    getEndY: rider => gapY(rider.gap) + stageY(stageId) + ridersTop
  });
  const getAnnotationsDims = stageId => ({
    rider: getLinksDims(stageId),
    height: annotationHeight,
    width: 280,
    x: 40,
    y: stageY(stageId) + getInfoDims(stageId).height + 10 + annotationHeight
  });

  const getDims = stageId => ({
    info: getInfoDims(stageId),
    annotations: getAnnotationsDims(stageId),
    grid: getGridDims(stageId),
    riders: getLinksDims(stageId)
  });

  general.forEach((_, stageId) => {
    const dims = getDims(stageId);
    if (stageId === 0) return;
    showInfo(info, dims.info, stageId);
    showGrid(grid, dims.grid, stageId, gapY, maxGap);
    showRiders(riders, links, dims.riders, general, stageId);
    //showAnnotations(annotations, dims.annotations, general, stageId);
  });
}

load().then(svg);
