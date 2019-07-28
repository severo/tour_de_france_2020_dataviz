import {
  annotation,
  annotationCalloutCircle,
  annotationCalloutRect,
  annotationCalloutElbow
} from "d3-svg-annotation";

export const stagesAnnotations = {
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

function createAnnotation(dims, stageAnnotations, riders) {
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
          wrap: dims.width
        },
        nx: dims.x,
        ny: dims.y,
        subject: subject,
        x: dims.rider.getX(rider) + subject.xOffset,
        y: dims.rider.getY(rider) + subject.yOffset
      }
    ]);
}

export function showAnnotations(parent, dims, general, stageId) {
  const g = parent.append("g").attr("id", `annotations-stage${stageId}`);

  if (stageId in stagesAnnotations) {
    const tooltip = g.append("g").classed("annotation", true);
    tooltip.call(
      createAnnotation(dims, stagesAnnotations[stageId], general[stageId])
    );
  }
  return g;
}
