/**
 * Biến toàn cục để lưu trữ tất cả dữ liệu quái vật.
 */
let allDndMonsters = [];

// =======================================================
// HÀM XỬ LÝ COLLAPSE/EXPAND (MỚI)
// =======================================================

/**
 * Xử lý việc thu gọn/mở rộng thẻ quái vật khi click vào tiêu đề.
 * @param {HTMLElement} h2Element - Thẻ H2 được click.
 */
function expandMonster(h2Element) {
    const card = h2Element.closest('.monster-card');
    if (card) {
        card.classList.toggle('expand');
    }
}


// =======================================================
// 1. CHỨC NĂNG TẢI DỮ LIỆU
// =======================================================

/**
 * Tải dữ liệu Monster từ file JSON và hiển thị chúng.
 * @param {string} containerId - ID của div chứa (ví dụ: 'dnd-monster-container').
 * @param {string} dataPath - Đường dẫn đến file JSON chứa dữ liệu monster (ví dụ: '/dnd/data/dnd_monsters.json').
 */
function loadDndMonsters(containerId, dataPath) {
    fetch(dataPath)
        .then(response => {
            if (!response.ok) {
                console.error(`Lỗi tải file: ${response.status} (${response.statusText}). Kiểm tra đường dẫn JSON.`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            allDndMonsters = data;
            // Sắp xếp quái vật theo tên trước khi hiển thị
            allDndMonsters.sort((a, b) => a.name.localeCompare(b.name));
            renderMonsters(containerId, allDndMonsters);
        })
        .catch(error => console.error("Lỗi khi tải hoặc xử lý dữ liệu quái vật:", error));
}


// =======================================================
// 2. CHỨC NĂNG HIỂN THỊ HTML (ĐÃ GOM KHỐI)
// =======================================================

/**
 * Tạo và chèn HTML chi tiết cho quái vật đã cho.
 */
function renderMonsters(containerId, monstersToRender) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let allMonstersHtml = '';

    monstersToRender.forEach(monster => {
        // --- Chuẩn bị các thành phần HTML con ---

        // Tạo hàng cho bảng chỉ số (STR, DEX, CON, ...)
        const statNames = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
        let statsRow = statNames.map(stat => {
            const statData = monster.stats[stat];
            return `<td>${statData.value} (${statData.modifier})</td>`;
        }).join('');
        
        // Tạo HTML cho phần Đặc điểm (Features)
        let featuresHtml = monster.features ? monster.features.map(feature => 
            `<span style="font-weight: bold;">${feature.name}.</span> ${feature.description}<br><br>`
        ).join('') : '';

        // Tạo HTML cho phần Phép thuật (Spellcasting) nếu có
        let spellcastingHtml = '';
        if (monster.spellcasting) {
            spellcastingHtml += `<span style="font-weight: bold;">Spellcasting.</span> ${monster.spellcasting.description}<br><br>`;
            
            for (const level in monster.spellcasting.levels) {
                const slots = monster.spellcasting.levels[level].slots;
                const slotText = slots && slots !== 'at will' ? ` (${slots} slots)` : slots ? ` (${slots})` : '';
                
                spellcastingHtml += `<span style="font-style: italic;">${level}${slotText}:</span> ${monster.spellcasting.levels[level].spells.join(', ')}<br><br>`;
            }
        }
        
        // --- Xử lý Action Block (Actions, Bonus Actions, Reactions) ---
        
        let actionBlockHtml = '';

        // ACTIONS
        let actionsHtml = monster.actions.map(action => 
            `<span style="font-weight: bold;">${action.name}.</span> ${action.description}<br><br>`
        ).join('');
        
        actionBlockHtml += `
            <h3>Actions</h3>
            <div class="p-divider"></div>
            <p>${actionsHtml}</p>
        `;

        // BONUS ACTIONS 
        if (monster.bonus_actions && monster.bonus_actions.length > 0) {
            let bonusActionsHtml = monster.bonus_actions.map(action => 
                `<span style="font-weight: bold;">${action.name}.</span> ${action.description}<br><br>`
            ).join('');
            actionBlockHtml += `
                <h3>Bonus Action</h3>
                <div class="p-divider"></div>
                <p>${bonusActionsHtml}</p>
            `;
        }

        // REACTIONS 
        if (monster.reactions && monster.reactions.length > 0) {
            let reactionsHtml = monster.reactions.map(reaction => 
                `<span style="font-weight: bold;">${reaction.name}.</span> ${reaction.description}<br><br>`
            ).join('');
            actionBlockHtml += `
                <h3>Reactions</h3>
                <div class="p-divider"></div>
                <p>${reactionsHtml}</p>
            `;
        }

        // LEGENDARY ACTIONS 
        let legendaryActionsHtml = '';
        if (monster.legendary_actions) {
            legendaryActionsHtml += `
                <h3>Legendary Actions</h3>
                <div class="p-divider"></div>
                <p>${monster.legendary_actions.description || ''}</p>
            `;
            legendaryActionsHtml += monster.legendary_actions.actions.map(action =>
                `<span style="font-weight: bold;">${action.name}.</span> ${action.description}<br><br>`
            ).join('');
        }

        // --- Xử lý Footer/Credits ---
        let footerHtml = '';
        if (monster.description_footer || monster.credits) {
            footerHtml = `
            <div class="footer-wrapper">
                <div style="background-color: rgba(255, 255, 255, 0.089); backdrop-filter: blur(50%); border-radius: 0px; box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.1); padding: 40px;">`;
            
            if (monster.description_footer) {
                 footerHtml += `<h3>Thông tin thêm</h3><div class="p-divider"></div><p>${monster.description_footer}</p>`;
            }
            if (monster.credits) {
                footerHtml += `<h3>Credits</h3><div class="p-divider"></div><p>${monster.credits}</p>`;
            }
            footerHtml += `</div></div>`;
        }


        // --- Tổng hợp HTML cho từng Monster (GOM CHUNG VÀO 1 DIV LỚN) ---

        allMonstersHtml += `
        <div class="monster-card container divider" id="${monster.name.toLowerCase().replace(/\s/g, '_')}">
            <h2 onclick="expandMonster(this)">${monster.name}</h2> 
            <p style="font-style: italic;">${monster.size} ${monster.type}, ${monster.alignment}</p>
            
            <div class="monster-details">
                <div class="p-divider"></div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; text-align: center;">
                    <div>
                        <p> 
                            <span style="font-weight: bold;">Armor Class.</span> ${monster.ac.value} ${monster.ac.description ? `(${monster.ac.description})` : ''}<br><br>
                            <span style="font-weight: bold;">Hit Points.</span> ${monster.hp.value} (${monster.hp.hit_dice})<br><br>
                            <span style="font-weight: bold;">Speed.</span> ${monster.speed}
                        </p>
                        <table>
                            <tr style="font-weight: bold;">
                                <td>STR</td>
                                <td>DEX</td>
                                <td>CON</td>
                                <td>INT</td>
                                <td>WIS</td>
                                <td>CHA</td>
                            </tr>
                            <tr>
                                ${statsRow}
                            </tr>
                        </table>
                        <p><span style="font-weight: bold;">Saving Throws.</span> ${monster.saving_throws || 'N/A'}</p>
                    </div>
                    <div>
                        <img src="${monster.image_src}" alt="${monster.name}" height="200">
                    </div>
                </div>
                <div>
                    <p>
                        <span style="font-weight: bold;">Skills.</span> ${monster.skills || 'N/A'}<br><br>
                        ${monster.damage_vulnerabilities ? `<span style="font-weight: bold;">Damage Vulnerabilities.</span> ${monster.damage_vulnerabilities}<br><br>` : ''}
                        ${monster.damage_resistances ? `<span style="font-weight: bold;">Damage Resistances.</span> ${monster.damage_resistances}<br><br>` : ''}
                        ${monster.damage_immunities ? `<span style="font-weight: bold;">Damage Immunities.</span> ${monster.damage_immunities}<br><br>` : ''}
                        <span style="font-weight: bold;">Condition Immunities.</span> ${monster.condition_immunities || 'N/A'}<br><br>
                        <span style="font-weight: bold;">Senses.</span> ${monster.senses || 'N/A'}<br><br>
                        <span style="font-weight: bold;">Languages.</span> ${monster.languages || 'N/A'}<br><br>
                        <span style="font-weight: bold;">Challenge.</span> ${monster.challenge.value} (${monster.challenge.xp} XP)<br><br>
                        <span style="font-weight: bold;">Proficiency Bonus.</span> +${monster.pb}
                    </p>
                    <div class="p-divider"></div>
                    <p>${featuresHtml}</p>
                    ${spellcastingHtml}
                </div>
                
                <div class="action-block-wrapper">
                    <div style="justify-content: center;">
                        ${actionBlockHtml}
                    </div>
                </div>

                ${monster.legendary_actions ? `
                <div class="legendary-block-wrapper">
                    <div style="justify-content: center;">
                        ${legendaryActionsHtml}
                    </div>
                </div>
                ` : ''}
                
                ${footerHtml}

            </div> </div> 
        `;
    });

    // Chèn tất cả HTML vào DOM một lần
    container.innerHTML = allMonstersHtml;
}