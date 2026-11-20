/* ==========================================================================
   ETARBOX — DnD 5e Monsters Loader & Statblock Renderer
   ========================================================================== */

(function () {
  function renderEntryList(entries) {
    if (!entries || entries.length === 0) return '';
    return entries
      .map(function (entry) {
        return `<p><strong>${entry.name}.</strong> ${entry.description}</p>`;
      })
      .join('');
  }

  function renderMonsters(containerId, monsters) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const statNames = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    let html = '';

    monsters.forEach(function (monster) {
      const statsRow = statNames
        .map(function (stat) {
          const s = monster.stats[stat];
          return `<td>${s.value} (${s.modifier})</td>`;
        })
        .join('');

      const featuresHtml = renderEntryList(monster.features);

      let spellcastingHtml = '';
      if (monster.spellcasting) {
        spellcastingHtml += `<p><strong>Spellcasting.</strong> ${monster.spellcasting.description}</p>`;
        for (const level in monster.spellcasting.levels) {
          const info = monster.spellcasting.levels[level];
          const slots = info.slots;
          const slotText = slots && slots !== 'at will' ? ` (${slots} slots)` : slots ? ` (${slots})` : '';
          spellcastingHtml += `<p><em>${level}${slotText}:</em> ${info.spells.join(', ')}</p>`;
        }
      }

      let actionBlockHtml = `
        <h3>Actions</h3>
        <div class="p-divider"></div>
        ${renderEntryList(monster.actions)}
      `;

      if (monster.bonus_actions && monster.bonus_actions.length > 0) {
        actionBlockHtml += `
          <h3>Bonus Action</h3>
          <div class="p-divider"></div>
          ${renderEntryList(monster.bonus_actions)}
        `;
      }

      if (monster.reactions && monster.reactions.length > 0) {
        actionBlockHtml += `
          <h3>Reactions</h3>
          <div class="p-divider"></div>
          ${renderEntryList(monster.reactions)}
        `;
      }

      let legendaryHtml = '';
      if (monster.legendary_actions) {
        legendaryHtml = `
          <div class="legendary-block-wrapper">
            <h3>Legendary Actions</h3>
            <div class="p-divider"></div>
            ${monster.legendary_actions.description ? `<p>${monster.legendary_actions.description}</p>` : ''}
            ${renderEntryList(monster.legendary_actions.actions)}
          </div>
        `;
      }

      let lairHtml = '';
      if (monster.lair_actions && monster.lair_actions.actions && monster.lair_actions.actions.length > 0) {
        lairHtml = `
          <div class="lair-block-wrapper">
            <h3>Lair Actions</h3>
            <div class="p-divider"></div>
            ${monster.lair_actions.description ? `<p>${monster.lair_actions.description}</p>` : ''}
            ${renderEntryList(monster.lair_actions.actions)}
          </div>
        `;
      }

      let footerHtml = '';
      if (monster.description_footer || monster.credits) {
        footerHtml = '<div class="monster-footer-box">';
        if (monster.description_footer) {
          footerHtml += `<h3>Thông tin thêm</h3><div class="p-divider"></div><p>${monster.description_footer}</p>`;
        }
        if (monster.credits) {
          footerHtml += `<h3>Credits</h3><div class="p-divider"></div><p>${monster.credits}</p>`;
        }
        footerHtml += '</div>';
      }

      const cardId = monster.name.toLowerCase().replace(/\s+/g, '_');

      html += `
        <article class="monster-card container divider" id="${cardId}">
          <h2 onclick="expandMonster(this)">${monster.name}</h2>
          <p class="monster-subtitle">${monster.size} ${monster.type}, ${monster.alignment}</p>

          <div class="monster-details">
            <div class="p-divider"></div>
            <div class="monster-stat-grid">
              <div>
                <p>
                  <strong>Armor Class.</strong> ${monster.ac.value} ${monster.ac.description ? `(${monster.ac.description})` : ''}<br>
                  <strong>Hit Points.</strong> ${monster.hp.value} (${monster.hp.hit_dice})<br>
                  <strong>Speed.</strong> ${monster.speed}
                </p>
                <div class="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>STR</th><th>DEX</th><th>CON</th><th>INT</th><th>WIS</th><th>CHA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>${statsRow}</tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="item-detail-media">
                <img src="${monster.image_src}" alt="${monster.name}" height="210" class="item-image" loading="lazy" decoding="async">
              </div>
            </div>

            <div>
              <p>
                <strong>Saving Throws.</strong> ${monster.saving_throws || 'N/A'}<br>
                <strong>Skills.</strong> ${monster.skills || 'N/A'}<br>
                ${monster.damage_vulnerabilities ? `<strong>Damage Vulnerabilities.</strong> ${monster.damage_vulnerabilities}<br>` : ''}
                ${monster.damage_resistances ? `<strong>Damage Resistances.</strong> ${monster.damage_resistances}<br>` : ''}
                ${monster.damage_immunities ? `<strong>Damage Immunities.</strong> ${monster.damage_immunities}<br>` : ''}
                <strong>Condition Immunities.</strong> ${monster.condition_immunities || 'N/A'}<br>
                <strong>Senses.</strong> ${monster.senses || 'N/A'}<br>
                <strong>Languages.</strong> ${monster.languages || 'N/A'}<br>
                <strong>Challenge.</strong> ${monster.challenge.value} (${monster.challenge.xp} XP)<br>
                <strong>Proficiency Bonus.</strong> +${monster.pb}
              </p>
              <div class="p-divider"></div>
              ${featuresHtml}
              ${spellcastingHtml}
            </div>

            <div class="action-block-wrapper">
              ${actionBlockHtml}
            </div>
            ${legendaryHtml}
            ${lairHtml}
            ${footerHtml}
          </div>
        </article>
      `;
    });

    container.innerHTML = html;

    if (typeof window.applyPageSearch === 'function') {
      window.applyPageSearch();
    }
  }

  window.loadDndMonsters = function (containerId, dataPath) {
    fetch(dataPath)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        const sorted = (Array.isArray(data) ? data : []).slice().sort(function (a, b) {
          return a.name.localeCompare(b.name, 'vi');
        });
        renderMonsters(containerId, sorted);
      })
      .catch(function (err) {
        console.error('Lỗi khi tải dữ liệu quái vật DnD:', err);
      });
  };
})();
