import * as d3 from "d3";
import {
  annotation,
  annotationCalloutCircle,
  annotationCalloutRect,
  annotationCalloutElbow
} from "d3-svg-annotation";

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
    "https://raw.githubusercontent.com/severo/tour_de_france_2019_data/master/general_classification.json";
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

async function load(filtered = true, from = "general") {
  const teams = await d3
    .json(
      "https://raw.githubusercontent.com/severo/tour_de_france_2019_data/master/teams.json"
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

  svg(filtered ? filteredGeneral : general);
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
          wrap: 240
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
  const stagesAnnotations = {
    1: {
      riderName: "JULIAN ALAPHILIPPE",
      title: "Les favoris groupés",
      text:
        "Les 6 favoris sont à 10 secondes du maillot jaune Mike Teunissen pour cause de bonifications.",
      type: annotationCalloutRect,
      subject: { width: 30, height: 6 * 20 + 30, xOffset: -15, yOffset: -15 }
    },
    2: {
      riderName: "STEVEN KRUIJSWIJK",
      title: "Kruijswijk gagne du temps",
      text: "Jumbo-Visma remporte le contre-la-montre par équipe, devant Ineos",
      type: annotationCalloutCircle
    },
    3: {
      riderName: "JULIAN ALAPHILIPPE",
      title: "Alaphilippe: étape et maillot jaune",
      text: 'Alaphilippe gagne en solitaire et prend 26" sur ses rivaux.',
      type: annotationCalloutCircle
    },
    4: {
      riderName: "JULIAN ALAPHILIPPE",
      title: "Aucun changement",
      text: "Viviani gagne le sprint, tous les favoris dans le peloton.",
      type: annotationCalloutElbow
    },
    5: {
      riderName: "JULIAN ALAPHILIPPE",
      title: "Aucun changement",
      text: "Cette fois, c'est Sagan qui remporte le sprint.",
      type: annotationCalloutElbow
    },
    6: {
      riderName: "STEVEN KRUIJSWIJK",
      title: "Kruijswijk distancé",
      text: `Ciccone profite de l'échapée pour ravir le maillot jaune à Alaphilippe. Dans la côte finale, Thomas reprend 2" sur Alaphilippe et Pinot, 7" sur Buchmann, 9" sur Bernal et 35" sur Kruijswijk.`,
      type: annotationCalloutCircle
    },
    7: {
      riderName: "JULIAN ALAPHILIPPE",
      title: "Aucun changement",
      text: "Nouvelle arrivée au sprint, réglé par Groenewegen.",
      type: annotationCalloutElbow
    },
    8: {
      riderName: "JULIAN ALAPHILIPPE",
      title: "Alaphilippe maillot jaune",
      text: `Alaphilippe et Pinot s'échappent dans la Côte de la Jaillière, et arrivent avec 20" (plus bonifications) sur leurs adversaires.`,
      type: annotationCalloutCircle
    },
    9: {
      riderName: "JULIAN ALAPHILIPPE",
      title: "Aucun changement",
      text: `Victoire d'Impey, tous les favoris arrivent ensemble, à 16'25".`,
      type: annotationCalloutElbow
    },
    10: {
      riderName: "THIBAUT PINOT",
      title: "Pinot dans une bordure",
      text: `Dans une étape venteuse, Pinot a été piégé par une bordure, et perd 1'40" sur ses adversaires directs.`,
      type: annotationCalloutCircle
    },
    11: {
      riderName: "JULIAN ALAPHILIPPE",
      title: "Aucun changement",
      text: `Ewan gagne le sprint, pas d'écart entre les favoris.`,
      type: annotationCalloutElbow
    },
    12: {
      riderName: "JULIAN ALAPHILIPPE",
      title: "Aucun changement",
      text: `Yates gagne à Bagnères-de-Bigorre. Les 6 favoris arrivent ensemble à 9'35".`,
      type: annotationCalloutElbow
    },
    13: {
      riderName: "JULIAN ALAPHILIPPE",
      title: "Alaphilippe gagne le contre-la-montre",
      text: `Alaphilippe conforte son maillot jaune, Thomas est second à 14", Kruijswijk perd 45", Pinot 49" et Buchmann 1'19". Bernal est le plus loin, à 1'36".`,
      type: annotationCalloutCircle
    },
    14: {
      riderName: "THIBAUT PINOT",
      title: "Thibaut vainqueur au Tourmalet",
      text: `Victoire de Thibault, Alaphilippe arrive avec Kruijswijk à 6", et les trois empochent des bonifications. Buchmann et Bernal arrivent à 8", et Thomas perd 36".`,
      type: annotationCalloutCircle
    },
    15: {
      riderName: "THIBAUT PINOT",
      title: "Thibaut reprend encore du temps",
      text: `Deuxième derrière Yates, Thibaut fait une bonne opération : 18" d'avance sur Buchmann et Bernal, 49" sur Thomas et Kruijswijk, et 1'49" sur Alaphilippe qui garde le maillot jaune.`,
      type: annotationCalloutCircle
    },
    16: {
      riderName: "JULIAN ALAPHILIPPE",
      title: "Aucun changement",
      text: `Victoire au sprint pour Ewan. Pas de changement entre les favoris.`,
      type: annotationCalloutElbow
    },
    17: {
      riderName: "JULIAN ALAPHILIPPE",
      title: "Aucun changement",
      text: `Les favoris arrivent ensemble, 20'10" derrière Trentin qui gagne l'étape.`,
      type: annotationCalloutElbow
    },
    18: {
      riderName: "EGAN BERNAL",
      title: `Bernal deuxième du classement`,
      text: `Parti dans le Galibier, Bernal prend 32" sur les autres favoris qui arrivent ensemble, Alaphilippe ayant réussi à rentrer dans la descente.`,
      type: annotationCalloutCircle
    },
    19: {
      riderName: "EGAN BERNAL",
      title: `Bernal prend le maillot jaune`,
      text: `Dans une étape écourtée par la météo, les temps ont été pris en haut de l'Isoard. Bernal qui avait attaqué à 6km du col, passe avec 1'06" d'avance sur Thomas, Kruijswijk et Buchmann. Alaphilippe perd 2'15" et son maillot jaune. Pinot avait abandonné sur blessure.`,
      type: annotationCalloutCircle
    },
    20: {
      riderName: "JULIAN ALAPHILIPPE",
      title: "Alaphilippe perd pied",
      text: `Alaphilippe passe de la deuxième à la cinquième place lors d'une étape écourtée, en perdant 3" dans la montée de 33 kilomètres. Bernal et Thomas arrivent ensemble, à 17" du vainqueur Nibali, et 6" devant Buchmann et Kruijswijk. Bernal est maillot jaune.`,
      type: annotationCalloutCircle
    }
  };
  const width = 1200;
  const margin = {
    left: 400,
    right: 150,
    stages: { top: 40, bottom: 40 },
    ranks: { top: 80, bottom: 160 },
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

load();
