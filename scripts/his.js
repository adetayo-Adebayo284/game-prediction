// Example history data
const historyData = [
  {
    id: 11,
    home: "Barcelona",
    away: "Real Madrid",
    homeLogo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
    awayLogo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    score: "2 - 1",
    league: "La Liga",
    date: "2025-08-10",
    prediction: "Barcelona to Win",
    confidence: "High",
    result: "win"
  },
  {
    id: 12,
    home: "Man City",
    away: "Liverpool",
    homeLogo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
    awayLogo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
    score: "1 - 3",
    league: "Premier League",
    date: "2025-08-12",
    prediction: "Over 2.5 Goals",
    confidence: "Medium",
    result: "lose"
  },
  {
    id: 13,
    home: "Chelsea",
    away: "Arsenal",
    homeLogo: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
    awayLogo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    score: "2 - 2",
    league: "Premier League",
    date: "2025-08-14",
    prediction: "Both Teams To Score",
    confidence: "High",
    result: "win"
  },
  {
    id: 14,
    home: "Juventus",
    away: "AC Milan",
    homeLogo: "https://upload.wikimedia.org/wikipedia/en/2/2d/Juventus_Turin.svg",
    awayLogo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
    score: "0 - 1",
    league: "Serie A",
    date: "2025-08-15",
    prediction: "Juventus to Win",
    confidence: "Low",
    result: "lose"
  },
  {
    id: 15,
    home: "PSG",
    away: "Marseille",
    homeLogo: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
    awayLogo: "https://upload.wikimedia.org/wikipedia/en/8/85/Olympique_Marseille_logo.svg",
    score: "3 - 0",
    league: "Ligue 1",
    date: "2025-08-16",
    prediction: "PSG to Win",
    confidence: "High",
    result: "win"
  },
  {
    id: 16,
    home: "Bayern",
    away: "Dortmund",
    homeLogo: "https://upload.wikimedia.org/wikipedia/commons/1/1f/FC_Bayern_München_logo_%282017%29.svg",
    awayLogo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
    score: "2 - 2",
    league: "Bundesliga",
    date: "2025-08-17",
    prediction: "Over 3.5 Goals",
    confidence: "Medium",
    result: "lose"
  }
];
// ALERT FUNCTION
function showCustomAlert(title, message, type = "info") {
  const alertBox = document.getElementById("custom-alert");
  const alertContent = alertBox.querySelector(".custom-alert-content");
  const alertIcon = document.getElementById("alert-icon");

  // Reset types
  alertContent.classList.remove("alert-success", "alert-warning", "alert-error", "alert-info");

  // Apply type class
  alertContent.classList.add(`alert-${type}`);

  // Set content
  document.getElementById("alert-title").textContent = title;
  document.getElementById("alert-message").textContent = message;

  // Change icon based on type
  switch(type) {
    case "success": alertIcon.textContent = "✅"; break;
    case "warning": alertIcon.textContent = "⚠️"; break;
    case "error":   alertIcon.textContent = "❌"; break;
    case "info":    alertIcon.textContent = "ℹ️"; break;
    default:        alertIcon.textContent = "🔔";
  }

  // Show alert
  alertBox.classList.remove("hidden");

  // Close button
  document.getElementById("alert-ok-btn").onclick = () => {
    alertBox.classList.add("hidden");
  };
}


// Render history into matchesContainer
function renderHistory(showAll = false) {
  const container = document.getElementById("matchesContainer");
  container.innerHTML = "";

  // Slice history to 5 if not "view all"
  const dataToShow = showAll ? historyData : historyData.slice(0, 5);
  const resultDOM = document.querySelector(".match-result");


  dataToShow.forEach((match) => {
  const matchCard = document.createElement("div");
  matchCard.classList.add("accordion", "accordion-flush");
  matchCard.id = `accordion${match.id}`;
  matchCard.style.marginBottom = "0px"; // margin between cards

  // build card HTML
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
          <div class="match-result">
            Result: ${match.result.toUpperCase()}
          </div>
          <div class="card-actions">
            <button class="action-btn share-btn" data-id="${match.id}" title="Share">🔗</button>
            <button class="action-btn delete-btn" data-id="${match.id}" title="Delete">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // add background/text color for result
  const resultEl = matchCard.querySelector(".match-result");
  if (match.result === "win") {
    resultEl.classList.add("result-success");
  } else if (match.result === "lose") {
    resultEl.classList.add("result-fail");
  }

  container.appendChild(matchCard);
});


  // Add View All button if not showing all
  if (!showAll && historyData.length > 5) {
    const viewAllDiv = document.createElement("div");
    viewAllDiv.style.textAlign = "center";
    viewAllDiv.style.marginTop = "15px";

    const viewAllBtn = document.createElement("button");
    viewAllBtn.id = "viewAllBtn";
    viewAllBtn.className = "his-view-all";
    viewAllBtn.innerText = "View All";

    viewAllBtn.addEventListener("click", () => {
      // Show spinner while loading
      container.innerHTML = `
        <div class="d-flex justify-content-center align-items-center py-4">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      `;
      setTimeout(() => {
        renderHistory(true);
      }, 1000);
    });

    viewAllDiv.appendChild(viewAllBtn);
    container.appendChild(viewAllDiv);
  }

  attachAccordionHandlers();
  attachActionHandlers();
}

