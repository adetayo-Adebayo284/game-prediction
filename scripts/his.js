// ---------- Load history data ----------
let historyData = [];

// async function loadHistoryData() {
//     const container = document.getElementById("matchesContainer");
    
//     // Show spinner while loading
//     container.innerHTML = `
//         <div class="d-flex justify-content-center align-items-center py-4">
//             <div class="spinner-border text-warning" role="status">
//                 <span class="visually-hidden">Loading...</span>
//             </div>
//         </div>
//     `;

//     try {
//         const response = await fetch(`./backend/getPreHistory.php?start=2025-08-01&end=2025-08-31`);
//         const data = await response.json();
//         console.log("Fetched history data:", data);

//         historyData = data;
//         console.log("History data assigned:", historyData);

//         renderHistory();
//     } catch (err) {
//         console.error("Error fetching history:", err);
//         historyData = [];
//         renderHistory(); // still render empty
//     }
// }

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
        const today = new Date();

        // ✅ Yesterday (we only count completed days)
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        // ✅ Find the last full week block
        const day = yesterday.getDate();
        let startDay, endDay;

        if (day >= 22) {
            startDay = 16;
            endDay = 22;
        } else if (day >= 15) {
            startDay = 8;
            endDay = 14;
        } else if (day >= 8) {
            startDay = 1;
            endDay = 7;
        } else {
            // yesterday is between 1–7 → take last block of previous month (22–end)
            const prevMonth = new Date(yesterday.getFullYear(), yesterday.getMonth(), 0); // last day of prev month
            endDay = prevMonth.getDate(); // e.g. 30 or 31
            startDay = 22;
            yesterday.setMonth(yesterday.getMonth() - 1); // shift to previous month
        }

        const startDateObj = new Date(yesterday.getFullYear(), yesterday.getMonth(), startDay);
        const endDateObj = new Date(yesterday.getFullYear(), yesterday.getMonth(), endDay);

        // ✅ Format YYYY-MM-DD
        const formatDate = (d) => {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
        };

        const startDate = formatDate(startDateObj);
        const endDate = formatDate(endDateObj);

        console.log("Fetching history between:", startDate, "to", endDate);

        const response = await fetch(`./backend/getPreHistory.php?start=${startDate}&end=${endDate}`);
        const data = await response.json();
        console.log("Fetched history data:", data);

        historyData = data;
        renderHistory();
    } catch (err) {
        console.error("Error fetching history:", err);
        historyData = [];
        renderHistory();
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
    // --- Inject custom scrollbar CSS once ---
    if (!document.getElementById("history-scrollbar-style")) {
        const style = document.createElement("style");
        style.id = "history-scrollbar-style";
        style.innerHTML = `
          .slider-container::-webkit-scrollbar {
            height: 6px; /* thinner */
          }
          .slider-container::-webkit-scrollbar-track {
            background: transparent;
          }
          .slider-container::-webkit-scrollbar-thumb {
            background: #ffc107;
            border-radius: 8px;
          }
          .slider-container::-webkit-scrollbar-thumb:hover {
            background: #ffdd33;
          }
          .slider-container {
            scrollbar-width: thin;
            scrollbar-color: #ffc107 transparent;
            margin-top: 6px;
            margin-bottom: 6px;
            padding-bottom: 4px;
          }
          .slider-container .slide {
            margin: 0 !important;
            background: #000 !important; /* force black background */
            color: #fff !important;
            font-size: 0.72rem !important; /* slightly smaller text */
          }
        `;
        document.head.appendChild(style);
    }

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
        matchCard.style.marginBottom = "12px";

        // Build predictions slider
        let predictionsHTML = "";
        if (match.predictions && match.predictions.length) {
            predictionsHTML = `
            <div class="slider-container" 
                style="overflow-x:auto; display:flex; gap:10px; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch;">
                ${match.predictions.map(pred => {
                    let rawHTML = "";
                    if (pred.raw) {
                        rawHTML = Object.entries(pred.raw).map(([key, value]) => {
                            if (typeof value === "object" && value !== null) {
                                return `<div><strong>${key}:</strong> ${Object.entries(value).map(([k,v]) => `${k}: ${v}`).join(" • ")}</div>`;
                            }
                            return `<div><strong>${key}:</strong> ${value}</div>`;
                        }).join("");
                    }

                    // Clean Sheet market with table
                    if (pred.market === "Clean Sheet" && pred.values && pred.values.scores) {
                        const rows = Object.entries(pred.values.scores)
                            .map(([score, odd]) => `
                                <tr>
                                    <td style="padding:2px 6px;border:1px solid #ccc;text-align:center;">${score}</td>
                                    <td style="padding:2px 6px;border:1px solid #ccc;text-align:center;">${odd}</td>
                                </tr>
                            `).join("");
                        return `
                        <div class="slide" style="flex:0 0 auto; min-width:140px; max-height:250px; padding:10px; border-radius:8px; scroll-snap-align:start; overflow-y:auto;">
                            <div><strong>🔮 Market:</strong> ${pred.market}</div>
                            <table style="border-collapse:collapse;margin-top:4px;width:100%;">
                                <thead>
                                    <tr>
                                        <th style="padding:2px 6px;border:1px solid #ccc;">Score</th>
                                        <th style="padding:2px 6px;border:1px solid #ccc;">Odds</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rows}
                                </tbody>
                            </table>
                            ${rawHTML ? `<div style="margin-top:4px;">${rawHTML}</div>` : ""}
                        </div>
                        `;
                    } else {
                        // Normal market
                        const entries = Object.entries(pred.values || {});
                        const pressureVal = match.pressure || 0;
                        let pressureColor = "red";
                        if (pressureVal >= 70) pressureColor = "green";
                        else if (pressureVal >= 40) pressureColor = "yellow";

                        const valueBetColor = (match.value_bet === "Yes") ? "green" : "red";

                        return `
                        <div class="slide" style="flex:0 0 auto; min-width:130px; max-height:220px; padding:10px; border-radius:8px; scroll-snap-align:start; overflow-y:auto;">
                            <div><strong>🔮 Market:</strong> ${pred.market}</div>
                            <div style="margin-top:2px;">${entries.map(([k,v]) => `<strong>${k}:</strong> ${v}`).join(" • ")}</div>
                            <div style="margin-top:2px;">
                                <div><strong>xG:</strong> ${match.xg || "—"}</div>
                                <div><strong>Pressure:</strong> <span style="color:${pressureColor}">${match.pressure || "—"}%</span></div>
                                <div><strong>Value Bet:</strong> <span style="color:${valueBetColor}">${match.value_bet || "—"}</span></div>
                            </div>
                            ${rawHTML ? `<div style="margin-top:2px;">${rawHTML}</div>` : ""}
                        </div>
                        `;
                    }
                }).join("")}
            </div>
            `;
        } else {
            predictionsHTML = `<div style="margin-top:0.5rem;">No predictions available</div>`;
        }

        // Main accordion card
        matchCard.innerHTML = `
        <div class="accordion-item accordion-flush mb-3">
            <h2 class="accordion-header history-header" id="heading${match.id}">
                <button class="accordion-button collapsed" type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#collapse${match.id}" 
                  aria-expanded="false" 
                  aria-controls="collapse${match.id}">
                  <img src="${match.homeLogo}" alt="${match.home}" class="team-logo" style="width:28px; height:28px; margin-right:6px;">
                  ${match.home} <span class="mx-2">vs</span> 
                  <img src="${match.awayLogo}" alt="${match.away}" class="team-logo" style="width:28px; height:28px; margin-left:6px;">
                  ${match.away}
                </button>
            </h2>
            <div id="collapse${match.id}" class="accordion-collapse collapse" 
                data-bs-parent="#matchesContainer">
                <div class="accordion-body">
                    <div class="match-header d-flex justify-content-between align-items-center mb-2">
                        <div class="text-muted small">${match.league.name} • ${match.date}</div>
                        <div class="badge bg-secondary">${match.score}</div>
                    </div>
                    <div class="prediction-details">Prediction: ${match.result_info}</div>
                    <div class="confidence-badge tooltip-badge">
                        Confidence: ${match.confidence}
                        <span class="tooltip-texts">Prediction confidence level</span>
                    </div>
                    <div class="match-result">${match.result.toUpperCase()}</div>

                    <!-- Predictions Slider -->
                    ${predictionsHTML}

                    <div class="card-actions mt-3 d-flex justify-content-end">
                        <button class="btn btn-sm btn-outline-secondary me-2 share-btn" data-id="${match.id}" title="Share">🔗</button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${match.id}" title="Delete">🗑️</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        // Style result colors
        const resultEl = matchCard.querySelector(".match-result");
        resultEl.classList.remove("text-success", "text-danger", "text-warning", "bg-success", "bg-danger", "bg-warning", "p-1", "rounded");
        const res = match.result.toLowerCase();
        if (res === "win") resultEl.classList.add("text-white", "bg-success");
        else if (res === "lose") resultEl.classList.add("text-white", "bg-danger");
        else if (res === "draw") resultEl.classList.add("text-dark", "bg-warning");
        resultEl.classList.add("p-1", "rounded");

        container.appendChild(matchCard);
    });

    // "View All" button
    if (!showAll && historyData.length > 5) {
        const viewAllDiv = document.createElement("div");
        viewAllDiv.style.textAlign = "center";
        viewAllDiv.style.marginTop = "15px";

        const viewAllBtn = document.createElement("button");
        viewAllBtn.id = "viewAllBtn";
        viewAllBtn.className = "his-view-all btn btn-warning px-4 fw-bold";
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



// // ---------- Render History ----------
// function renderHistory(showAll = false) {
//     const container = document.getElementById("matchesContainer");
//     container.innerHTML = "";

//     const dataToShow = showAll ? historyData : historyData.slice(0, 5);

//     if (dataToShow.length === 0) {
//         container.innerHTML = `<p class="text-center py-4">No match history available.</p>`;
//         return;
//     }

//     dataToShow.forEach(match => {
//         const matchCard = document.createElement("div");
//         matchCard.classList.add("accordion", "accordion-flush");
//         matchCard.id = `accordion${match.id}`;
//         matchCard.style.marginBottom = "0px";
        
//         // Build predictions slider
//         let predictionsHTML = "";
//         if (match.predictions && match.predictions.length) {
//             predictionsHTML = `
//             <div class="slider-container" 
//                 style="overflow-x:auto; display:flex; gap:10px; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; padding-bottom:4px;">
//                 ${match.predictions.map(pred => {
//                     // Flatten raw data
//                     let rawHTML = "";
//                     if (pred.raw) {
//                         rawHTML = Object.entries(pred.raw).map(([key, value]) => {
//                             if (typeof value === "object" && value !== null) {
//                                 return `<div style="font-size:0.75rem;"><strong>${key}:</strong> ${Object.entries(value).map(([k,v]) => `${k}: ${v}`).join(" • ")}</div>`;
//                             }
//                             return `<div style="font-size:0.75rem;"><strong>${key}:</strong> ${value}</div>`;
//                         }).join("");
//                     }

