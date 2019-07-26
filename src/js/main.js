import * as d3 from "d3";
async function load() {
  const url =
    "https://raw.githubusercontent.com/severo/tour_de_france_2019_data/master/stages.json";
  const response = await fetch(url);
  const stages = await response.json();

  const general = stages.reduce(
    (general, stage, stageId) => {
      const newStage = stage
        .map(rider => {
          const previousId = general[stageId].findIndex(
            r => r.number === rider.number
          );
          return {
            previous: general[stageId][previousId],
            name: rider.name,
            number: rider.number,
            team: rider.team,
            time:
              general[stageId][previousId].time +
              rider.time -
              rider.bonif +
              rider.penal,
            stageId: stageId + 1
          };
        })
        .sort(
          (a, b) =>
            a.time > b.time || (a.time === b.time && a.number > b.number)
        );
      const bestTime = newStage[0].time;

      general.push(
        newStage.map((rider, id) => ({
          previous: rider.previous,
          name: rider.name,
          number: rider.number,
          team: rider.team,
          time: rider.time,
          stageId: rider.stageId,
          rank: id + 1,
          gap: rider.time - bestTime
        }))
      );
      return general;
    },
    [
      stages[0]
        .map(rider => ({
          rank: 1,
          name: rider.name,
          number: rider.number,
          team: rider.team,
          stageId: 0,
          time: 0,
          gap: 0
        }))
        .sort((a, b) => a.number > b.number)
    ]
  );

  // only show the top_n riders of the last classification
  const top_n = 12;
  const topRiders = general[general.length - 1]
    .sort((a, b) => b.value - a.value)
    .slice(0, top_n)
    .map(rider => rider.number);

  const filteredGeneral = general.map(stage => {
    return stage
      .filter(rider => topRiders.includes(rider.number))
      .sort((a, b) => b.value - a.value)
      .map((rider, topId) => {
        rider.topRank = topId;
        return rider;
      });
  });

  d3.select("#stages")
    .selectAll("span")
    .data(filteredGeneral)
    .enter()
    .append("span")
    .text(d => `${d[0].name} - `);

  svg(filteredGeneral);
}

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
    );
}

function showLinks(riders, x, rankY, stageY, type = "curved") {
  if (type === "curved") {
    return showCurvedLinks(riders, x, rankY, stageY);
  } else {
    return showStraightLinks(riders, x, rankY, stageY);
  }
}

function showRiders(riders) {
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

function addLinksStage(links, general, stageId, x, rankY, stageY) {
  links
    .append("g")
    .attr("id", `stage${stageId - 1}to${stageId - 1}`)
    //.attr("transform", `translate(0, ${stageY(stageId)})`)
    .selectAll("g")
    .data(general[stageId])
    .enter()
    .append("g")
    .attr("id", d => `stage${stageId - 1}to${stageId - 1}-rider${d.number}`)
    .classed("link", true)
    .call(riders => showLinks(riders, x, rankY, stageY));
}

function addRidersStage(riders, general, stageId, x, rankY, stageY) {
  riders
    .append("g")
    .attr("id", `stage${stageId}`)
    .attr("transform", `translate(0, ${stageY(stageId)})`)
    .selectAll("g")
    .data(general[stageId])
    .enter()
    .append("g")
    .attr("id", d => `stage${stageId}-rider${d.number}`)
    .classed("rider", true)
    .attr("transform", d => `translate(${x(d.gap)}, ${rankY(d.topRank)})`)
    .call(showRiders);
}

function svg(general) {
  const margin = {
    left: 40,
    right: 40,
    stages: { top: 40, bottom: 40 },
    ranks: { top: 20, bottom: 80 }
  };

  const nbRiders = general[0].length;
  const nbStages = general.length;
  const rankHeight = 20;
  const width = 800;
  const stageHeight =
    nbRiders * rankHeight + margin.ranks.top + margin.ranks.bottom;
  const height = nbStages * stageHeight;
  const maxGap = d3.max(general, stage => d3.max(stage, rider => rider.gap));

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
    .domain([nbStages - 1, 0])
    .range([margin.stages.top, height - margin.stages.bottom - stageHeight]);
  const rankY = d3
    .scaleLinear()
    .domain([0, nbRiders - 1])
    .range([margin.ranks.top, stageHeight - margin.ranks.bottom]);

  //debugger;
  const links = el.append("g").attr("id", "links");
  const riders = el.append("g").attr("id", "riders");

  general.forEach((_, stageId) => {
    if (stageId > 0) addLinksStage(links, general, stageId, x, rankY, stageY);
    addRidersStage(riders, general, stageId, x, rankY, stageY);
  });
}

load();
