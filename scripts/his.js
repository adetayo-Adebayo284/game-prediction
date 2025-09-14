// ---------- Load history data ----------
let historyData = [];

async function loadHistoryData() {
    const container = document.getElementById("matchesContainer");
    
    // Show spinner while loading
    container.innerHTML = `
        <div class="d-flex justify-content-center align-items-center py-4">
            <div class="spinner-border text-warning" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    try {
        const response = await fetch(`./backend/getPreHistory.php?start=2025-08-01&end=2025-08-31`);
        const data = await response.json();
        console.log("Fetched history data:", data);

        historyData = data;
        console.log("History data assigned:", historyData);

        renderHistory();
    } catch (err) {
        console.error("Error fetching history:", err);
        historyData = [];
        renderHistory(); // still render empty
    }
}

// ---------- ALERT FUNCTION ----------
function showCustomAlert(title, message, type = "info") {
    const alertBox = document.getElementById("custom-alert");
    const alertContent = alertBox.querySelector(".custom-alert-content");
    const alertIcon = document.getElementById("alert-icon");

    alertContent.classList.remove("alert-success", "alert-warning", "alert-error", "alert-info");
    alertContent.classList.add(`alert-${type}`);

    document.getElementById("alert-title").textContent = title;
    document.getElementById("alert-message").textContent = message;

    switch(type) {
        case "success": alertIcon.textContent = "✅"; break;
        case "warning": alertIcon.textContent = "⚠️"; break;
        case "error":   alertIcon.textContent = "❌"; break;
        case "info":    alertIcon.textContent = "ℹ️"; break;
        default:        alertIcon.textContent = "🔔";
    }

    alertBox.classList.remove("hidden");

    document.getElementById("alert-ok-btn").onclick = () => {
        alertBox.classList.add("hidden");
    };
}

// ---------- Render History ----------
function renderHistory(showAll = false) {
    const container = document.getElementById("matchesContainer");
    container.innerHTML = "";

    const dataToShow = showAll ? historyData : historyData.slice(0, 5);

    if (dataToShow.length === 0) {
        container.innerHTML = `<p class="text-center py-4">No match history available.</p>`;
        return;
    }

    dataToShow.forEach(match => {
        const matchCard = document.createElement("div");
        matchCard.classList.add("accordion", "accordion-flush");
        matchCard.id = `accordion${match.id}`;
        matchCard.style.marginBottom = "0px";

        matchCard.innerHTML = `
        <div class="accordion-item accordion-flush mb-4">
            <h2 class="accordion-header history-header" id="heading${match.id}">
                <button class="accordion-button collapsed" type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#collapse${match.id}" 
                  aria-expanded="false" 
                  aria-controls="collapse${match.id}">
                  ${match.home} vs ${match.away}
                </button>
            </h2>
            <div id="collapse${match.id}" class="accordion-collapse collapse" 
                data-bs-parent="#matchesContainer">
                <div class="accordion-body">
                    <div class="match-header">
                        <div class="team">
                            <img src="${match.homeLogo}" alt="${match.home}" class="team-logo">
                            <span class="team-name">${match.home}</span>
                        </div>
                        <div class="match-score">${match.score}</div>
                        <div class="team">
                            <img src="${match.awayLogo}" alt="${match.away}" class="team-logo">
                            <span class="team-name">${match.away}</span>
                        </div>
                    </div>
                    <div class="match-info">${match.league} • ${match.date}</div>
                    <div class="prediction-details">Prediction: ${match.prediction}</div>
                    <div class="confidence-badge tooltip-badge">
                        Confidence: ${match.confidence}
                        <span class="tooltip-texts">Prediction confidence level</span>
                    </div>
                    <div class="match-result">Result: ${match.result.toUpperCase()}</div>
                    <div class="card-actions">
                        <button class="action-btn share-btn" data-id="${match.id}" title="Share">🔗</button>
                        <button class="action-btn delete-btn" data-id="${match.id}" title="Delete">🗑️</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        const resultEl = matchCard.querySelector(".match-result");

        // Remove old classes
        resultEl.classList.remove("text-success", "text-danger", "text-warning", "bg-success", "bg-danger", "bg-warning", "p-1", "rounded");

        // Apply Bootstrap classes based on result
        const res = match.result.toLowerCase();
        if (res === "win") {
            resultEl.classList.add("text-white", "bg-success");
        } else if (res === "lose") {
            resultEl.classList.add("text-white", "bg-danger");
        } else if (res === "draw") {
            resultEl.classList.add("text-dark", "bg-warning");
        }

        // Add padding & rounded corners
        resultEl.classList.add("p-1", "rounded");


        container.appendChild(matchCard);
    });

    // View All button
    if (!showAll && historyData.length > 5) {
        const viewAllDiv = document.createElement("div");
        viewAllDiv.style.textAlign = "center";
        viewAllDiv.style.marginTop = "15px";

        const viewAllBtn = document.createElement("button");
        viewAllBtn.id = "viewAllBtn";
        viewAllBtn.className = "his-view-all";
        viewAllBtn.innerText = "View All";

        viewAllBtn.addEventListener("click", () => {
            container.innerHTML = `
                <div class="d-flex justify-content-center align-items-center py-4">
                    <div class="spinner-border text-warning" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;
            setTimeout(() => renderHistory(true), 500);
        });

        viewAllDiv.appendChild(viewAllBtn);
        container.appendChild(viewAllDiv);
    }

    attachAccordionHandlers();
    attachActionHandlers();
}

// ---------- Accordion ----------
function attachAccordionHandlers() {
    const accordions = document.querySelectorAll(".accordion-button");
    accordions.forEach(btn => {
        btn.addEventListener("click", function () {
            const isActive = !this.classList.contains("collapsed");

            accordions.forEach(b => {
                b.classList.add("collapsed");
                const collapse = document.querySelector(b.getAttribute("data-bs-target"));
                if (collapse.classList.contains("show")) {
                    new bootstrap.Collapse(collapse, { toggle: true });
                }
            });

            if (!isActive) {
                this.classList.remove("collapsed");
                const collapse = document.querySelector(this.getAttribute("data-bs-target"));
                new bootstrap.Collapse(collapse, { toggle: true });
            }
        });
    });
}

// ---------- Share & Delete ----------
function attachActionHandlers() {
    document.querySelectorAll(".share-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            const id = e.target.dataset.id;
            const match = historyData.find(m => m.id == id);
            if (match) {
                const text = `${match.home} vs ${match.away}\nScore: ${match.score}\nPrediction: ${match.prediction} (${match.confidence})\nResult: ${match.result.toUpperCase()}`;
                navigator.clipboard.writeText(text).then(() => {
                    setTimeout(() => showCustomAlert("Success", "Match details copied to clipboard", "success"), 20);
                });
            }
        });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            const id = e.target.dataset.id;
            const index = historyData.findIndex(m => m.id == id);
            if (index !== -1) {
                historyData.splice(index, 1);
                renderHistory();
            }
        });
    });
}

// ---------- Modal Functions ----------
function openHistoryModal() {
    const historyModal = document.getElementById("historyModal");
    historyModal.classList.add("show");
    historyModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeHistoryModal() {
    const historyModal = document.getElementById("historyModal");
    historyModal.classList.remove("show");
    historyModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

// ---------- Choice Handlers ----------
function setupHistoryChoiceHandlers() {
    const dateRangeRadio = document.querySelector("input[name='historyChoice'][value='fixtures_date_range']");
    const dateRangeFields = document.getElementById("dateRangeFields");

    document.querySelectorAll("input[name='historyChoice']").forEach(radio => {
        radio.addEventListener("change", () => {
            dateRangeFields.style.display = dateRangeRadio.checked ? "block" : "none";
        });
    });
}

// ---------- DOMContentLoaded ----------
document.addEventListener("DOMContentLoaded", () => {
    const historyHeader = document.querySelector(".history-header");
    if (historyHeader) historyHeader.addEventListener("click", openHistoryModal);

    const openHistoryBtn = document.getElementById("openHistoryBtn");
    if (openHistoryBtn) openHistoryBtn.addEventListener("click", e => { e.stopPropagation(); openHistoryModal(); });

    const closeHistoryBtn = document.getElementById("closeHistoryBtn");
    if (closeHistoryBtn) closeHistoryBtn.addEventListener("click", closeHistoryModal);

    setupHistoryChoiceHandlers();

    loadHistoryData();
});


