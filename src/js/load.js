import * as d3 from "d3";

// adapted from https://24ways.org/2010/calculating-color-contrast/
function getContrastYIQ(hexcolor) {
  const color = hexcolor[0] === "#" ? hexcolor.slice(1) : hexcolor;
  var r = parseInt(color.substr(0, 2), 16);
  var g = parseInt(color.substr(2, 2), 16);
  var b = parseInt(color.substr(4, 2), 16);
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}

async function getGeneralFromStages(teams) {
  const url =
    "https://raw.githubusercontent.com/severo/tour_de_france_2020_data/master/stages.json";
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
          topRank: id + 1,
          gap: rider.time - bestTime,
          color: teams.get(rider.team).colour,
          labelColor: teams.get(rider.team).labelColor
        }))
      );
      return general;
    },
    [
      stages[0]
        .map(rider => ({
          rank: 1,
          topRank: rider.number,
          name: rider.name,
          number: rider.number,
          team: rider.team,
          stageId: 0,
          time: 0,
          gap: 0,
          color: teams.get(rider.team).colour,
          labelColor: teams.get(rider.team).labelColor
        }))
        .sort((a, b) => a.number > b.number)
    ]
  );

  return general;
}

async function getGeneralFromGeneralClassification(teams) {
  const url =
    "https://raw.githubusercontent.com/severo/tour_de_france_2020_data/master/general_classification.json";
  const response = await fetch(url);
  const stages = await response.json();

  const general = stages.reduce(
    (general, stage, stageId) => {
      const bestTime = stage[0].time;
      general.push(
        stage.map((rider, id) => {
          const previousId = general[stageId].findIndex(
            r => r.number === rider.number
          );
          return {
            previous: general[stageId][previousId],
            name: rider.name,
            number: rider.number,
            team: rider.team,
            time: rider.time,
            stageId: stageId + 1,
            rank: id + 1,
            topRank: id + 1,
            gap: rider.time - bestTime,
            color: teams.get(rider.team).colour,
            labelColor: teams.get(rider.team).labelColor
          };
        })
      );
      return general;
    },
    [
      stages[0]
        .map(rider => ({
          rank: 1,
          topRank: rider.number,
          name: rider.name,
          number: rider.number,
          team: rider.team,
          stageId: 0,
          time: 0,
          gap: 0,
          color: teams.get(rider.team).colour,
          labelColor: teams.get(rider.team).labelColor
        }))
        .sort((a, b) => a.number > b.number)
    ]
  );

  return general;
}

export async function load(
  { filtered, from } = { filtered: true, from: "general" }
) {
  const teams = await d3
    .json(
      "https://raw.githubusercontent.com/severo/tour_de_france_2020_data/master/teams.json"
    )
    .then(
      json =>
        new Map(
          json.map(team => {
            team.labelColor = getContrastYIQ(team.colour);
            return [team.name, team];
          })
        )
    );

  const general =
    from === "stages"
      ? await getGeneralFromStages(teams)
      : await getGeneralFromGeneralClassification(teams);

  // only show the top_n riders of the last classification
  const top_n = 6;
  const stageId = 17;
  //const stageId = general.length - 1;
  const topRiders = general[stageId]
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

  return filtered ? filteredGeneral : general;
}