// Accordion handlers (only one open at a time)
function attachAccordionHandlers() {
  const accordions = document.querySelectorAll(".accordion-button");
  accordions.forEach(btn => {
    btn.addEventListener("click", function () {
      const isActive = !this.classList.contains("collapsed");

      // close all
      accordions.forEach(b => {
        b.classList.add("collapsed");
        const collapse = document.querySelector(b.getAttribute("data-bs-target"));
        if (collapse.classList.contains("show")) {
          new bootstrap.Collapse(collapse, { toggle: true });
        }
      });

      // reopen only if previously closed
      if (!isActive) {
        this.classList.remove("collapsed");
        const collapse = document.querySelector(this.getAttribute("data-bs-target"));
        new bootstrap.Collapse(collapse, { toggle: true });
      }
    });
  });
}

// Share + Delete
function attachActionHandlers() {
  document.querySelectorAll(".share-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const match = historyData.find(m => m.id == id);
      if (match) {
        const text = `${match.home} vs ${match.away}\nScore: ${match.score}\nPrediction: ${match.prediction} (${match.confidence})\nResult: ${match.result.toUpperCase()}`;
        navigator.clipboard.writeText(text).then(() => {
          // alert("Match details copied to clipboard!");
          setTimeout(() => {
            showCustomAlert("Success", "Match details copied to clipboard", "success");
          }, 20);
        });
      }
    });
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
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
  document.body.style.overflow = "hidden"; // lock background
}

function closeHistoryModal() {
  const historyModal = document.getElementById("historyModal");
  historyModal.classList.remove("show");
  historyModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = ""; // restore scroll
}

// ---------- Choice Handlers ----------
function setupHistoryChoiceHandlers() {
  const dateRangeRadio = document.querySelector(
    "input[name='historyChoice'][value='fixtures_date_range']"
  );
  const dateRangeFields = document.getElementById("dateRangeFields");

  // All radios
  const allChoices = document.querySelectorAll("input[name='historyChoice']");

  allChoices.forEach(radio => {
    radio.addEventListener("change", () => {
      if (dateRangeRadio.checked) {
        console.log(radio.innerHTML);
        
        dateRangeFields.style.display = "block";
      } else {
        dateRangeFields.style.display = "none";
      }
    });
  });
}

// ---------- Event Listeners ----------
document.addEventListener("DOMContentLoaded", () => {
  // Header wrapper click
  const historyHeader = document.querySelector(".history-header");
  if (historyHeader) {
    historyHeader.addEventListener("click", openHistoryModal);
  }

  // Button inside header
  const openHistoryBtn = document.getElementById("openHistoryBtn");
  if (openHistoryBtn) {
    openHistoryBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent double triggering
      openHistoryModal();
    });
  }

  // Close button
  const closeHistoryBtn = document.getElementById("closeHistoryBtn");
  if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener("click", closeHistoryModal);
  }

  // Setup modal radio behavior
  setupHistoryChoiceHandlers();
});



// Init
document.addEventListener("DOMContentLoaded", () => renderHistory());
















// // ---------- HISTORY DATA ----------
// let historyData = [
//   {
//     id: 11,
//     home: "Barcelona",
//     away: "Real Madrid",
//     homeLogo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
//     awayLogo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
//     score: "2 - 1",
//     league: "La Liga",
//     date: "2025-08-10",
//     prediction: "Barcelona to Win",
//     confidence: "High",
//     result: "win"
//   },
//   {
//     id: 12,
//     home: "Man City",
//     away: "Liverpool",
//     homeLogo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
//     awayLogo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
//     score: "1 - 3",
//     league: "Premier League",
//     date: "2025-08-12",
//     prediction: "Over 2.5 Goals",
//     confidence: "Medium",
//     result: "lose"
//   },
//   {
//     id: 13,
//     home: "Chelsea",
//     away: "Arsenal",
//     homeLogo: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
//     awayLogo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
//     score: "2 - 2",
//     league: "Premier League",
//     date: "2025-08-14",
//     prediction: "Both Teams To Score",
//     confidence: "High",
//     result: "win"
//   },
//   {
//     id: 14,
//     home: "Juventus",
//     away: "AC Milan",
//     homeLogo: "https://upload.wikimedia.org/wikipedia/en/2/2d/Juventus_Turin.svg",
//     awayLogo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
//     score: "0 - 1",
//     league: "Serie A",
//     date: "2025-08-15",
//     prediction: "Juventus to Win",
//     confidence: "Low",
//     result: "lose"
//   },
//   {
//     id: 15,
//     home: "PSG",
//     away: "Marseille",
//     homeLogo: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
//     awayLogo: "https://upload.wikimedia.org/wikipedia/en/8/85/Olympique_Marseille_logo.svg",
//     score: "3 - 0",
//     league: "Ligue 1",
//     date: "2025-08-16",
//     prediction: "PSG to Win",
//     confidence: "High",
//     result: "win"
//   },
//   {
//     id: 16,
//     home: "Bayern",
//     away: "Dortmund",
//     homeLogo: "https://upload.wikimedia.org/wikipedia/commons/1/1f/FC_Bayern_München_logo_%282017%29.svg",
//     awayLogo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
//     score: "2 - 2",
//     league: "Bundesliga",
//     date: "2025-08-17",
//     prediction: "Over 3.5 Goals",
//     confidence: "Medium",
//     result: "lose"
//   }
// ];