//                     // Clean Sheet market with table
//                     if (pred.market === "Clean Sheet" && pred.values && pred.values.scores) {
//                         const rows = Object.entries(pred.values.scores)
//                             .map(([score, odd]) => `
//                                 <tr>
//                                     <td style="padding:2px 6px;border:1px solid #ccc;text-align:center;">${score}</td>
//                                     <td style="padding:2px 6px;border:1px solid #ccc;text-align:center;">${odd}</td>
//                                 </tr>
//                             `).join("");
//                         return `
//                         <div class="slide" style="flex:0 0 auto; min-width:140px; max-height:250px; background:#2a3d66; padding:10px; border-radius:8px; scroll-snap-align:start; font-size:0.75rem; overflow-y:auto; color:#fff; margin:0;">
//                             <div><strong>🔮 Market:</strong> ${pred.market}</div>
//                             <table style="border-collapse:collapse;margin-top:4px;width:100%;color:#fff;font-size:0.75rem;">
//                                 <thead>
//                                     <tr>
//                                         <th style="padding:2px 6px;border:1px solid #ccc;">Score</th>
//                                         <th style="padding:2px 6px;border:1px solid #ccc;">Odds</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     ${rows}
//                                 </tbody>
//                             </table>
//                             ${rawHTML ? `<div style="margin-top:4px;">${rawHTML}</div>` : ""}
//                         </div>
//                         `;
//                     } else {
//                         // Normal market
//                         const entries = Object.entries(pred.values || {});
//                         const pressureVal = match.pressure || 0;
//                         let pressureColor = "red";
//                         if (pressureVal >= 70) pressureColor = "green";
//                         else if (pressureVal >= 40) pressureColor = "yellow";

