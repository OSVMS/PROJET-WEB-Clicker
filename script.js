// ============================================================
// Initialisation — Récupération des éléments DOM et variables
// ============================================================
const canvas = document.getElementById('trackCanvas');
const ctx = canvas.getContext('2d');

const addFuelBtn = document.getElementById('addFuelBtn');
const fuelValue = document.getElementById('fuelValue');
const fuelCapValue = document.getElementById('fuelCapValue');
const lapsValue = document.getElementById('lapsValue');
const coinsValue = document.getElementById('coinsValue');
const exportSaveBtn = document.getElementById('exportSaveBtn');
const importSaveBtn = document.getElementById('importSaveBtn');
const importSaveInput = document.getElementById('importSaveInput');
const saveStatus = document.getElementById('saveStatus');

const tabButtons = Array.from(document.querySelectorAll('.tab'));
const tabPanels = Array.from(document.querySelectorAll('.panel'));

const center = { x: canvas.width / 2, y: canvas.height / 2 + 10 };
const trackScale = 170;

let fuel = 0;
let coins = 0;
let laps = 0;
let t = 0;
const carColors = [];

// ============================================================
// État du jeu — Niveaux des améliorations
// ============================================================
const state = {
  carSpeedLevel: 0,
  carTankLevel: 0,
  addCarLevel: 0,
  fuelPerClickLevel: 0,
  consumptionTimeLevel: 0,
  finishLineLevel: 0,
  lineGoldLevel: 0,
};

// ============================================================
// Définitions des améliorations — Coûts, niveaux et éléments UI
// ============================================================
const upgradeDefs = {
  carSpeed: {
    levelKey: 'carSpeedLevel',
    costBase: 10,
    costFactor: 1.55,
    levelEl: document.getElementById('lvlCarSpeed'),
    costEl: document.getElementById('costCarSpeed'),
    buttonEl: document.getElementById('buyCarSpeed'),
  },
  carTank: {
    levelKey: 'carTankLevel',
    costBase: 12,
    costFactor: 1.6,
    levelEl: document.getElementById('lvlCarTank'),
    costEl: document.getElementById('costCarTank'),
    buttonEl: document.getElementById('buyCarTank'),
  },
  addCar: {
    levelKey: 'addCarLevel',
    costBase: 25,
    costFactor: 1.8,
    levelEl: document.getElementById('lvlAddCar'),
    costEl: document.getElementById('costAddCar'),
    buttonEl: document.getElementById('buyAddCar'),
  },
  fuelPerClick: {
    levelKey: 'fuelPerClickLevel',
    costBase: 8,
    costFactor: 1.5,
    levelEl: document.getElementById('lvlFuelPerClick'),
    costEl: document.getElementById('costFuelPerClick'),
    buttonEl: document.getElementById('buyFuelPerClick'),
  },
  consumptionTime: {
    levelKey: 'consumptionTimeLevel',
    costBase: 16,
    costFactor: 1.7,
    levelEl: document.getElementById('lvlConsumptionTime'),
    costEl: document.getElementById('costConsumptionTime'),
    buttonEl: document.getElementById('buyConsumptionTime'),
  },
  finishLine: {
    levelKey: 'finishLineLevel',
    costBase: 35,
    costFactor: 2,
    levelEl: document.getElementById('lvlFinishLine'),
    costEl: document.getElementById('costFinishLine'),
    buttonEl: document.getElementById('buyFinishLine'),
  },
  lineGold: {
    levelKey: 'lineGoldLevel',
    costBase: 30,
    costFactor: 1.8,
    levelEl: document.getElementById('lvlLineGold'),
    costEl: document.getElementById('costLineGold'),
    buttonEl: document.getElementById('buyLineGold'),
  },
};

const upgradesByCategory = {
  voiture: ['carSpeed', 'addCar'],
  essence: ['fuelPerClick', 'carTank', 'consumptionTime'],
  circuit: ['finishLine', 'lineGold'],
};

// ============================================================
// Onglets — Gestion de la navigation par onglets
// ============================================================
const tabNames = ['voiture', 'essence', 'circuit'];
let activeTab = 'voiture';

// ============================================================
// Fonctions de calcul — Valeurs dérivées des niveaux d'amélioration
// ============================================================
function getUpgradeCost(def) {
  const level = state[def.levelKey];
  return Math.floor(def.costBase * (def.costFactor ** level));
}

function getFuelCap() {
  return 5 + state.carTankLevel * 3;
}

function getFuelPerClick() {
  return 1 + state.fuelPerClickLevel * 0.5;
}

function getCarsCount() {
  return 1 + state.addCarLevel;
}

function getCarSpeed() {
  return 1.15 * (1 + state.carSpeedLevel * 0.14);
}

function getConsumptionPerSecond() {
  const base = 1 * getCarsCount();
  const reduction = 1 + state.consumptionTimeLevel * 0.2;
  return base / reduction;
}