// // ---------- ALERT FUNCTION ----------
// function showCustomAlert(title, message, type = "info") {
//   const alertBox = document.getElementById("custom-alert");
//   const alertContent = alertBox.querySelector(".custom-alert-content");
//   const alertIcon = document.getElementById("alert-icon");

//   alertContent.classList.remove("alert-success", "alert-warning", "alert-error", "alert-info");
//   alertContent.classList.add(`alert-${type}`);

//   document.getElementById("alert-title").textContent = title;
//   document.getElementById("alert-message").textContent = message;

//   switch(type) {
//     case "success": alertIcon.textContent = "✅"; break;
//     case "warning": alertIcon.textContent = "⚠️"; break;
//     case "error":   alertIcon.textContent = "❌"; break;
//     case "info":    alertIcon.textContent = "ℹ️"; break;
//     default:        alertIcon.textContent = "🔔";
//   }

//   alertBox.classList.remove("hidden");
//   document.getElementById("alert-ok-btn").onclick = () => alertBox.classList.add("hidden");
// }

// // ---------- MODAL OPEN/CLOSE ----------
// const openHistoryBtn = document.getElementById("openHistoryBtn");
// const historyModal = document.getElementById("historyModal");
// const closeHistoryBtn = document.getElementById("closeHistoryBtn");
// const matchesContainer = document.getElementById("matchesContainer");

// openHistoryBtn.addEventListener("click", () => {
//   historyModal.classList.add("show");
//   document.body.classList.add("modal-open");
// });

// closeHistoryBtn.addEventListener("click", () => {
//   historyModal.classList.remove("show");
//   document.body.classList.remove("modal-open");
// });

// window.addEventListener("click", (e) => {
//   if (e.target === historyModal) {
//     historyModal.classList.remove("show");
//     document.body.classList.remove("modal-open");
//   }
// });

// // ---------- RADIO LOGIC ----------
// document.querySelectorAll("input[name='historyChoice']").forEach(radio => {
//   radio.addEventListener("change", () => {
//     const dateRangeFields = document.getElementById("dateRangeFields");
//     dateRangeFields.style.display = (radio.value === "fixtures_date_range" && radio.checked) ? "block" : "none";
//   });
// });

// // ---------- APPLY FILTER ----------
// const applyBtn = document.getElementById("applyHistoryBtn");
// applyBtn.addEventListener("click", () => {
//   const selectedOption = document.querySelector("input[name='historyChoice']:checked");
//   if (!selectedOption) { alert("Please select a category before applying."); return; }

//   let startDate = "", endDate = "", includes = [];

//   if (selectedOption.value === "fixtures_date_range") {
//     const startRaw = document.getElementById("startDate")?.value;
//     const endRaw   = document.getElementById("endDate")?.value;

//     // Convert MM/DD/YYYY → YYYY-MM-DD
//     const parseDate = d => {
//       if (!d) return "";
//       const parts = d.split("/");
//       return parts.length === 3 ? `${parts[2]}-${parts[0].padStart(2,'0')}-${parts[1].padStart(2,'0')}` : d;
//     }

//     startDate = parseDate(startRaw);
//     endDate   = parseDate(endRaw);

//     includes = Array.from(document.querySelectorAll("#includeOptions input[type=checkbox]:checked"))
//       .map(cb => cb.value);
//   }

//   // --- LOG filters ---
//   let logStr = `${selectedOption.value.toUpperCase()}_,${startDate},${endDate}`;
//   if (includes.length) logStr += `,${includes.join(";")};`;
//   console.log(logStr);

//   // --- SHOW LOADING ---
//   matchesContainer.innerHTML = `
//     <div class="d-flex justify-content-center align-items-center py-4">
//       <div class="spinner-border text-warning" role="status">
//         <span class="visually-hidden">Loading...</span>
//       </div>
//     </div>
//   `;

//   setTimeout(() => {
//     renderHistory(false, { type: selectedOption.value, startDate, endDate, includes });
//     historyModal.classList.remove("show");
//     document.body.classList.remove("modal-open");
//   }, 800);
// });

// // ---------- RENDER HISTORY ----------
// function renderHistory(showAll = false, filters = null) {
//   const container = document.getElementById("matchesContainer");
//   container.innerHTML = "";

//   let data = [...historyData]; // always start with historyData

//   if (filters) {
//     if (filters.type === "wins") {
//       data = data.filter(m => m.result === "win");
//     } else if (filters.type === "losses") {
//       data = data.filter(m => m.result === "lose");
//     } else if (filters.type === "fixtures_date_range") {
//       // --- just log, no validation ---
//       console.log(`FIXTURES_DATE_RANGE_,${filters.startDate},${filters.endDate},${(filters.includes?.join(";")||"")};`);
      
//       // --- add header message ---
//       const infoDiv = document.createElement("div");
//       infoDiv.className = "alert alert-info text-center mb-3";
//       infoDiv.textContent = `Fixture is selected from ${filters.startDate} to ${filters.endDate}`;
//       container.appendChild(infoDiv);
//     }
//   }

//   const dataToShow = showAll ? data : data.slice(0, 5);

//   if (!dataToShow.length && historyData.length === 0) {
//     container.innerHTML += `<div class="text-center text-muted py-4">No records found</div>`;
//     return;
//   }

//   dataToShow.forEach(match => {
//     const matchCard = document.createElement("div");
//     matchCard.classList.add("accordion", "accordion-flush");
//     matchCard.id = `accordion${match.id}`;
//     matchCard.style.marginBottom = "0px";

