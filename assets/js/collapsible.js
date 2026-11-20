/* ==========================================================================
   ETARBOX — Unified Collapsible Cards (Items, Monsters, Spells, Bot Commands)
   ========================================================================== */

(function () {
  window.expandContainer = function (triggerEl) {
    const itemContainer = triggerEl && triggerEl.closest ? triggerEl.closest('.item-container') : null;
    if (!itemContainer) return;

    const isExpanded = itemContainer.classList.contains('expand');
    document.querySelectorAll('.item-container.expand').forEach(function (card) {
      if (card !== itemContainer) {
        card.classList.remove('expand');
      }
    });

    itemContainer.classList.toggle('expand', !isExpanded);
  };

  window.expandMonster = function (triggerEl) {
    const card = triggerEl && triggerEl.closest ? triggerEl.closest('.monster-card') : null;
    if (!card) return;
    card.classList.toggle('expand');
  };

  // Prevent anchor clicks inside collapsible cards from collapsing/toggling the card
  document.addEventListener('click', function (event) {
    if (event.target && event.target.closest && event.target.closest('.item-container a, .monster-card a')) {
      event.stopPropagation();
    }
  });
})();
