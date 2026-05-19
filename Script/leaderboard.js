window.Game = window.Game || {};

Game.leaderboard = {
  async load() {
    try {
      const response = await fetch('leaderboard.php');
      const data = await response.json();
      
      if (!data.ok || !Array.isArray(data.leaderboard)) {
        this.renderError('Impossible de charger le classement');
        return;
      }
      
      this.render(data.leaderboard);
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      this.renderError('Erreur de chargement');
    }
  },

  render(leaderboard) {
    const container = document.getElementById('leaderboardList');
    if (!container) return;

    if (leaderboard.length === 0) {
      container.innerHTML = '<p class="leaderboard-empty">Aucun joueur pour le moment</p>';
      return;
    }

    const table = document.createElement('table');
    table.className = 'leaderboard-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Rang</th>
        <th>Joueur</th>
        <th>Tours</th>
        <th>Or</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const currentUserId = window.APP_CONTEXT?.userId;

    leaderboard.forEach((player, index) => {
      const tr = document.createElement('tr');
      if (currentUserId && player.id === currentUserId) {
        tr.className = 'leaderboard-self';
      }

      tr.innerHTML = `
        <td class="leaderboard-rank">${index + 1}</td>
        <td class="leaderboard-name">${Game.sanitize(player.username)}</td>
        <td class="leaderboard-laps">${player.total_laps}</td>
        <td class="leaderboard-coins">${player.total_coins}</td>
      `;
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
  },

  renderError(message) {
    const container = document.getElementById('leaderboardList');
    if (container) {
      container.innerHTML = `<p class="leaderboard-error">${message}</p>`;
    }
  },
};

// Charger le classement au démarrage
document.addEventListener('DOMContentLoaded', () => {
  Game.leaderboard.load();
});