//     matchCard.innerHTML = `
//       <div class="accordion-item accordion-flush mb-4">
//         <h2 class="accordion-header history-header" id="heading${match.id}">
//           <button class="accordion-button collapsed" type="button"
//             data-bs-toggle="collapse"
//             data-bs-target="#collapse${match.id}"
//             aria-expanded="false"
//             aria-controls="collapse${match.id}">
//             ${match.home} vs ${match.away}
//           </button>
//         </h2>
//         <div id="collapse${match.id}" class="accordion-collapse collapse" data-bs-parent="#matchesContainer">
//           <div class="accordion-body">
//             <div class="match-header">
//               <div class="team">
//                 <img src="${match.homeLogo}" alt="${match.home}" class="team-logo">
//                 <span class="team-name">${match.home}</span>
//               </div>
//               <div class="match-score">${match.score}</div>
//               <div class="team">
//                 <img src="${match.awayLogo}" alt="${match.away}" class="team-logo">
//                 <span class="team-name">${match.away}</span>
//               </div>
//             </div>
//             <div class="match-info">${match.league} • ${match.date}</div>
//             <div class="prediction-details">Prediction: ${match.prediction}</div>
//             <div class="confidence-badge tooltip-badge">
//               Confidence: ${match.confidence}
//               <span class="tooltip-texts">Prediction confidence level</span>
//             </div>
//             <div class="match-result">${match.result.toUpperCase()}</div>
//             <div class="card-actions">
//               <button class="action-btn share-btn" data-id="${match.id}" title="Share">🔗</button>
//               <button class="action-btn delete-btn" data-id="${match.id}" title="Delete">🗑️</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     `;

//     const resultEl = matchCard.querySelector(".match-result");
//     if (match.result === "win") resultEl.classList.add("result-success");
//     else if (match.result === "lose") resultEl.classList.add("result-fail");

//     container.appendChild(matchCard);
//   });

//   attachAccordionHandlers();
//   attachActionHandlers();
// }


// // ---------- ACCORDION HANDLERS ----------
// function attachAccordionHandlers() {
//   const accordions = document.querySelectorAll(".accordion-button");
//   accordions.forEach(btn => {
//     btn.addEventListener("click", function () {
//       const isActive = !this.classList.contains("collapsed");
//       accordions.forEach(b => {
//         b.classList.add("collapsed");
//         const collapse = document.querySelector(b.getAttribute("data-bs-target"));
//         if (collapse.classList.contains("show")) new bootstrap.Collapse(collapse, { toggle: true });
//       });
//       if (!isActive) {
//         this.classList.remove("collapsed");
//         const collapse = document.querySelector(this.getAttribute("data-bs-target"));
//         new bootstrap.Collapse(collapse, { toggle: true });
//       }
//     });
//   });
// }

// // ---------- SHARE & DELETE ----------
// function attachActionHandlers() {
//   document.querySelectorAll(".share-btn").forEach(btn => {
//     btn.addEventListener("click", e => {
//       const id = e.target.dataset.id;
//       const match = historyData.find(m => m.id == id);
//       if (match) {
//         const text = `${match.home} vs ${match.away}\nScore: ${match.score}\nPrediction: ${match.prediction} (${match.confidence})\nResult: ${match.result.toUpperCase()}`;
//         navigator.clipboard.writeText(text).then(() => {
//           showCustomAlert("Success", "Match details copied to clipboard", "success");
//         });
//       }
//     });
//   });

//   document.querySelectorAll(".delete-btn").forEach(btn => {
//     btn.addEventListener("click", e => {
//       const id = e.target.dataset.id;
//       const index = historyData.findIndex(m => m.id == id);
//       if (index !== -1) {
//         historyData.splice(index, 1);
//         renderHistory();
//       }
//     });
//   });
// }

// // ---------- INIT ----------
// document.addEventListener("DOMContentLoaded", () => {
//   if (historyData.length) renderHistory(); 
//   else matchesContainer.innerHTML = `<div class="text-center text-muted py-4">No records found</div>`;
// });
















// {
//     id: 11,
//     home: "Barcelona",
//     away: "Real Madrid",
//     homeLogo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
//     awayLogo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
//     score: "2 - 1",
//     league: "La Liga",
//     date: "2025-08-10",
//     prediction: "Barcelona to Win",
//     confidence: "High",
//     result: "win"
//   },
//   {
//     id: 12,
//     home: "Man City",
//     away: "Liverpool",
//     homeLogo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
//     awayLogo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
//     score: "1 - 3",
//     league: "Premier League",
//     date: "2025-08-12",
//     prediction: "Over 2.5 Goals",
//     confidence: "Medium",
//     result: "lose"
//   },
//   {
//     id: 13,
//     home: "Chelsea",
//     away: "Arsenal",
//     homeLogo: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
//     awayLogo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
//     score: "2 - 2",
//     league: "Premier League",
//     date: "2025-08-14",
//     prediction: "Both Teams To Score",
//     confidence: "High",
//     result: "win"
//   },
//   {
//     id: 14,
//     home: "Juventus",
//     away: "AC Milan",
//     homeLogo: "https://upload.wikimedia.org/wikipedia/en/2/2d/Juventus_Turin.svg",
//     awayLogo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
//     score: "0 - 1",
//     league: "Serie A",
//     date: "2025-08-15",
//     prediction: "Juventus to Win",
//     confidence: "Low",
//     result: "lose"
//   },
//   {
//     id: 15,
//     home: "PSG",
//     away: "Marseille",
//     homeLogo: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
//     awayLogo: "https://upload.wikimedia.org/wikipedia/en/8/85/Olympique_Marseille_logo.svg",
//     score: "3 - 0",
//     league: "Ligue 1",
//     date: "2025-08-16",
//     prediction: "PSG to Win",
//     confidence: "High",
//     result: "win"
//   },
//   {
//     id: 16,
//     home: "Bayern",
//     away: "Dortmund",
//     homeLogo: "https://upload.wikimedia.org/wikipedia/commons/1/1f/FC_Bayern_München_logo_%282017%29.svg",
//     awayLogo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
//     score: "2 - 2",
//     league: "Bundesliga",
//     date: "2025-08-17",
//     prediction: "Over 3.5 Goals",
//     confidence: "Medium",
//     result: "lose"
//   }






