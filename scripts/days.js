const choiceDateContainer = document.getElementById("choice-date");
const matchListDOM = document.getElementById("matchList-choice");

const labels = { "-3": "", "-2": "", "-1": "Yesterday", "0": "Today", "1": "Tomorrow", "2": "", "3": "" };
const today = new Date();

// Mock matches database keyed by date (day-month-year)
const matchesDB = {
  // "20-8-2025": [
  //     { time: "12:00", league: "Eredivisie", homeLogo: "ajax-logo.png", awayLogo: "psv-logo.png", home: "Ajax", away: "PSV", score: "3 - 2", prediction: "Ajax Win", confidence: 88 }
  // ],
  // "21-8-2025": [
  //     { time: "15:00", league: "La Liga", homeLogo: "sevilla-logo.png", awayLogo: "valencia-logo.png", home: "Sevilla", away: "Valencia", score: "1 - 0", prediction: "Sevilla Win", confidence: 82 }
  // ],
  // "22-8-2025": [
  //     { time: "17:00", league: "Serie A", homeLogo: "napoli-logo.png", awayLogo: "roma-logo.png", home: "Napoli", away: "Roma", score: "2 - 1", prediction: "Napoli Win", confidence: 79 }
  // ],
  // "23-8-2025": [
  //     { time: "14:00", league: "Premier League", homeLogo: "arsenal-logo.png", awayLogo: "chelsea-logo.png", home: "Arsenal", away: "Chelsea", score: "2 - 1", prediction: "BTTS - Yes", confidence: 85 },
  //     { time: "16:30", league: "Ligue 1", homeLogo: "psg-logo.png", awayLogo: "marseille-logo.png", home: "PSG", away: "Marseille", score: "3 - 0", prediction: "PSG Win", confidence: 90 }
  // ],
  // "24-8-2025": [
  //     { time: "18:00", league: "Bundesliga", homeLogo: "bayern-logo.png", awayLogo: "dortmund-logo.png", home: "Bayern Munich", away: "Borussia Dortmund", score: "1 - 1", prediction: "Draw", confidence: 80 },
  //     { time: "20:00", league: "Serie A", homeLogo: "juventus-logo.png", awayLogo: "milan-logo.png", home: "Juventus", away: "AC Milan", score: "1 - 2", prediction: "AC Milan Win", confidence: 75 }
  // ],
  // "25-8-2025": [
  //     { time: "22:00", league: "La Liga", homeLogo: "barcelona-logo.png", awayLogo: "real-madrid-logo.png", home: "Barcelona", away: "Real Madrid", score: "2 - 2", prediction: "Draw", confidence: 70 }
  // ],
  // "26-8-2025": [
  //     { time: "19:00", league: "Premier League", homeLogo: "liverpool-logo.png", awayLogo: "man-city-logo.png", home: "Liverpool", away: "Man City", score: "2 - 3", prediction: "Man City Win", confidence: 77 }
  // ],
  // "27-8-2025": [
  //     { time: "21:00", league: "Ligue 1", homeLogo: "lyon-logo.png", awayLogo: "monaco-logo.png", home: "Lyon", away: "Monaco", score: "1 - 1", prediction: "Draw", confidence: 73 }
  // ]
};

