window.Game = window.Game || {};

(() => {
  const Game = window.Game;
  let autoSaveTimer = null;

  function getSaveData() {
    return {
      version: 1,
      savedAt: new Date().toISOString(),
      fuel: Game.runtime.fuel,
      coins: Game.runtime.coins,
      laps: Game.runtime.laps,
      t: Game.runtime.t,
      activeTab: Game.runtime.activeTab,
      state: { ...Game.state },
      achievements: Game.achievements.serialize(),
    };
  }

  function applySaveData(saveData) {
    if (!saveData || typeof saveData !== 'object') {
      throw new Error('Format de sauvegarde invalide.');
    }

    const nextState = saveData.state && typeof saveData.state === 'object' ? saveData.state : {};

    Object.keys(Game.state).forEach((key) => {
      Game.state[key] = Game.utils.toSafeInt(nextState[key], 0, 5000);
    });

    Game.runtime.coins = Game.utils.toSafeInt(saveData.coins, 0, 999999999);
    Game.runtime.laps = Game.utils.toSafeInt(saveData.laps, 0, 999999999);
    Game.runtime.t = Game.utils.toSafeFloat(saveData.t, 0, Math.PI * 2);
    Game.runtime.fuel = Game.utils.toSafeFloat(saveData.fuel, 0, Game.calc.getFuelCap());

    Game.achievements.applyFromSave(saveData.achievements);

    const wantedTab = typeof saveData.activeTab === 'string' ? saveData.activeTab : 'voiture';
    Game.ui.setActiveTab(Game.tabNames.includes(wantedTab) ? wantedTab : 'voiture');

    Game.ui.updateHud();
    Game.achievements.updateUi();
    Game.upgrades.updateShopUi();
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
    Game.refs.saveStatus.textContent = 'Sauvegarde exportee en JSON.';
  }

  async function importSaveFromFile(file) {
    if (!file) return;

    try {
      const text = await file.text();
      const saveData = JSON.parse(text);
      applySaveData(saveData);
      Game.refs.saveStatus.textContent = 'Sauvegarde importee avec succes.';
    } catch (error) {
      Game.refs.saveStatus.textContent = 'Erreur: fichier JSON invalide.';
    }
  }

  async function pushAutoSaveToServer(options = {}) {
    const useBeacon = Boolean(options.useBeacon);

    if (!Game.context || !Game.context.isLoggedIn || !Game.context.autoSaveUrl) {
      return;
    }

    const payload = JSON.stringify(getSaveData());

    try {
      if (useBeacon && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(Game.context.autoSaveUrl, blob);
        return;
      }

      await fetch(Game.context.autoSaveUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });
    } catch (error) {
      // Ignore background autosave network errors.
    }
  }

  function startAutoSave() {
    if (!Game.context || !Game.context.isLoggedIn) return;

    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
    }

    autoSaveTimer = setInterval(() => {
      pushAutoSaveToServer();
    }, 30000);

    pushAutoSaveToServer();
  }

  function bindEvents() {
    if (Game.context && Game.context.isLoggedIn && Game.refs.logoutLink) {
      Game.refs.logoutLink.addEventListener('click', (event) => {
        event.preventDefault();
        const targetUrl = Game.refs.logoutLink.getAttribute('href') || 'logout.php';
        pushAutoSaveToServer({ useBeacon: true });
        window.location.href = targetUrl;
      });
    }

    if (Game.refs.exportSaveBtn && Game.refs.importSaveBtn && Game.refs.importSaveInput) {
      Game.refs.exportSaveBtn.addEventListener('click', () => {
        exportSaveToJson();
      });

      Game.refs.importSaveBtn.addEventListener('click', () => {
        Game.refs.importSaveInput.click();
      });

      Game.refs.importSaveInput.addEventListener('change', async (event) => {
        const selectedFile = event.target.files && event.target.files[0] ? event.target.files[0] : null;
        await importSaveFromFile(selectedFile);
        event.target.value = '';
      });
    }
  }

  function init() {
    bindEvents();
  }

  Game.save = {
    init,
    getSaveData,
    applySaveData,
    exportSaveToJson,
    importSaveFromFile,
    startAutoSave,
  };
})();
