function loadStreamAccordion(containerId, dataPath) {
    function formatHighlight(text) {
        if (!text) return "";
        return text.replace(/\[\[(.*?)(\|(.*?))?\]\]/g, (_, word, __, tooltip) => {
          const cleanTooltip = tooltip?.trim();
          if (cleanTooltip) {
            return `<span class="tooltip-highlight" data-tippy-content="${cleanTooltip}">${word}</span>`;
          }
          return `<span style="font-style: italic; font-weight: bold;">${word}</span>`;
        });
      }

    fetch(dataPath)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById(containerId);
            if (!container) return;

            data.forEach((block, index) => {
                const wrapper = document.createElement("div");
                wrapper.classList.add("stream-wrapper");

                const header = document.createElement("h3");
                header.classList.add("accordion-header");
                header.textContent = block.title || `Mục ${index + 1}`;
                header.setAttribute("data-index", index);

                const content = document.createElement("div");
                content.classList.add("accordion-content");

                if (block.intro) {
                    content.innerHTML += `<div class="p-divider"></div><p>${formatHighlight(block.intro)}</p>`;
                }

                (block.features || []).forEach(feature => {
                    content.innerHTML += `<h4>${feature.title}</h4>`;

                    if (feature.description) {
                        content.innerHTML += `<p>${formatHighlight(feature.description)}</p>`;
                    }

                    if (feature.styles) {
                        feature.styles.forEach(style => {
                            content.innerHTML += `
                                <span style="font-style: italic; font-weight: bold;">${style.name}:</span>
                                ${formatHighlight(style.effect)}<br><br>
                            `;
                        });
                    }

                    if (feature.table) {
                        let tableHtml = "<table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>";
                        tableHtml += "<tr style='font-weight: bold;'>";
                        feature.table.headers.forEach(header => {
                            tableHtml += `<td style='border: 1px solid black;'>${header}</td>`;
                        });
                        tableHtml += "</tr>";
                        feature.table.rows.forEach(row => {
                            tableHtml += "<tr>";
                            row.forEach((cell, index) => {
                                const cellStyle = index === 1 
                                    ? "border: 1px solid black; text-align: left;" 
                                    : "border: 1px solid black;";
                                tableHtml += `<td style='${cellStyle}'>${formatHighlight(cell)}</td>`;
                            });
                            tableHtml += "</tr>";
                        });
                        tableHtml += "</table>";
                        content.innerHTML += tableHtml;
                    }
                    
                });

                wrapper.appendChild(header);
                wrapper.appendChild(content);
                container.appendChild(wrapper);
            });

            // Accordion toggle
            document.querySelectorAll(".accordion-header").forEach(header => {
                header.addEventListener("click", () => {
                    const content = header.nextElementSibling;
                    header.classList.toggle("active");
                    content.classList.toggle("open");
                });
            });

            tippy('.tooltip-highlight', {
                animation: 'scale',
                theme: 'light-border',
                placement: 'top',
                delay: [100, 50],
            });
              
        });
}
