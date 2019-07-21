const url =
  'https://raw.githubusercontent.com/severo/tour_de_france_2019_data/master/stages.json';
fetch(url)
  .then(response => response.json())
  .then(stages => {
    stages.forEach(stage =>
      document.getElementById('stages').append(`${stage[0].name} - `)
    );
  });