function getFinishLineCount() {
  return 1 + state.finishLineLevel;
}

function getCoinsPerLine() {
  return 1 + state.lineGoldLevel;
}

// ============================================================
// Fonctions utilitaires — Validation et sécurisation des données
// ============================================================
function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function toSafeInt(value, min = 0, max = 999999) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.floor(clampNumber(parsed, min, max));
}

function toSafeFloat(value, min = 0, max = 999999) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return clampNumber(parsed, min, max);
}

// ============================================================
// Génération graphique — Tracé du circuit et des voitures
// ============================================================
function lemniscatePoint(angle) {
  const denom = 1 + Math.sin(angle) ** 2;
  const x = center.x + (trackScale * Math.cos(angle)) / denom;
  const y = center.y + (trackScale * Math.sin(angle) * Math.cos(angle)) / denom;
  return { x, y };
}

function drawTrack() {
  ctx.save();
  ctx.lineWidth = 28;
  ctx.strokeStyle = '#c8c0b3';
  ctx.lineCap = 'round';
  ctx.beginPath();

  for (let i = 0; i <= 720; i += 1) {
    const a = (i / 720) * Math.PI * 2;
    const p = lemniscatePoint(a);
    if (i === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }

  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.strokeStyle = '#7f7466';
  ctx.setLineDash([10, 8]);
  ctx.stroke();

  drawFinishLines();
  ctx.restore();
}

function drawFinishLines() {
  const count = getFinishLineCount();
  const spacing = (Math.PI * 2) / count;

  ctx.save();
  ctx.setLineDash([]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  ctx.lineCap = 'round';

  for (let i = 0; i < count; i += 1) {
    const finishAngle = i * spacing;
    const p = lemniscatePoint(finishAngle);
    const tangent = getHeading(finishAngle);
    const normal = tangent + Math.PI / 2;
    const halfLength = 14;

    const x1 = p.x + Math.cos(normal) * halfLength;
    const y1 = p.y + Math.sin(normal) * halfLength;
    const x2 = p.x - Math.cos(normal) * halfLength;
    const y2 = p.y - Math.sin(normal) * halfLength;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  ctx.restore();
}

function generateRandomCarColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 55 + Math.floor(Math.random() * 25);
  const lightness = 28 + Math.floor(Math.random() * 18);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function ensureCarColors(count) {
  while (carColors.length < count) {
    carColors.push(generateRandomCarColor());
  }
}

function drawCar(point, angle, bodyColor) {
  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(angle);

  ctx.fillStyle = bodyColor;
  ctx.fillRect(-13, -8, 26, 16);

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-7, -6, 14, 6);

  ctx.fillStyle = '#1f2a2e';
  ctx.beginPath();
  ctx.arc(-8, 9, 4, 0, Math.PI * 2);
  ctx.arc(8, 9, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function getHeading(angle) {
  const p1 = lemniscatePoint(angle);
  const p2 = lemniscatePoint(angle + 0.01);
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

// ============================================================
// Interface utilisateur — Mise à jour du HUD et de la boutique
// ============================================================
function updateHud() {
  fuelValue.textContent = fuel.toFixed(1);
  fuelCapValue.textContent = getFuelCap().toFixed(1);
  lapsValue.textContent = String(laps);
  coinsValue.textContent = String(coins);
}

function updateShopUi() {
  Object.values(upgradeDefs).forEach((def) => {
    const level = state[def.levelKey];
    const cost = getUpgradeCost(def);
    def.levelEl.textContent = String(level);
    def.costEl.textContent = String(cost);
    def.buttonEl.disabled = coins < cost;
  });
}

// ============================================================
// Fonction buyUpgrade — Achat d'une amélioration
// ============================================================
function buyUpgrade(key) {
  const def = upgradeDefs[key];
  const cost = getUpgradeCost(def);
  if (coins < cost) return;

  coins -= cost;
  state[def.levelKey] += 1;
  fuel = Math.min(fuel, getFuelCap());

  updateHud();
  updateShopUi();
}

// ============================================================
// Fonction setActiveTab — Changement d'onglet actif
// ============================================================
function setActiveTab(tabName) {
  activeTab = tabName;
  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.dataset.panel === tabName;
    panel.classList.toggle('is-active', isActive);
  });
}

function organizeUpgradesByCategory() {
  Object.entries(upgradesByCategory).forEach(([category, upgradeKeys]) => {
    const panel = tabPanels.find((item) => item.dataset.panel === category);
    if (!panel) return;

    upgradeKeys.forEach((key) => {
      const def = upgradeDefs[key];
      if (!def || !def.buttonEl) return;
      panel.appendChild(def.buttonEl);
    });
  });
}

// ============================================================
// Sauvegarde — Export, import et application des données de jeu
// ============================================================
function getSaveData() {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    fuel,
    coins,
    laps,
    t,
    activeTab,
    state: { ...state },
  };
}

function applySaveData(saveData) {
  if (!saveData || typeof saveData !== 'object') {
    throw new Error('Format de sauvegarde invalide.');
  }

  const nextState = saveData.state && typeof saveData.state === 'object' ? saveData.state : {};

  Object.keys(state).forEach((key) => {
    state[key] = toSafeInt(nextState[key], 0, 5000);
  });

  coins = toSafeInt(saveData.coins, 0, 999999999);
  laps = toSafeInt(saveData.laps, 0, 999999999);
  t = toSafeFloat(saveData.t, 0, Math.PI * 2);
  fuel = toSafeFloat(saveData.fuel, 0, getFuelCap());

  const wantedTab = typeof saveData.activeTab === 'string' ? saveData.activeTab : 'voiture';
  setActiveTab(tabNames.includes(wantedTab) ? wantedTab : 'voiture');

  updateHud();
  updateShopUi();
}

function exportSaveToJson() {
  const saveData = getSaveData();
  const payload = JSON.stringify(saveData, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  a.href = url;
  a.download = `save-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  saveStatus.textContent = 'Sauvegarde exportee en JSON.';
}

async function importSaveFromFile(file) {
  if (!file) return;

  try {
    const text = await file.text();
    const saveData = JSON.parse(text);
    applySaveData(saveData);
    saveStatus.textContent = 'Sauvegarde importee avec succes.';
  } catch (error) {
    saveStatus.textContent = 'Erreur: fichier JSON invalide.';
  }
}

// ============================================================
// Boucle de jeu — Mise à jour et rendu à chaque frame
// ============================================================
function loop(timestamp) {
  if (!loop.lastTime) loop.lastTime = timestamp;
  const dt = (timestamp - loop.lastTime) / 1000;
  loop.lastTime = timestamp;

  const oldT = t;

  const speed = getCarSpeed();
  const fuelConsumptionPerSecond = getConsumptionPerSecond();

  if (fuel > 0) {
    fuel = Math.max(0, fuel - fuelConsumptionPerSecond * dt);
    t += speed * dt;

    while (t >= Math.PI * 2) {
      t -= Math.PI * 2;
    }
  }

  const cars = getCarsCount();
  const phaseStep = (Math.PI * 2) / cars;
  let crossedCount = 0;
  for (let i = 0; i < cars; i += 1) {
    const prevCarT = (oldT + i * phaseStep) % (Math.PI * 2);
    const currCarT = (t + i * phaseStep) % (Math.PI * 2);
    if (prevCarT > currCarT) {
      crossedCount += 1;
    }
  }

  if (crossedCount > 0) {
    laps += crossedCount;
    coins += crossedCount * getFinishLineCount() * getCoinsPerLine();
    updateShopUi();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack();

  ensureCarColors(cars);

  for (let i = 0; i < cars; i += 1) {
    const carT = (t + i * phaseStep) % (Math.PI * 2);
    const carPos = lemniscatePoint(carT);
    const heading = getHeading(carT);
    drawCar(carPos, heading, carColors[i]);
  }

  updateHud();
  requestAnimationFrame(loop);
}

// ============================================================
// Événements — Liaison des interactions utilisateur
// ============================================================
addFuelBtn.addEventListener('click', () => {
  fuel = Math.min(getFuelCap(), fuel + getFuelPerClick());
  updateHud();
});

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    setActiveTab(btn.dataset.tab);
  });
});

exportSaveBtn.addEventListener('click', () => {
  exportSaveToJson();
});

importSaveBtn.addEventListener('click', () => {
  importSaveInput.click();
});

importSaveInput.addEventListener('change', async (event) => {
  const selectedFile = event.target.files && event.target.files[0] ? event.target.files[0] : null;
  await importSaveFromFile(selectedFile);
  event.target.value = '';
});

upgradeDefs.carSpeed.buttonEl.addEventListener('click', () => buyUpgrade('carSpeed'));
upgradeDefs.carTank.buttonEl.addEventListener('click', () => buyUpgrade('carTank'));
upgradeDefs.addCar.buttonEl.addEventListener('click', () => buyUpgrade('addCar'));
upgradeDefs.fuelPerClick.buttonEl.addEventListener('click', () => buyUpgrade('fuelPerClick'));
upgradeDefs.consumptionTime.buttonEl.addEventListener('click', () => buyUpgrade('consumptionTime'));
upgradeDefs.finishLine.buttonEl.addEventListener('click', () => buyUpgrade('finishLine'));
upgradeDefs.lineGold.buttonEl.addEventListener('click', () => buyUpgrade('lineGold'));

// ============================================================
// Démarrage — Initialisation de l'affichage et lancement du jeu
// ============================================================

updateHud();
organizeUpgradesByCategory();
updateShopUi();
requestAnimationFrame(loop);
