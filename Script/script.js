window.Game = window.Game || {};

(() => {
  const Game = window.Game;
  Game.context = window.APP_CONTEXT || {
    isLoggedIn: false,
    autoSaveUrl: '',
    initialSaveData: null,
  };

  const canvas = document.getElementById('trackCanvas');
  const ctx = canvas.getContext('2d');

  Game.refs = {
    canvas,
    ctx,
    addFuelBtn: document.getElementById('addFuelBtn'),
    fuelValue: document.getElementById('fuelValue'),
    fuelCapValue: document.getElementById('fuelCapValue'),
    lapsValue: document.getElementById('lapsValue'),
    coinsValue: document.getElementById('coinsValue'),
    exportSaveBtn: document.getElementById('exportSaveBtn'),
    importSaveBtn: document.getElementById('importSaveBtn'),
    importSaveInput: document.getElementById('importSaveInput'),
    saveStatus: document.getElementById('saveStatus'),
    achievementsBtn: document.getElementById('achievementsBtn'),
    achievementsModal: document.getElementById('achievementsModal'),
    closeAchievementsBtn: document.getElementById('closeAchievementsBtn'),
    achievementsList: document.getElementById('achievementsList'),
    logoutLink: document.getElementById('logoutLink'),
    tabButtons: Array.from(document.querySelectorAll('.tab')),
    tabPanels: Array.from(document.querySelectorAll('.panel')),
  };

  Game.runtime = {
    fuel: 0,
    coins: 0,
    laps: 0,
    t: 0,
    activeTab: 'voiture',
  };

  Game.state = {
    carSpeedLevel: 0,
    carTankLevel: 0,
    addCarLevel: 0,
    fuelPerClickLevel: 0,
    consumptionTimeLevel: 0,
    finishLineLevel: 0,
    lineGoldLevel: 0,
  };

  Game.tabNames = ['voiture', 'essence', 'circuit'];

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

  Game.utils = {
    clampNumber,
    toSafeInt,
    toSafeFloat,
  };

  Game.sanitize = function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  function updateHud() {
    Game.refs.fuelValue.textContent = Game.runtime.fuel.toFixed(1);
    Game.refs.fuelCapValue.textContent = Game.calc.getFuelCap().toFixed(1);
    Game.refs.lapsValue.textContent = String(Game.runtime.laps);
    Game.refs.coinsValue.textContent = String(Game.runtime.coins);
    Game.achievements.evaluate();
  }

  function setActiveTab(tabName) {
    Game.runtime.activeTab = tabName;

    Game.refs.tabButtons.forEach((btn) => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    Game.refs.tabPanels.forEach((panel) => {
      const isActive = panel.dataset.panel === tabName;
      panel.classList.toggle('is-active', isActive);
    });
  }

  Game.ui = {
    updateHud,
    setActiveTab,
  };

  function loop(timestamp) {
    if (!loop.lastTime) loop.lastTime = timestamp;
    const dt = (timestamp - loop.lastTime) / 1000;
    loop.lastTime = timestamp;

    const oldT = Game.runtime.t;

    const speed = Game.calc.getCarSpeed();
    const fuelConsumptionPerSecond = Game.calc.getConsumptionPerSecond();

    if (Game.runtime.fuel > 0) {
      Game.runtime.fuel = Math.max(0, Game.runtime.fuel - fuelConsumptionPerSecond * dt);
      Game.runtime.t += speed * dt;

      while (Game.runtime.t >= Math.PI * 2) {
        Game.runtime.t -= Math.PI * 2;
      }
    }

    const cars = Game.calc.getCarsCount();
    const phaseStep = (Math.PI * 2) / cars;
    let crossedCount = 0;

    for (let i = 0; i < cars; i += 1) {
      const prevCarT = (oldT + i * phaseStep) % (Math.PI * 2);
      const currCarT = (Game.runtime.t + i * phaseStep) % (Math.PI * 2);
      if (prevCarT > currCarT) {
        crossedCount += 1;
      }
    }

    if (crossedCount > 0) {
      Game.runtime.laps += crossedCount;
      Game.runtime.coins += crossedCount * Game.calc.getFinishLineCount() * Game.calc.getCoinsPerLine();
      Game.upgrades.updateShopUi();
    }

    Game.refs.ctx.clearRect(0, 0, Game.refs.canvas.width, Game.refs.canvas.height);
    Game.draw.drawTrack();
    Game.draw.drawCars(cars, Game.runtime.t, phaseStep);

    updateHud();
    requestAnimationFrame(loop);
  }

  function bindCoreEvents() {
    Game.refs.addFuelBtn.addEventListener('click', () => {
      Game.runtime.fuel = Math.min(Game.calc.getFuelCap(), Game.runtime.fuel + Game.calc.getFuelPerClick());
      updateHud();
    });

    Game.refs.tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        setActiveTab(btn.dataset.tab);
      });
    });
  }

  function init() {
    bindCoreEvents();
    Game.upgrades.init();
    Game.achievements.init();
    Game.save.init();

    if (Game.context.isLoggedIn && Game.context.initialSaveData) {
      Game.save.applySaveData(Game.context.initialSaveData);
    } else {
      updateHud();
      Game.upgrades.updateShopUi();
    }

    Game.save.startAutoSave();
    requestAnimationFrame(loop);
  }

  init();
})();