// // ---------- HISTORY DATA ----------
// let historyData = [
  
// ];

// // ---------- ALERT FUNCTION ----------
// function showCustomAlert(title, message, type = "info") {
//   const alertBox = document.getElementById("custom-alert");
//   const alertContent = alertBox.querySelector(".custom-alert-content");
//   const alertIcon = document.getElementById("alert-icon");

//   alertContent.classList.remove("alert-success", "alert-warning", "alert-error", "alert-info");
//   alertContent.classList.add(`alert-${type}`);

//   document.getElementById("alert-title").textContent = title;
//   document.getElementById("alert-message").textContent = message;

//   switch(type) {
//     case "success": alertIcon.textContent = "✅"; break;
//     case "warning": alertIcon.textContent = "⚠️"; break;
//     case "error":   alertIcon.textContent = "❌"; break;
//     case "info":    alertIcon.textContent = "ℹ️"; break;
//     default:        alertIcon.textContent = "🔔";
//   }

//   alertBox.classList.remove("hidden");
//   document.getElementById("alert-ok-btn").onclick = () => alertBox.classList.add("hidden");
// }

// // ---------- MODAL OPEN/CLOSE ----------
// const openHistoryBtn = document.getElementById("openHistoryBtn");
// const historyModal = document.getElementById("historyModal");
// const closeHistoryBtn = document.getElementById("closeHistoryBtn");
// const matchesContainer = document.getElementById("matchesContainer");

// openHistoryBtn.addEventListener("click", () => {
//   historyModal.classList.add("show");
//   document.body.classList.add("modal-open");
// });

// closeHistoryBtn.addEventListener("click", () => {
//   historyModal.classList.remove("show");
//   document.body.classList.remove("modal-open");
// });

// window.addEventListener("click", (e) => {
//   if (e.target === historyModal) {
//     historyModal.classList.remove("show");
//     document.body.classList.remove("modal-open");
//   }
// });

// // ---------- RADIO LOGIC ----------
// document.querySelectorAll("input[name='historyChoice']").forEach(radio => {
//   radio.addEventListener("change", () => {
//     const dateRangeFields = document.getElementById("dateRangeFields");
//     dateRangeFields.style.display = (radio.value === "fixtures_date_range" && radio.checked) ? "block" : "none";
//   });
// });

// // ---------- APPLY FILTER ----------
// const applyBtn = document.getElementById("applyHistoryBtn");
// applyBtn.addEventListener("click", () => {
//   const selectedOption = document.querySelector("input[name='historyChoice']:checked");
//   if (!selectedOption) { alert("Please select a category before applying."); return; }

//   let startDate = "", endDate = "", includes = [];

//   if (selectedOption.value === "fixtures_date_range") {
//     const startRaw = document.getElementById("startDate")?.value;
//     const endRaw   = document.getElementById("endDate")?.value;

//     // Convert MM/DD/YYYY → YYYY-MM-DD
//     const parseDate = d => {
//       if (!d) return "";
//       const parts = d.split("/");
//       return parts.length === 3 ? `${parts[2]}-${parts[0].padStart(2,'0')}-${parts[1].padStart(2,'0')}` : d;
//     }

//     startDate = parseDate(startRaw);
//     endDate   = parseDate(endRaw);

//     includes = Array.from(document.querySelectorAll("#includeOptions input[type=checkbox]:checked"))
//       .map(cb => cb.value);
//   }

//   // --- LOG filters ---
//   let logStr = `${selectedOption.value.toUpperCase()}_,${startDate},${endDate}`;
//   if (includes.length) logStr += `,${includes.join(";")};`;
//   console.log(logStr);

//   // --- SHOW LOADING ---
//   matchesContainer.innerHTML = `
//     <div class="d-flex justify-content-center align-items-center py-4">
//       <div class="spinner-border text-warning" role="status">
//         <span class="visually-hidden">Loading...</span>
//       </div>
//     </div>
//   `;

//   setTimeout(() => {
//     renderHistory(false, { type: selectedOption.value, startDate, endDate, includes });
//     historyModal.classList.remove("show");
//     document.body.classList.remove("modal-open");
//   }, 800);
// });

// // ---------- RENDER HISTORY ----------
// function renderHistory(showAll = false, filters = null) {
//   const container = document.getElementById("matchesContainer");
//   container.innerHTML = "";

//   let data = [...historyData];

//   if (filters) {
//     if (filters.type === "wins") {
//       data = data.filter(m => m.result === "win");
//     } else if (filters.type === "losses") {
//       data = data.filter(m => m.result === "lose");
//     } else if (filters.type === "fixtures_date_range") {
//       console.log(`FIXTURES_DATE_RANGE_,${filters.startDate},${filters.endDate},${(filters.includes?.join(";")||"")};`);

