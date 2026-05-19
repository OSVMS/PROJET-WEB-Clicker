window.Game = window.Game || {};

(() => {
  const Game = window.Game;
  const unlocked = {};

  const defs = [
    {
      id: 'firstLap',
      label: 'Faire 1 tour complet',
      isUnlocked: () => Game.runtime.laps >= 1,
    },
    {
      id: 'fiveCars',
      label: 'Avoir 5 voitures',
      isUnlocked: () => Game.calc.getCarsCount() >= 5,
    },
    {
      id: 'hundredCoins',
      label: 'Avoir 100 pieces',
      isUnlocked: () => Game.runtime.coins >= 100,
    },
    {
      id: 'fullTank',
      label: 'Remplir completement le reservoir',
      isUnlocked: () => Game.runtime.fuel >= Game.calc.getFuelCap() - 0.001,
    },
    {
      id: 'hundredLaps',
      label: 'Faire 100 tours',
      isUnlocked: () => Game.runtime.laps >= 100,
    },
  ];

  function initialize() {
    defs.forEach((achievement) => {
      unlocked[achievement.id] = false;
    });
  }

  function updateUi() {
    const { achievementsList } = Game.refs;
    achievementsList.innerHTML = '';

    defs.forEach((achievement) => {
      const isDone = Boolean(unlocked[achievement.id]);
      const item = document.createElement('li');
      item.className = `achievement-item ${isDone ? 'is-unlocked' : 'is-locked'}`;
      item.textContent = achievement.label;
      achievementsList.appendChild(item);
    });
  }

  function evaluate() {
    let hasNew = false;

    defs.forEach((achievement) => {
      if (unlocked[achievement.id]) return;
      if (achievement.isUnlocked()) {
        unlocked[achievement.id] = true;
        hasNew = true;
      }
    });

    if (hasNew) {
      updateUi();
    }
  }

  function openModal() {
    Game.refs.achievementsModal.classList.add('is-open');
    Game.refs.achievementsModal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    Game.refs.achievementsModal.classList.remove('is-open');
    Game.refs.achievementsModal.setAttribute('aria-hidden', 'true');
  }

  function serialize() {
    const result = {};
    defs.forEach((achievement) => {
      result[achievement.id] = Boolean(unlocked[achievement.id]);
    });
    return result;
  }

  function applyFromSave(data) {
    const safe = data && typeof data === 'object' ? data : {};
    defs.forEach((achievement) => {
      unlocked[achievement.id] = Boolean(safe[achievement.id]);
    });
  }

  function bindEvents() {
    Game.refs.achievementsBtn.addEventListener('click', () => {
      openModal();
    });

    Game.refs.closeAchievementsBtn.addEventListener('click', () => {
      closeModal();
    });

    Game.refs.achievementsModal.addEventListener('click', (event) => {
      if (event.target === Game.refs.achievementsModal) {
        closeModal();
      }
    });
  }

  function init() {
    initialize();
    bindEvents();
    updateUi();
    evaluate();
  }

  Game.achievements = {
    defs,
    init,
    evaluate,
    updateUi,
    serialize,
    applyFromSave,
  };
})();
