import * as d3 from "d3";
import { load } from "./load";
import { showAnnotations } from "./annotations";
import { showScale } from "./scale";
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
  const scale = el.append("g").attr("id", "scale");
  const links = el.append("g").attr("id", "links");
  const riders = el.append("g").attr("id", "riders");
  const info = el.append("g").attr("id", "info");
  const annotations = el.append("g").attr("id", "annotations");

  const gapX = d3
    .scaleLinear()
    .domain([0, maxGap])
    .range([0, width - margin.right - margin.left]);
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
      y: infoYOffset + 40
    },
    height: 193,
    title: {
      height: 30,
      width: margin.left - 10,
      x: 10,
      y: 0
    },
    width: 320,
    x: 0,
    y: stageY(stageId)
  });
  const getScaleDims = stageId => ({
    width: width - margin.right - margin.left,
    height: 10,
    x: margin.left,
    y: stageY(stageId) + infoYOffset
  });
  const getRidersDims = stageId => ({
    getX: rider => gapX(rider.gap) + margin.left,
    getY: rider => rankY(rider.topRank) + stageY(stageId)
  });
  const getAnnotationsDims = stageId => ({
    rider: getRidersDims(stageId),
    width: 280,
    x: getInfoDims(stageId).width,
    y: stageY(stageId) + getInfoDims(stageId).height + 40 + 10 + infoYOffset
  });
  const getLinksDims = stageId => ({
    getPreviousX: rider => gapX(rider.previous.gap) + margin.left,
    getPreviousY: rider => rankY(rider.previous.topRank) + stageY(stageId - 1),
    getX: rider => gapX(rider.gap) + margin.left,
    getY: rider => rankY(rider.topRank) + stageY(stageId)
  });

  const getDims = stageId => ({
    info: getInfoDims(stageId),
    annotations: getAnnotationsDims(stageId),
    scale: getScaleDims(stageId),
    riders: getRidersDims(stageId),
    links: getLinksDims(stageId)
  });

  general.forEach((_, stageId) => {
    const dims = getDims(stageId);
    if (stageId === 0) return;
    showScale(scale, dims.scale, stageId, gapX, maxGap);
    if (stageId > 1) showLinks(links, dims.links, general, stageId);
    showRiders(riders, dims.riders, general, stageId);
    showInfo(info, dims.info, stageId);
    showAnnotations(annotations, dims.annotations, general, stageId);
  });
  const remainingStages = d3.range(general.length, nbStages + 1, 1);
  remainingStages.forEach(stageId => {
    const dims = getDims(stageId);
    showScale(scale, dims.scale, stageId, gapX, maxGap);
    showInfo(info, dims.info, stageId);
  });
}

load().then(svg);