//       const infoDiv = document.createElement("div");
//       infoDiv.className = "alert alert-info text-center mb-3";
//       infoDiv.textContent = `Fixture is selected from ${filters.startDate} to ${filters.endDate}`;
//       container.appendChild(infoDiv);
//     }
//   }

//   const dataToShow = showAll ? data : data.slice(0, 5);

//   if (!dataToShow.length && historyData.length === 0) {
//     container.innerHTML += `<div class="text-center text-muted py-4">No records found</div>`;
//     return;
//   }

//   dataToShow.forEach(match => {
//     const matchCard = document.createElement("div");
//     matchCard.classList.add("accordion", "accordion-flush");
//     matchCard.id = `accordion${match.id}`;
//     matchCard.style.marginBottom = "0px";

//     // build extra info for includes
//     let includesHTML = "";
//     if (filters?.type === "fixtures_date_range" && filters.includes?.length) {
//       includesHTML = `<div class="mt-2"><strong>Included Data:</strong><ul>`;
//       filters.includes.forEach(opt => {
//         includesHTML += `<li>${opt}: ${match[opt] !== undefined ? match[opt] : "undefined"}</li>`;
//       });
//       includesHTML += "</ul></div>";
//     }

//     matchCard.innerHTML = `
//       <div class="accordion-item accordion-flush mb-4">
//         <h2 class="accordion-header history-header" id="heading${match.id}">
//           <button class="accordion-button collapsed" type="button"
//             data-bs-toggle="collapse"
//             data-bs-target="#collapse${match.id}"
//             aria-expanded="false"
//             aria-controls="collapse${match.id}">
//             ${match.home} vs ${match.away}
//           </button>
//         </h2>
//         <div id="collapse${match.id}" class="accordion-collapse collapse" data-bs-parent="#matchesContainer">
//           <div class="accordion-body">
//             <div class="match-header">
//               <div class="team">
//                 <img src="${match.homeLogo}" alt="${match.home}" class="team-logo">
//                 <span class="team-name">${match.home}</span>
//               </div>
//               <div class="match-score">${match.score}</div>
//               <div class="team">
//                 <img src="${match.awayLogo}" alt="${match.away}" class="team-logo">
//                 <span class="team-name">${match.away}</span>
//               </div>
//             </div>
//             <div class="match-info">${match.league} • ${match.date}</div>
//             <div class="prediction-details">Prediction: ${match.prediction}</div>
//             <div class="confidence-badge tooltip-badge">
//               Confidence: ${match.confidence}
//               <span class="tooltip-texts">Prediction confidence level</span>
//             </div>
//             <div class="match-result">${match.result.toUpperCase()}</div>
//             ${includesHTML}
//             <div class="card-actions">
//               <button class="action-btn share-btn" data-id="${match.id}" title="Share">🔗</button>
//               <button class="action-btn delete-btn" data-id="${match.id}" title="Delete">🗑️</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     `;

//     const resultEl = matchCard.querySelector(".match-result");
//     if (match.result === "win") resultEl.classList.add("result-success");
//     else if (match.result === "lose") resultEl.classList.add("result-fail");

//     container.appendChild(matchCard);
//   });

//   attachAccordionHandlers();
//   attachActionHandlers();
// }


// // ---------- ACCORDION HANDLERS ----------
// function attachAccordionHandlers() {
//   const accordions = document.querySelectorAll(".accordion-button");
//   accordions.forEach(btn => {
//     btn.addEventListener("click", function () {
//       const isActive = !this.classList.contains("collapsed");
//       accordions.forEach(b => {
//         b.classList.add("collapsed");
//         const collapse = document.querySelector(b.getAttribute("data-bs-target"));
//         if (collapse.classList.contains("show")) new bootstrap.Collapse(collapse, { toggle: true });
//       });
//       if (!isActive) {
//         this.classList.remove("collapsed");
//         const collapse = document.querySelector(this.getAttribute("data-bs-target"));
//         new bootstrap.Collapse(collapse, { toggle: true });
//       }
//     });
//   });
// }

// // ---------- SHARE & DELETE ----------
// function attachActionHandlers() {
//   document.querySelectorAll(".share-btn").forEach(btn => {
//     btn.addEventListener("click", e => {
//       const id = e.target.dataset.id;
//       const match = historyData.find(m => m.id == id);
//       if (match) {
//         const text = `${match.home} vs ${match.away}\nScore: ${match.score}\nPrediction: ${match.prediction} (${match.confidence})\nResult: ${match.result.toUpperCase()}`;
//         navigator.clipboard.writeText(text).then(() => {
//           showCustomAlert("Success", "Match details copied to clipboard", "success");
//         });
//       }
//     });
//   });

//   document.querySelectorAll(".delete-btn").forEach(btn => {
//     btn.addEventListener("click", e => {
//       const id = e.target.dataset.id;
//       const index = historyData.findIndex(m => m.id == id);
//       if (index !== -1) {
//         historyData.splice(index, 1);
//         renderHistory();
//       }
//     });
//   });
// }

// // ---------- INIT ----------
// document.addEventListener("DOMContentLoaded", () => {
//   if (historyData.length) renderHistory(); 
//   else matchesContainer.innerHTML = `<div class="text-center text-muted py-4">No records found</div>`;
// });







