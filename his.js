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

// Init
document.addEventListener("DOMContentLoaded", () => renderHistory());