//                         const valueBetColor = (match.value_bet === "Yes") ? "green" : "red";

//                         return `
//                         <div class="slide" style="flex:0 0 auto; min-width:130px; max-height:220px; background:#2a3d66; padding:10px; border-radius:8px; scroll-snap-align:start; font-size:0.75rem; overflow-y:auto; color:#fff; margin:0;">
//                             <div><strong>🔮 Market:</strong> ${pred.market}</div>
//                             <div style="margin-top:2px;">${entries.map(([k,v]) => `<strong>${k}:</strong> ${v}`).join(" • ")}</div>
//                             <div style="margin-top:2px; font-size:0.7rem;">
//                                 <div><strong>xG:</strong> ${match.xg || "—"}</div>
//                                 <div><strong>Pressure:</strong> <span style="color:${pressureColor}">${match.pressure || "—"}%</span></div>
//                                 <div><strong>Value Bet:</strong> <span style="color:${valueBetColor}">${match.value_bet || "—"}</span></div>
//                             </div>
//                             ${rawHTML ? `<div style="margin-top:2px;">${rawHTML}</div>` : ""}
//                         </div>
//                         `;
//                     }
//                 }).join("")}
//             </div>
//             `;
//         } else {
//             predictionsHTML = `<div style="margin-top:0.5rem; font-size:0.8rem;">No predictions available</div>`;
//         }