// GODD TO TEST 

// ---------- HISTORY DATA ----------
// let historyData = [];

// // ---------- ALERT FUNCTION ----------
// function showCustomAlert(title, message, type = "info") {
//   const alertBox = document.getElementById("custom-alert");
//   const alertContent = alertBox.querySelector(".custom-alert-content");
//   const alertIcon = document.getElementById("alert-icon");

//   alertContent.classList.remove("alert-success", "alert-warning", "alert-error", "alert-info");
//   alertContent.classList.add(`alert-${type}`);

//   document.getElementById("alert-title").textContent = title;
//   document.getElementById("alert-message").textContent = message;

//   switch (type) {
//     case "success": alertIcon.textContent = "✅"; break;
//     case "warning": alertIcon.textContent = "⚠️"; break;
//     case "error":   alertIcon.textContent = "❌"; break;
//     case "info":    alertIcon.textContent = "ℹ️"; break;
//     default:        alertIcon.textContent = "🔔";
//   }

//   alertBox.classList.remove("hidden");
//   document.getElementById("alert-ok-btn").onclick = () => alertBox.classList.add("hidden");
// }

// // ---------- MODAL OPEN/CLOSE ----------
// const openHistoryBtn = document.getElementById("openHistoryBtn");
// const historyModal = document.getElementById("historyModal");
// const closeHistoryBtn = document.getElementById("closeHistoryBtn");
// const matchesContainer = document.getElementById("matchesContainer");

// openHistoryBtn.addEventListener("click", () => {
//   historyModal.classList.add("show");
//   document.body.classList.add("modal-open");
// });

// closeHistoryBtn.addEventListener("click", () => {
//   historyModal.classList.remove("show");
//   document.body.classList.remove("modal-open");
// });

// window.addEventListener("click", (e) => {
//   if (e.target === historyModal) {
//     historyModal.classList.remove("show");
//     document.body.classList.remove("modal-open");
//   }
// });

// // ---------- RADIO LOGIC ----------
// document.querySelectorAll("input[name='historyChoice']").forEach(radio => {
//   radio.addEventListener("change", () => {
//     const dateRangeFields = document.getElementById("dateRangeFields");
//     dateRangeFields.style.display = (radio.value === "fixtures_date_range" && radio.checked) ? "block" : "none";
//   });
// });

// // ---------- APPLY FILTER ----------
// const applyBtn = document.getElementById("applyHistoryBtn");
// applyBtn.addEventListener("click", async () => {
//   const selectedOption = document.querySelector("input[name='historyChoice']:checked");
//   if (!selectedOption) { alert("Please select a category before applying."); return; }

//   let startDate = "", endDate = "", includes = [];

//   if (selectedOption.value === "fixtures_date_range") {
//     const startRaw = document.getElementById("startDate")?.value;
//     const endRaw   = document.getElementById("endDate")?.value;

//     const parseDate = d => {
//       if (!d) return "";
//       const parts = d.split("/");
//       return parts.length === 3 ? `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}` : d;
//     }

//     startDate = parseDate(startRaw);
//     endDate   = parseDate(endRaw);

//     includes = Array.from(document.querySelectorAll("#includeOptions input[type=checkbox]:checked"))
//       .map(cb => cb.value);
//   }

//   // --- LOG filters ---
//   let logStr = `${selectedOption.value.toUpperCase()}_,${startDate},${endDate}`;
//   if (includes.length) logStr += `,${includes.join(";")};`;
//   console.log("Query for backend:", logStr);

//   // --- SHOW LOADING ---
//   matchesContainer.innerHTML = `
//     <div class="d-flex justify-content-center align-items-center py-4">
//       <div class="spinner-border text-warning" role="status">
//         <span class="visually-hidden">Loading...</span>
//       </div>
//     </div>
//   `;

//   try {
//     // --- MAKE BACKEND REQUEST ---
//     const response = await fetch("http://localhost/game/backend/getHistory.php", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         type: selectedOption.value,
//         startDate,
//         endDate,
//         includes
//       })
//     });

//     if (!response.ok) throw new Error("Failed to fetch history");

//     const raw = await response.text();
//     console.log("Raw response from PHP:", raw);
//     const json = JSON.parse(raw);


//     // Replace historyData with backend response
//     historyData = json.map((item, index) => ({
//       id: item.id ?? index + 1,
//       home: item.home,
//       away: item.away,
//       homeLogo: item.homeLogo,
//       awayLogo: item.awayLogo,
//       score: item.score,
//       league: item.league,
//       date: item.date,
//       prediction: item.prediction,
//       confidence: item.confidence,
//       result: item.result
//     }));

//     renderHistory(false, { type: selectedOption.value, startDate, endDate, includes });
//     historyModal.classList.remove("show");
//     document.body.classList.remove("modal-open");

//   } catch (error) {
//     console.error(error);
//     showCustomAlert("Error", "Could not load history data", "error");
//     matchesContainer.innerHTML = `<div class="text-center text-danger py-4">Failed to load data</div>`;
//   }
// });

// // ---------- RENDER HISTORY ----------
// function renderHistory(showAll = false, filters = null) {
//   const container = document.getElementById("matchesContainer");
//   container.innerHTML = "";

//   let data = [...historyData];

