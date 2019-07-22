import * as d3 from 'd3';
async function load() {
  const url =
    'https://raw.githubusercontent.com/severo/tour_de_france_2019_data/master/stages.json';
  const response = await fetch(url);
  const stages = await response.json();

  const general = stages.reduce(
    (general, stage, id) => {
      const newStage = stage
        .map(rider => {
          const previousId = general[id].findIndex(
            r => r.number === rider.number
          );
          return {
            previous: general[id][previousId],
            name: rider.name,
            number: rider.number,
            team: rider.team,
            time:
              general[id][previousId].time +
              rider.time -
              rider.bonif +
              rider.penal,
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
          rank: id + 1,
          gap: rider.time - bestTime,
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
          time: 0,
          gap: 0,
        }))
        .sort((a, b) => a.number > b.number),
    ]
  );

  d3.select('#stages')
    .selectAll('span')
    .data(general)
    .enter()
    .append('span')
    .text(d => `${d[0].name} - `);

  svg(general);
}

function getX(rider) {
  //return rider.rank * 50;
  return rider.gap * 4 + 50;
}
function getPreviousX(rider) {
  //return rider.previous.rank * 50;
  return rider.previous.gap * 4 + 50;
}

function showLinks(riders) {
  riders
    .append('line')
    .attr('x1', getPreviousX)
    .attr('y1', 100)
    .attr('x2', getX)
    .attr('y2', 0);
}

function showRiders(riders) {
  riders
    .append('circle')
    .attr('x', 0)
    .attr('y', 0)
    .attr('r', 20);

  riders
    .append('text')
    .attr('x', 0)
    .attr('y', 0)
    .text(d => d.number)
    .attr('text-anchor', 'middle')
    .attr('dy', '0.3em');
}

function addLinksStage(links, general, stageId, height) {
  links
    .append('g')
    .attr('id', `stage${stageId - 1}to${stageId - 1}`)
    .attr('transform', `translate(0, ${height - 50 - stageId * 100})`)
    .selectAll('g')
    .data(general[stageId])
    .enter()
    .append('g')
    .attr('id', d => `stage${stageId - 1}to${stageId - 1}-rider${d.number}`)
    .classed('link', true)
    .call(showLinks);
}

function addRidersStage(riders, general, stageId, height) {
  riders
    .append('g')
    .attr('id', `stage${stageId}`)
    .attr('transform', `translate(0, ${height - 50 - stageId * 100})`)
    .selectAll('g')
    .data(general[stageId])
    .enter()
    .append('g')
    .attr('id', d => `stage${stageId}-rider${d.number}`)
    .classed('rider', true)
    .attr('transform', d => `translate(${getX(d)}, 0)`)
    .call(showRiders);
}

function svg(general) {
  const height = 1500;
  const el = d3
    .select('svg#stages-svg')
    .attr('width', '200%')
    .attr('height', height);

  const links = el.append('g').attr('id', 'links');
  const riders = el.append('g').attr('id', 'riders');

  general.slice(0, 15).forEach((_, stageId) => {
    if (stageId > 0) addLinksStage(links, general, stageId, height);
    addRidersStage(riders, general, stageId, height);
  });
}

load();
