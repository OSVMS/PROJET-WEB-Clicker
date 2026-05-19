<?php
session_start();
require_once __DIR__ . '/db.php';

$projectName = 'Racing Clicker';
$today = date('d/m/Y');
$isLoggedIn = isset($_SESSION['user_id']);
$username = (string) ($_SESSION['username'] ?? 'Invite');
$initialSaveData = null;

if ($isLoggedIn) {
  try {
    $initialSaveData = loadUserSaveData((int) $_SESSION['user_id']);
  } catch (Throwable $error) {
    $initialSaveData = null;
  }
}

$appContext = [
  'isLoggedIn' => $isLoggedIn,
  'autoSaveUrl' => 'autosave.php',
  'initialSaveData' => $initialSaveData,
  'userId' => $isLoggedIn ? (int) $_SESSION['user_id'] : null,
];

$cssVersion = file_exists(__DIR__ . '/style.css') ? (string) filemtime(__DIR__ . '/style.css') : '1';
$jsVersion = file_exists(__DIR__ . '/Script/script.js') ? (string) filemtime(__DIR__ . '/Script/script.js') : '1';
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
      <div class="account-box">
        <?php if ($isLoggedIn): ?>
          <span>Connecte: <?php echo htmlspecialchars($username, ENT_QUOTES, 'UTF-8'); ?></span>
          <a id="logoutLink" class="logout-link" href="logout.php">Se deconnecter</a>
        <?php else: ?>
          <span>Mode invite</span>
          <a class="logout-link" href="auth.php">Se connecter</a>
        <?php endif; ?>
      </div>
    </header>

    <section class="hud">
      <button id="addFuelBtn" type="button">+ Carburant</button>
      <div class="stat">
        Carburant: <strong id="fuelValue">0.0</strong>L
      </div>
      <div class="stat">
        Reserve max: <strong id="fuelCapValue">5.0</strong>L
      </div>
      <div class="stat">
        Tours: <strong id="lapsValue">0</strong>
      </div>
      <div class="stat">
        Pieces: <strong id="coinsValue">0</strong>
      </div>
      <button id="achievementsBtn" class="hud-trophy" type="button" aria-label="Ouvrir les succes">&#127942;</button>
    </section>

    <section id="achievementsModal" class="achievements-modal" aria-hidden="true">
      <div class="achievements-card" role="dialog" aria-modal="true" aria-labelledby="achievementsTitle">
        <div class="achievements-head">
          <h2 id="achievementsTitle">Succes</h2>
          <button id="closeAchievementsBtn" type="button">Fermer</button>
        </div>
        <ul id="achievementsList" class="achievements-list"></ul>
      </div>
    </section>

    <section class="game-layout">
      <div class="track-wrap">
        <canvas id="trackCanvas" width="960" height="540" aria-label="Circuit en 8"></canvas>
      </div>

      <aside class="shop">
        <h2>Boutique d'amelioration</h2>
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
          <button id="buyLineGold" class="upgrade" type="button">
            <span>Or gagne par ligne</span>
            <small>Niv. <strong id="lvlLineGold">0</strong> - Cout: <strong id="costLineGold">30</strong></small>
          </button>
        </div>
      </aside>

        <?php if ($isLoggedIn): ?>
          <section class="leaderboard-section">
            <h2>Classement</h2>
            <div id="leaderboardList" class="leaderboard-list"></div>
          </section>
        <?php else: ?>
          <section class="save-panel">
            <h2>Sauvegarde</h2>
            <div class="save-tools">
              <button id="exportSaveBtn" type="button">Exporter sauvegarde (.json)</button>
              <button id="importSaveBtn" type="button">Importer sauvegarde</button>
              <input id="importSaveInput" type="file" accept="application/json,.json" hidden>
              <p id="saveStatus" class="save-status" aria-live="polite"></p>
            </div>
          </section>
        <?php endif; ?>
    </section>
  </main>

  <script>
    window.APP_CONTEXT = <?php echo json_encode($appContext, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>;
  </script>
  <script src="Script/draw.js?v=<?php echo htmlspecialchars($jsVersion, ENT_QUOTES, 'UTF-8'); ?>"></script>
  <script src="Script/upgrades.js?v=<?php echo htmlspecialchars($jsVersion, ENT_QUOTES, 'UTF-8'); ?>"></script>
  <script src="Script/achievements.js?v=<?php echo htmlspecialchars($jsVersion, ENT_QUOTES, 'UTF-8'); ?>"></script>
  <script src="Script/leaderboard.js?v=<?php echo htmlspecialchars($jsVersion, ENT_QUOTES, 'UTF-8'); ?>"></script>
  <script src="Script/save.js?v=<?php echo htmlspecialchars($jsVersion, ENT_QUOTES, 'UTF-8'); ?>"></script>
  <script src="Script/script.js?v=<?php echo htmlspecialchars($jsVersion, ENT_QUOTES, 'UTF-8'); ?>"></script>
</body>
</html>