//   if (filters) {
//     if (filters.type === "wins") {
//       data = data.filter(m => m.result === "win");
//     } else if (filters.type === "losses") {
//       data = data.filter(m => m.result === "lose");
//     } else if (filters.type === "fixtures_date_range") {
//       console.log(`FIXTURES_DATE_RANGE_,${filters.startDate},${filters.endDate},${(filters.includes?.join(";") || "")};`);

//       const infoDiv = document.createElement("div");
//       infoDiv.className = "alert alert-info text-center mb-3";
//       infoDiv.textContent = `Fixture is selected from ${filters.startDate} to ${filters.endDate}`;
//       container.appendChild(infoDiv);
//     }
//   }

//   const dataToShow = showAll ? data : data.slice(0, 5);

//   if (!dataToShow.length) {
//     container.innerHTML += `<div class="text-center text-muted py-4">No records found</div>`;
//     return;
//   }

//   dataToShow.forEach(match => {
//     const matchCard = document.createElement("div");
//     matchCard.classList.add("accordion", "accordion-flush");
//     matchCard.id = `accordion${match.id}`;
//     matchCard.style.marginBottom = "0px";

//     let includesHTML = "";
//     if (filters?.type === "fixtures_date_range" && filters.includes?.length) {
//       includesHTML = `<div class="mt-2"><strong>Included Data:</strong><ul>`;
//       filters.includes.forEach(opt => {
//         includesHTML += `<li>${opt}: ${match[opt] !== undefined ? match[opt] : "undefined"}</li>`;
//       });
//       includesHTML += `</ul></div>`;
//     }

//     matchCard.innerHTML = `
//       <div class="accordion-item accordion-flush mb-4">
//         <h2 class="accordion-header history-header" id="heading${match.id}">
//           <button class="accordion-button collapsed" type="button"
//             data-bs-toggle="collapse"
//             data-bs-target="#collapse${match.id}"
//             aria-expanded="false"
//             aria-controls="collapse${match.id}">
//             ${match.home} vs ${match.away}
//           </button>
//         </h2>
//         <div id="collapse${match.id}" class="accordion-collapse collapse" data-bs-parent="#matchesContainer">
//           <div class="accordion-body">
//             <div class="match-header">
//               <div class="team">
//                 <img src="${match.homeLogo}" alt="${match.home}" class="team-logo">
//                 <span class="team-name">${match.home}</span>
//               </div>
//               <div class="match-score">${match.score}</div>
//               <div class="team">
//                 <img src="${match.awayLogo}" alt="${match.away}" class="team-logo">
//                 <span class="team-name">${match.away}</span>
//               </div>
//             </div>
//             <div class="match-info">${match.league} • ${match.date}</div>
//             <div class="prediction-details">Prediction: ${match.prediction}</div>
//             <div class="confidence-badge tooltip-badge">
//               Confidence: ${match.confidence}
//               <span class="tooltip-texts">Prediction confidence level</span>
//             </div>
//             <div class="match-result">${match.result.toUpperCase()}</div>
//             ${includesHTML}
//             <div class="card-actions">
//               <button class="action-btn share-btn" data-id="${match.id}" title="Share">🔗</button>
//               <button class="action-btn delete-btn" data-id="${match.id}" title="Delete">🗑️</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     `;

//     const resultEl = matchCard.querySelector(".match-result");
//     if (match.result === "win") resultEl.classList.add("result-success");
//     else if (match.result === "lose") resultEl.classList.add("result-fail");

//     container.appendChild(matchCard);
//   });

//   attachAccordionHandlers();
//   attachActionHandlers();
// }

// // ---------- ACCORDION HANDLERS ----------
// function attachAccordionHandlers() {
//   const accordions = document.querySelectorAll(".accordion-button");
//   accordions.forEach(btn => {
//     btn.addEventListener("click", function () {
//       const isActive = !this.classList.contains("collapsed");
//       accordions.forEach(b => {
//         b.classList.add("collapsed");
//         const collapse = document.querySelector(b.getAttribute("data-bs-target"));
//         if (collapse.classList.contains("show")) new bootstrap.Collapse(collapse, { toggle: true });
//       });
//       if (!isActive) {
//         this.classList.remove("collapsed");
//         const collapse = document.querySelector(this.getAttribute("data-bs-target"));
//         new bootstrap.Collapse(collapse, { toggle: true });
//       }
//     });
//   });
// }

// // ---------- SHARE & DELETE ----------
// function attachActionHandlers() {
//   document.querySelectorAll(".share-btn").forEach(btn => {
//     btn.addEventListener("click", e => {
//       const id = e.target.dataset.id;
//       const match = historyData.find(m => m.id == id);
//       if (match) {
//         const text = `${match.home} vs ${match.away}\nScore: ${match.score}\nPrediction: ${match.prediction} (${match.confidence})\nResult: ${match.result.toUpperCase()}`;
//         navigator.clipboard.writeText(text).then(() => {
//           showCustomAlert("Success", "Match details copied to clipboard", "success");
//         });
//       }
//     });
//   });

//   document.querySelectorAll(".delete-btn").forEach(btn => {
//     btn.addEventListener("click", e => {
//       const id = e.target.dataset.id;
//       const index = historyData.findIndex(m => m.id == id);
//       if (index !== -1) {
//         historyData.splice(index, 1);
//         renderHistory();
//       }
//     });
//   });
// }

// // ---------- INIT ----------
// document.addEventListener("DOMContentLoaded", () => {
//   if (historyData.length) renderHistory();
//   else matchesContainer.innerHTML = `<div class="text-center text-muted py-4">No records found</div>`;
// });
