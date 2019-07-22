import * as d3 from 'd3';
async function load() {
  const url =
    'https://raw.githubusercontent.com/severo/tour_de_france_2019_data/master/stages.json';
  const response = await fetch(url);
  const stages = await response.json();

  const general = stages.reduce(
    (general, stage, id) => {
      general.push(
        stage
          .map(rider => ({
            name: rider.name,
            number: rider.number,
            team: rider.team,
            time: general[id].time + rider.time - rider.bonif + rider.penal,
          }))
          .sort(
            (a, b) =>
              a.time > b.time || (a.time === b.time && a.number > b.number)
          )
          .map((rider, id) => ({
            name: rider.name,
            number: rider.number,
            team: rider.team,
            time: rider.time,
            rank: id + 1,
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

function showRiders(riders) {
  riders
    .append('circle')
    .attr('x', 0)
    .attr('y', 0)
    .attr('r', 20)
    .style('stroke', 'black')
    .style('fill', 'none');

  riders
    .append('text')
    .attr('x', 0)
    .attr('y', 0)
    .text(d => d.number)
    .attr('text-anchor', 'middle')
    .attr('dy', '0.3em')
    .style('fill', 'black')
    .style('stroke', 'none');
}

function svg(general) {
  const height = 900;
  const el = d3
    .select('svg#stages-svg')
    .attr('width', '200%')
    .attr('height', height);
  //el.setAttribute('viewport', '100%')

  let stageId = 0;
  el.append('g')
    .attr('id', `stage${stageId}`)
    .selectAll('g')
    .data([{number: 1, rank: 1}])
    .enter()
    .append('g')
    .attr('id', d => `stage${stageId}-runner${d.number}`)
    .attr(
      'transform',
      d => `translate(${d.rank * 50}, ${height - 50 - stageId * 200})`
    )
    .call(showRiders);

  stageId = 1;
  el.append('g')
    .attr('id', `stage${stageId}`)
    .selectAll('g')
    .data(general[stageId])
    .enter()
    .append('g')
    .attr('id', d => `stage${stageId}-runner${d.number}`)
    .attr(
      'transform',
      d => `translate(${d.rank * 50}, ${height - 50 - stageId * 200})`
    )
    .call(showRiders);

  stageId = 2;
  el.append('g')
    .attr('id', `stage${stageId}`)
    .selectAll('g')
    .data(general[stageId])
    .enter()
    .append('g')
    .attr('id', d => `stage${stageId}-runner${d.number}`)
    .attr(
      'transform',
      d => `translate(${d.rank * 50}, ${height - 50 - stageId * 200})`
    )
    .call(showRiders);

  stageId = 3;
  el.append('g')
    .attr('id', `stage${stageId}`)
    .selectAll('g')
    .data(general[stageId])
    .enter()
    .append('g')
    .attr('id', d => `stage${stageId}-runner${d.number}`)
    .attr(
      'transform',
      d => `translate(${d.rank * 50}, ${height - 50 - stageId * 200})`
    )
    .call(showRiders);
}

load();