//         // Build main card
//         matchCard.innerHTML = `
//         <div class="accordion-item accordion-flush mb-4">
//             <h2 class="accordion-header history-header" id="heading${match.id}">
//                 <button class="accordion-button collapsed" type="button" 
//                   data-bs-toggle="collapse" 
//                   data-bs-target="#collapse${match.id}" 
//                   aria-expanded="false" 
//                   aria-controls="collapse${match.id}">
//                   <img src="${match.homeLogo}" alt="${match.home}" class="team-logo" style="width:28px; height:28px; margin-right:6px;">
//                   ${match.home} <span class="mx-2">vs</span> 
//                   <img src="${match.awayLogo}" alt="${match.away}" class="team-logo" style="width:28px; height:28px; margin-left:6px;">
//                   ${match.away}
//                 </button>
//             </h2>
//             <div id="collapse${match.id}" class="accordion-collapse collapse" 
//                 data-bs-parent="#matchesContainer">
//                 <div class="accordion-body">
//                     <div class="match-header d-flex justify-content-between align-items-center mb-2">
//                         <div class="text-muted small">${match.league.name} • ${match.date}</div>
//                         <div class="badge bg-secondary">${match.score}</div>
//                     </div>
//                     <div class="prediction-details">Prediction: ${match.result_info}</div>
//                     <div class="confidence-badge tooltip-badge">
//                         Confidence: ${match.confidence}
//                         <span class="tooltip-texts">Prediction confidence level</span>
//                     </div>
//                     <div class="match-result">${match.result.toUpperCase()}</div>

//                     <!-- Predictions Slider -->
//                     ${predictionsHTML}

//                     <div class="card-actions mt-3 d-flex justify-content-end">
//                         <button class="btn btn-sm btn-outline-secondary me-2 share-btn" data-id="${match.id}" title="Share">🔗</button>
//                         <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${match.id}" title="Delete">🗑️</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//         `;

//         // Style result
//         const resultEl = matchCard.querySelector(".match-result");
//         resultEl.classList.remove("text-success", "text-danger", "text-warning", "bg-success", "bg-danger", "bg-warning", "p-1", "rounded");
//         const res = match.result.toLowerCase();
//         if (res === "win") resultEl.classList.add("text-white", "bg-success");
//         else if (res === "lose") resultEl.classList.add("text-white", "bg-danger");
//         else if (res === "draw") resultEl.classList.add("text-dark", "bg-warning");
//         resultEl.classList.add("p-1", "rounded");

//         container.appendChild(matchCard);
//     });

//     // View All button
//     if (!showAll && historyData.length > 5) {
//         const viewAllDiv = document.createElement("div");
//         viewAllDiv.style.textAlign = "center";
//         viewAllDiv.style.marginTop = "15px";

//         const viewAllBtn = document.createElement("button");
//         viewAllBtn.id = "viewAllBtn";
//         viewAllBtn.className = "his-view-all btn btn-warning px-4 fw-bold";
//         viewAllBtn.innerText = "View All";

//         viewAllBtn.addEventListener("click", () => {
//             container.innerHTML = `
//                 <div class="d-flex justify-content-center align-items-center py-4">
//                     <div class="spinner-border text-warning" role="status">
//                         <span class="visually-hidden">Loading...</span>
//                     </div>
//                 </div>
//             `;
//             setTimeout(() => renderHistory(true), 500);
//         });