// Generate date buttons dynamically (-3 to +3 days)
for (let offset = -3; offset <= 3; offset++) {
  const d = new Date(today);
  d.setDate(today.getDate() + offset);

  const dayOfWeek = d.toLocaleDateString("default", { weekday: "long" });
  
  // FIX → use YYYY-MM-DD format
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}`;  // ✅ 2025-09-03

  let label = labels[offset] ? labels[offset] : dayOfWeek;

  const btn = document.createElement("button");
  btn.className = "date-tab";
  btn.textContent = label || dayOfWeek;

  const tooltip = document.createElement("span");
  tooltip.className = "tooltip-text";
  tooltip.textContent = `${dayOfWeek}, ${formattedDate}`;
  btn.appendChild(tooltip);

  if (offset === 0) btn.classList.add("active");

  btn.addEventListener("click", () => {
    document.querySelectorAll(".date-tab").forEach(tab => tab.classList.remove("active"));
    btn.classList.add("active");
    // loadMatches("2025-08-31"); // Testing specific date
    loadMatches(formattedDate); // ✅ now uses YYYY-MM-DD
  });

  choiceDateContainer.appendChild(btn);
}


// Show loader
function showLoader() {
  matchListDOM.innerHTML = `
    <div class="d-flex justify-content-center align-items-center py-4">
      <div class="spinner-border text-warning" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `;
}

// Render matches with toggleable accordion
function renderMatches(matches) {
  matchListDOM.innerHTML = `<div class="predictions-container"></div>`;
  const container = matchListDOM.querySelector(".predictions-container");

  if (matches.length === 0) {
    container.innerHTML = `<div class="loader">No matches available for this date.</div>`;
    return;
  }

  // matches.forEach((match, index) => {
  //   const accordionId = `accordionItem${index}`;
  //   const collapseId = `collapse${index}`;
  //   const headingId = `heading${index}`;

  //   const card = document.createElement("article");
  //   card.className = "prediction-card mb-4";
  //   card.style.paddingRight = "0"; // margin between cards

  //   card.innerHTML = `
  //     <div class="accordion accordion-flush" id="${accordionId}">
  //       <div class="accordion-item">
  //         <h2 class="accordion-header" id="${headingId}">
  //           <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
  //               ${match.home} vs ${match.away}
  //           </button>
  //         </h2>
  //         <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}">
  //           <div class="accordion-body">
  //               <div class="match-header">
  //                 <div class="team">
  //                   <img src="${match.homeLogo}" alt="${match.home} logo" class="team-logo" />
  //                   <div class="team-name">${match.home}</div>
  //                 </div>
  //                 <div class="match-score">${match.score}</div>
  //                 <div class="team">
  //                   <img src="${match.awayLogo}" alt="${match.away} logo" class="team-logo" />
  //                   <div class="team-name">${match.away}</div>
  //                 </div>
  //               </div>
  //               <div class="match-info">${match.league} • ${match.time}</div>
  //               <div class="prediction-details">Prediction: ${match.prediction}</div>
  //               <div class="confidence-badge">
  //                   Confidence: ${match.confidence}%
  //               </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   `;
  //   container.appendChild(card);
  // });



  matches.forEach((match, index) => {
    const accordionId = `accordionItem${index}`;
    const collapseId = `collapse${index}`;
    const headingId = `heading${index}`;
    const detailsId = `details${index}`;

    const card = document.createElement("article");
    card.className = "prediction-card mb-4 shadow-sm border rounded";
    card.style.paddingRight = "0";

    card.innerHTML = `
      <div class="accordion accordion-flush" id="${accordionId}">
        <div class="accordion-item">
          <h2 class="accordion-header" id="${headingId}">
            <button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
              ${match.home} vs ${match.away} • ${match.league}
            </button>
          </h2>
          <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}">
            <div class="accordion-body" style="background-color:#f9f9f9;">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="team text-center">
                  <img src="${match.homeLogo}" alt="${match.home} logo" class="team-logo mb-1" style="width:40px;height:40px;object-fit:contain;" />
                  <div class="team-name fw-semibold">${match.home}</div>
                </div>
                <div class="match-score fs-4 fw-bold text-primary">${match.score}</div>~~~~~
                <div class="team text-center">
                  <img src="${match.awayLogo}" alt="${match.away} logo" class="team-logo mb-1" style="width:40px;height:40px;object-fit:contain;" />
                  <div class="team-name fw-semibold">${match.away}</div>
                </div>
              </div>

              <div class="match-meta mb-2 text-muted" style="font-size:0.9rem;">
                Kickoff: ${match.time} • Status: ${match.status}
              </div>

              <button class="btn btn-outline-primary btn-sm mb-3" onclick="document.getElementById('${detailsId}').classList.toggle('d-none')">
                Explore More
              </button>

              <div id="${detailsId}" class="d-none">
                <div class="prediction-section mb-3">
                  <div><strong>Prediction:</strong> ${match.prediction}</div>

                  <div class="mt-2">
                    <strong>Confidence:</strong>
                    <div class="progress" style="height: 20px;">
                      <div class="progress-bar bg-success" role="progressbar" style="width: ${match.confidence}%; transition: width 1s;" aria-valuenow="${match.confidence}" aria-valuemin="0" aria-valuemax="100">
                        ${match.confidence}%
                      </div>
                    </div>
                  </div>

                  <div class="mt-3">
                    <strong>Expected Goals <span title="Expected Goals (xG)" style="cursor:help;">📈</span>:</strong>
                    ${match.xgHome} - ${match.xgAway}
                  </div>

                  <div class="mt-2">
                    <strong>Pressure Index <span title="Team pressure level" style="cursor:help;">⚡</span>:</strong>
                    <div class="progress" style="height: 20px;">
                      <div class="progress-bar bg-warning" role="progressbar" style="width: ${match.pressureIndex}%; transition: width 1s;" aria-valuenow="${match.pressureIndex}" aria-valuemin="0" aria-valuemax="100">
                        ${match.pressureIndex}%
                      </div>
                    </div>
                  </div>

                  <div class="mt-2">
                    <strong>Value Bet:</strong> ${match.valueBet ? "<span class='badge bg-success'>✅ Yes</span>" : "<span class='badge bg-danger'>❌ No</span>"}
                  </div>
                </div>

                <div class="odds-section mt-3">
                  <div><strong>Pre-Match Odds:</strong> Home ${match.odds.home} • Draw ${match.odds.draw} • Away ${match.odds.away}</div>
                  <div><strong>Live Odds:</strong> ${match.liveOdds ? match.liveOdds : "Not available"}</div>
                </div>

                <button class="btn btn-outline-secondary btn-sm mt-3" onclick="document.getElementById('${detailsId}').classList.add('d-none')">
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Toggle behavior: close previous, toggle clicked
  const allButtons = container.querySelectorAll(".accordion-button");
  allButtons.forEach(button => {
    button.addEventListener("click", () => {
      const currentCollapse = document.querySelector(button.dataset.bsTarget);
      const isOpen = currentCollapse.classList.contains("show");

      container.querySelectorAll(".accordion-collapse").forEach(collapse => {
        if (collapse !== currentCollapse) collapse.classList.remove("show");
      });

      if (isOpen) currentCollapse.classList.remove("show");
      else currentCollapse.classList.add("show");
    });
  });
}

// Load matches for a date
// Dynamic today date in YYYY-MM-DD for PHP
const todays = new Date();
const yyyy = todays.getFullYear();
const mm = String(todays.getMonth() + 1).padStart(2, "0");
const dd = String(todays.getDate()).padStart(2, "0");
const todayYYYYMMDD = `${yyyy}-${mm}-${dd}`;

// Load matches from PHP API
async function loadMatches(dateYYYYMMDD) {
  showLoader();

  try {
    const url = `https://point-sport.vercel.app/game/backend/getAllLeague.php?date=${dateYYYYMMDD}`;
    const res = await fetch(url);
    const data = await res.json();

    // Merge with existing matchesDB
    Object.assign(matchesDB, data);

    // Extract DD-MM-YYYY key (PHP returns reformatted keys)
    const keys = Object.keys(data);
    const matches = keys.length ? data[keys[0]] : [];

    console.log(matches);
    console.log("Date: ", dateYYYYMMDD);
    renderMatches(matches);
  } catch (err) {
    console.error("Error loading matches:", err);
  }
}

// Manual test
// loadMatches("2025-08-31"); // Change date for testing

// Dynamic load using today
loadMatches(todayYYYYMMDD); // Uncomment for dynamic testing
