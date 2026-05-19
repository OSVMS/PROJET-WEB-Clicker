window.Game = window.Game || {};

(() => {
  const Game = window.Game;

  const defs = {
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

  const byCategory = {
    voiture: ['carSpeed', 'addCar'],
    essence: ['fuelPerClick', 'carTank', 'consumptionTime'],
    circuit: ['finishLine', 'lineGold'],
  };

  function getUpgradeCost(def) {
    const level = Game.state[def.levelKey];
    return Math.floor(def.costBase * (def.costFactor ** level));
  }

  function getFuelCap() {
    return 5 + Game.state.carTankLevel * 3;
  }

  function getFuelPerClick() {
    return 1 + Game.state.fuelPerClickLevel * 0.5;
  }

  function getCarsCount() {
    return 1 + Game.state.addCarLevel;
  }

  function getCarSpeed() {
    return 1.15 * (1 + Game.state.carSpeedLevel * 0.14);
  }

  function getConsumptionPerSecond() {
    const base = getCarsCount();
    const reduction = 1 + Game.state.consumptionTimeLevel * 0.2;
    return base / reduction;
  }

  function getFinishLineCount() {
    return 1 + Game.state.finishLineLevel;
  }

  function getCoinsPerLine() {
    return 1 + Game.state.lineGoldLevel;
  }

  function updateShopUi() {
    Object.values(defs).forEach((def) => {
      const level = Game.state[def.levelKey];
      const cost = getUpgradeCost(def);
      def.levelEl.textContent = String(level);
      def.costEl.textContent = String(cost);
      def.buttonEl.disabled = Game.runtime.coins < cost;
    });
  }

  function buyUpgrade(key) {
    const def = defs[key];
    const cost = getUpgradeCost(def);
    if (Game.runtime.coins < cost) return;

    Game.runtime.coins -= cost;
    Game.state[def.levelKey] += 1;
    Game.runtime.fuel = Math.min(Game.runtime.fuel, getFuelCap());

    Game.ui.updateHud();
    updateShopUi();
  }

  function organizeUpgradesByCategory() {
    Object.entries(byCategory).forEach(([category, upgradeKeys]) => {
      const panel = Game.refs.tabPanels.find((item) => item.dataset.panel === category);
      if (!panel) return;

      upgradeKeys.forEach((key) => {
        const def = defs[key];
        if (!def || !def.buttonEl) return;
        panel.appendChild(def.buttonEl);
      });
    });
  }

  function bindEvents() {
    Object.keys(defs).forEach((key) => {
      defs[key].buttonEl.addEventListener('click', () => {
        buyUpgrade(key);
      });
    });
  }

  function init() {
    organizeUpgradesByCategory();
    bindEvents();
  }

  Game.calc = {
    getUpgradeCost,
    getFuelCap,
    getFuelPerClick,
    getCarsCount,
    getCarSpeed,
    getConsumptionPerSecond,
    getFinishLineCount,
    getCoinsPerLine,
  };

  Game.upgrades = {
    defs,
    byCategory,
    init,
    updateShopUi,
    buyUpgrade,
    organizeUpgradesByCategory,
  };
})();
