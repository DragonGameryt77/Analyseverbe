let verbs = {};
let terminaisons = {};

Promise.all([
  fetch('verbes_flat.json').then(res => res.json()),
  fetch('terminaisons.json').then(res => res.json())
]).then(([verbsData, termData]) => {
  verbs = verbsData;
  terminaisons = termData;
}).catch(err => {
  console.error("Erreur lors du chargement des fichiers JSON :", err);
  document.getElementById('resultats').innerHTML = "<p>Erreur de chargement des données.</p>";
});

function analyserVerbe() {
  const input = document.getElementById("inputVerb").value.trim().toLowerCase();
  const resultDiv = document.getElementById("resultats");
  resultDiv.innerHTML = "";

  if (!input) {
    resultDiv.innerHTML = "<p>Veuillez entrer un verbe.</p>";
    return;
  }

  if (input in verbs) {
    // Verbe reconnu comme infinitif
    const groupe = verbs[input];
    resultDiv.innerHTML = `<p><strong>${input}</strong> est un verbe du <strong>${groupe}</strong>.</p>`;
    return;
  }

  // Sinon on essaie d’analyser la terminaison
  let possibleMatches = [];

  // Parcourir chaque mode, temps, groupe, terminaisons
  for (const mode in terminaisons) {
    for (const temps in terminaisons[mode]) {
      for (const groupe in terminaisons[mode][temps]) {
        const termList = terminaisons[mode][temps][groupe];
        for (const term of termList) {
          if (input.endsWith(term)) {
            possibleMatches.push({
              groupe,
              mode,
              temps,
              terminaison: term
            });
          }
        }
      }
    }
  }

  if (possibleMatches.length === 0) {
    resultDiv.innerHTML = `<p>Le verbe "<strong>${input}</strong>" n’est pas reconnu et aucune terminaison connue ne correspond.</p>`;
    return;
  }

  // Affichage des résultats possibles, sans doublons
  let seen = new Set();
  let output = `<p><strong>${input}</strong> n’est pas reconnu comme infinitif. Il pourrait être conjugué à :</p><ul>`;

  for (const match of possibleMatches) {
    const key = `${match.groupe}-${match.mode}-${match.temps}-${match.terminaison}`;
    if (!seen.has(key)) {
      seen.add(key);
      output += `<li>${match.groupe}, ${match.temps} (${match.mode}) [terminaison : ${match.terminaison}]</li>`;
    }
  }
  output += "</ul>";
  resultDiv.innerHTML = output;
}