//         viewAllDiv.appendChild(viewAllBtn);
//         container.appendChild(viewAllDiv);
//     }

//     attachAccordionHandlers();
//     attachActionHandlers();
// }




// // ---------- Render History ----------
// function renderHistory(showAll = false) {
//     const container = document.getElementById("matchesContainer");
//     container.innerHTML = "";

//     const dataToShow = showAll ? historyData : historyData.slice(0, 5);

//     if (dataToShow.length === 0) {
//         container.innerHTML = `<p class="text-center py-4">No match history available.</p>`;
//         return;
//     }

//     dataToShow.forEach(match => {
//         const matchCard = document.createElement("div");
//         matchCard.classList.add("accordion", "accordion-flush");
//         matchCard.id = `accordion${match.id}`;
//         matchCard.style.marginBottom = "0px";

//         matchCard.innerHTML = `
//         <div class="accordion-item accordion-flush mb-4">
//             <h2 class="accordion-header history-header" id="heading${match.id}">
//                 <button class="accordion-button collapsed" type="button" 
//                   data-bs-toggle="collapse" 
//                   data-bs-target="#collapse${match.id}" 
//                   aria-expanded="false" 
//                   aria-controls="collapse${match.id}">
//                   ${match.home} vs ${match.away}
//                 </button>
//             </h2>
//             <div id="collapse${match.id}" class="accordion-collapse collapse" 
//                 data-bs-parent="#matchesContainer">
//                 <div class="accordion-body">
//                     <div class="match-header">
//                         <div class="team">
//                             <img src="${match.homeLogo}" alt="${match.home}" class="team-logo">
//                             <span class="team-name">${match.home}</span>
//                         </div>
//                         <div class="match-score">${match.score}</div>
//                         <div class="team">
//                             <img src="${match.awayLogo}" alt="${match.away}" class="team-logo">
//                             <span class="team-name">${match.away}</span>
//                         </div>
//                     </div>
//                     <div class="match-info">${match.league.name} • ${match.date}</div>
//                     <div class="prediction-details">Prediction: ${match.result_info}</div>
//                     <div class="confidence-badge tooltip-badge">
//                         Confidence: ${match.confidence}
//                         <span class="tooltip-texts">Prediction confidence level</span>
//                     </div>
//                     <div class="match-result">Result: ${match.result.toUpperCase()}</div>
//                     <div class="card-actions">
//                         <button class="action-btn share-btn" data-id="${match.id}" title="Share">🔗</button>
//                         <button class="action-btn delete-btn" data-id="${match.id}" title="Delete">🗑️</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//         `;

//         const resultEl = matchCard.querySelector(".match-result");

//         // Remove old classes
//         resultEl.classList.remove("text-success", "text-danger", "text-warning", "bg-success", "bg-danger", "bg-warning", "p-1", "rounded");

//         // Apply Bootstrap classes based on result
//         const res = match.result.toLowerCase();
//         if (res === "win") {
//             resultEl.classList.add("text-white", "bg-success");
//         } else if (res === "lose") {
//             resultEl.classList.add("text-white", "bg-danger");
//         } else if (res === "draw") {
//             resultEl.classList.add("text-dark", "bg-warning");
//         }

//         // Add padding & rounded corners
//         resultEl.classList.add("p-1", "rounded");

//         container.appendChild(matchCard);
//     });

//     // View All button
//     if (!showAll && historyData.length > 5) {
//         const viewAllDiv = document.createElement("div");
//         viewAllDiv.style.textAlign = "center";
//         viewAllDiv.style.marginTop = "15px";

//         const viewAllBtn = document.createElement("button");
//         viewAllBtn.id = "viewAllBtn";
//         viewAllBtn.className = "his-view-all";
//         viewAllBtn.innerText = "View All";

//         viewAllBtn.addEventListener("click", () => {
//             container.innerHTML = `
//                 <div class="d-flex justify-content-center align-items-center py-4">
//                     <div class="spinner-border text-warning" role="status">
//                         <span class="visually-hidden">Loading...</span>
//                     </div>
//                 </div>
//             `;
//             setTimeout(() => renderHistory(true), 500);
//         });

//         viewAllDiv.appendChild(viewAllBtn);
//         container.appendChild(viewAllDiv);
//     }

//     attachAccordionHandlers();
//     attachActionHandlers();
// }


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


