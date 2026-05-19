<?php
$projectName = 'Prototype Clicker Voiture';
$today = date('d/m/Y');
$cssVersion = file_exists(__DIR__ . '/style.css') ? (string) filemtime(__DIR__ . '/style.css') : '1';
$jsVersion = file_exists(__DIR__ . '/script.js') ? (string) filemtime(__DIR__ . '/script.js') : '1';
?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo htmlspecialchars($projectName, ENT_QUOTES, 'UTF-8'); ?></title>
  <link rel="stylesheet" href="style.css?v=<?php echo htmlspecialchars($cssVersion, ENT_QUOTES, 'UTF-8'); ?>">
</head>
<body>
  <main class="app">
    <header class="topbar">
      <h1><?php echo htmlspecialchars($projectName, ENT_QUOTES, 'UTF-8'); ?></h1>
      <p>Demo du <?php echo htmlspecialchars($today, ENT_QUOTES, 'UTF-8'); ?></p>
    </header>

    <section class="hud">
      <button id="addFuelBtn" type="button">+1s carburant</button>
      <div class="stat">
        Carburant: <strong id="fuelValue">0.0</strong>s
      </div>
      <div class="stat">
        Reserve max: <strong id="fuelCapValue">5.0</strong>s
      </div>
      <div class="stat">
        Tours: <strong id="lapsValue">0</strong>
      </div>
      <div class="stat">
        Pieces: <strong id="coinsValue">0</strong>
      </div>
    </section>

    <section class="game-layout">
      <div class="track-wrap">
        <canvas id="trackCanvas" width="960" height="540" aria-label="Circuit en forme d'infini"></canvas>
      </div>

      <aside class="shop">
        <h2>Boutique d'amelioration</h2>
        <div class="save-tools">
          <button id="exportSaveBtn" type="button">Exporter sauvegarde (.json)</button>
          <button id="importSaveBtn" type="button">Importer sauvegarde</button>
          <input id="importSaveInput" type="file" accept="application/json,.json" hidden>
          <p id="saveStatus" class="save-status" aria-live="polite"></p>
        </div>
        <div class="tabs" role="tablist" aria-label="Onglets boutique">
          <button id="tabVoiture" class="tab is-active" type="button" data-tab="voiture" role="tab" aria-selected="true">Voiture</button>
          <button id="tabEssence" class="tab" type="button" data-tab="essence" role="tab" aria-selected="false">Essence</button>
          <button id="tabCircuit" class="tab" type="button" data-tab="circuit" role="tab" aria-selected="false">Circuit</button>
        </div>

        <div id="panelVoiture" class="panel is-active" data-panel="voiture" role="tabpanel" aria-labelledby="tabVoiture">
          <button id="buyCarSpeed" class="upgrade" type="button">
            <span>Vitesse</span>
            <small>Niv. <strong id="lvlCarSpeed">0</strong> - Cout: <strong id="costCarSpeed">10</strong></small>
          </button>
          <button id="buyCarTank" class="upgrade" type="button">
            <span>Reservoire</span>
            <small>Niv. <strong id="lvlCarTank">0</strong> - Cout: <strong id="costCarTank">12</strong></small>
          </button>
          <button id="buyAddCar" class="upgrade" type="button">
            <span>Ajout d'une voiture</span>
            <small>Niv. <strong id="lvlAddCar">0</strong> - Cout: <strong id="costAddCar">25</strong></small>
          </button>
        </div>

        <div id="panelEssence" class="panel" data-panel="essence" role="tabpanel" aria-labelledby="tabEssence">
          <button id="buyFuelPerClick" class="upgrade" type="button">
            <span>Essence par click</span>
            <small>Niv. <strong id="lvlFuelPerClick">0</strong> - Cout: <strong id="costFuelPerClick">8</strong></small>
          </button>
          <button id="buyFuelReserve" class="upgrade" type="button">
            <span>Reserve possible</span>
            <small>Niv. <strong id="lvlFuelReserve">0</strong> - Cout: <strong id="costFuelReserve">14</strong></small>
          </button>
          <button id="buyConsumptionTime" class="upgrade" type="button">
            <span>Temps de consomation</span>
            <small>Niv. <strong id="lvlConsumptionTime">0</strong> - Cout: <strong id="costConsumptionTime">16</strong></small>
          </button>
        </div>

        <div id="panelCircuit" class="panel" data-panel="circuit" role="tabpanel" aria-labelledby="tabCircuit">
          <button id="buyFinishLine" class="upgrade" type="button">
            <span>Ajout d'une autre ligne d'arrive</span>
            <small>Niv. <strong id="lvlFinishLine">0</strong> - Cout: <strong id="costFinishLine">35</strong></small>
          </button>
        </div>
      </aside>
    </section>
  </main>

  <script src="script.js?v=<?php echo htmlspecialchars($jsVersion, ENT_QUOTES, 'UTF-8'); ?>"></script>
</body>
</html>
