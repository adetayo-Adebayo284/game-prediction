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
// Render matches

function renderMatches(matches) {
  matchListDOM.innerHTML = `<div class="predictions-container"></div>`;
  const container = matchListDOM.querySelector(".predictions-container");

  if (matches.length === 0) {
    container.innerHTML = `<div class="loader">No matches available for this date.</div>`;
    return;
  }

  // Clear and initialize football storage if nothing exists
  if (!localStorage.getItem("football")) {
    localStorage.setItem("football", JSON.stringify([]));
  }

  matches.forEach((match, index) => {
    const detailsId = `details${index}`;
    const exploreWrapperId = `exploreWrapper${index}`;
    const exploreBtnId = `exploreBtn${index}`;

    const homeWin = parseFloat(match.homeWinProbability || 0);
    const awayWin = parseFloat(match.awayWinProbability || 0);
    const drawWin = parseFloat(match.drawProbability || 0);
    const totalWin = homeWin + awayWin + drawWin || 1;

    const homeWidth = (homeWin / totalWin) * 100;
    const drawWidth = (drawWin / totalWin) * 100;
    const awayWidth = (awayWin / totalWin) * 100;

    // ✅ Condition to auto-save good matches
    if (match.confidence >= 70 && (homeWin >= 50 || awayWin >= 50)) {
      let savedMatches = JSON.parse(localStorage.getItem("football")) || [];
      // Avoid duplicates by checking IDs
      if (!savedMatches.some(m => m.id === match.id)) {
        savedMatches.push(match);
        localStorage.setItem("football", JSON.stringify(savedMatches));
        console.log("✅ Match auto-saved:", match);
      }
    }

    const card = document.createElement("article");
    card.className = "prediction-card mb-4";
    card.style.cssText = `
      background: rgba(255, 255, 255, 0.08);;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 30px !important;
      font-family: 'Segoe UI', sans-serif;
      color: #fff;
      padding: 10px !important;
      margin-top: 20px !important;
    `;

    card.innerHTML = `
      <div style="color: #fff; margin-bottom: 1rem; font-weight: 700; font-size: 1.1rem;">
        ${match.league} • Kickoff: ${match.time} • Status: ${match.status}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div style="text-align: center;">
          <img src="${match.home}" style="width: 52px; height: 52px; object-fit: contain; margin-bottom: 6px;" />
          <div style="font-weight: 700; color: #ffd700;">${match.home}</div>
        </div>
        <div style="font-size: 1.5rem; font-weight: bold; color: #fff;">${match.score}</div>
        <div style="text-align: center;">
          <img src="${match.away}" style="width: 52px; height: 52px; object-fit: contain; margin-bottom: 6px;" />
          <div style="font-weight: 700; color: #ffd700; ">${match.away}</div>
        </div>
      </div>

      <div style="margin-bottom: 1rem;">
        <strong>Win Probability: </strong>
        <div style="height: 22px; display: flex; border-radius: 8px; overflow: hidden; margin-top: 6px;">
          <div style="width: ${homeWidth}%; background-color: #dc3545; color: white; text-align: center; line-height: 22px;">
            ${match.home} 
          </div>
          <div style="width: ${drawWidth}%; background-color: #6c757d; color: white; text-align: center; line-height: 22px;">
            Draw
          </div>
          <div style="width: ${awayWidth}%; background-color: #0dcaf0; color: white; text-align: center; line-height: 22px;">
            ${match.away}
          </div>
        </div>
        <!-- Corrected alignment block -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px;">
          <div style="width: ${homeWidth}%; text-align: center;">${homeWin}%</div>
          <div style="width: ${drawWidth}%; text-align: center;">${drawWin}%</div>
          <div style="width: ${awayWidth}%; text-align: center;">${awayWin}%</div>
        </div>
      </div>
      
      <!-- Explore Button Wrapper -->
      <div id="${exploreWrapperId}" style="text-align: center; padding: 15px 0;">
        <button id="${exploreBtnId}" onclick="toggleExplore('${detailsId}', '${exploreBtnId}', '${exploreWrapperId}')" style="
          border-radius: 50px;
          padding: 10px 24px;
          font-weight: 600;
          box-shadow: 0 0 4px 6px rgba(0,0,0,0.15);
          border: 2px solid #ffc107;
          background-color: transparent;
          color: #fff;
          cursor: pointer;
          font-weight: 700;
        ">Explore More</button>
      </div>

      <!-- Details Section -->
      <div id="${detailsId}" style="display: none; margin-top: 1rem; padding: 20px; background: #1f2e4a; color: #ffd700; font-weight: 700; ">
        <hr />
        <div><strong>🔮 Prediction:</strong> ${match.prediction}</div>
        <div style="margin-top: 1rem; color: #ffd700;"><strong>📈 Expected Goals (xG):</strong> ${match.xgHome} - ${match.xgAway}</div>
       
        <div style="margin-top: 1rem;">
          <strong>⚡ Pressure Index:</strong>
          <div style="height: 20px; background-color: #ffc107; width: ${match.pressureIndex}%; text-align: center; color: black; line-height: 20px;">
            ${match.pressureIndex}%
          </div>
        </div>
       
        <div style="margin-top: 1rem; color: #ffd700;">
          <strong>🎯 Confidence Level:</strong>
          <div style="height: 20px; background-color: #198754; width: ${match.confidence}%; text-align: center; color: white; line-height: 20px;">
            ${match.confidence}%
          </div>
        </div>
       
        <div style="margin-top: 1rem; color: #ffd700;">
          <strong>✅ Value Bet:</strong> 
          ${
            match.valueBet
              ? "<span style='background:#198754; color:#fff; padding:2px 8px; border-radius:6px; font-weight:600;'>Yes</span>"
              : "<span style='background:#dc3545; color:#fff; padding:2px 8px; border-radius:6px; font-weight:600;'>No</span>"
          }
        </div>
        <div style="margin-top: 1rem; color: #ffd700;">
          <strong>💰 Pre-Match Odds:</strong> Home ${match.odds.home} • Draw ${match.odds.draw} • Away ${match.odds.away}
        </div>
        <div style="margin-top: 1rem; color: #ffd700;">
          <strong>📺 Live Odds:</strong> ${match.liveOdds ? match.liveOdds : "Not available"}
        </div>

        <!-- Close Button -->
        <div style="text-align: center; margin-top: 1.5rem; padding: 10px 0;">
          <button onclick="toggleExplore('${detailsId}', '${exploreBtnId}', '${exploreWrapperId}')" style="
            border-radius: 50px;
            padding: 10px 24px;
            font-weight: 600;
            border: none;
            background-color: #dc3545;
            color: white;
            cursor: pointer;
          ">✖ Close</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });


  // matches.forEach((match, index) => {
  //   const detailsId = `details${index}`;
  //   const exploreWrapperId = `exploreWrapper${index}`;
  //   const exploreBtnId = `exploreBtn${index}`;

  //   const homeWin = parseFloat(match.homeWinProbability || 0);
  //   const awayWin = parseFloat(match.awayWinProbability || 0);
  //   const drawWin = parseFloat(match.drawProbability || 0);
  //   const totalWin = homeWin + awayWin + drawWin || 1;

  //   const homeWidth = (homeWin / totalWin) * 100;
  //   const drawWidth = (drawWin / totalWin) * 100;
  //   const awayWidth = (awayWin / totalWin) * 100;

  //   const card = document.createElement("article");
  //   card.className = "prediction-card mb-4";
  //   card.style.cssText = `
  //     background: #fff;
  //     box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  //     padding: 30px !important;
  //     font-family: 'Segoe UI', sans-serif;
  //     color: #111;
  //     padding: 10px !important;
  //     margin-top: 20px !important;
  //   `;

  //   card.innerHTML = `
  //     <div style="color: #222; margin-bottom: 1rem; font-weight: 700; font-size: 1.2rem;">
  //       ${match.league} • Kickoff: ${match.time} • Status: ${match.status}
  //     </div>

  //     <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
  //       <div style="text-align: center;">
  //         <img src="${match.homeLogo}" style="width: 52px; height: 52px; object-fit: contain; margin-bottom: 6px;" />
  //         <div style="font-weight: 600;">${match.home}</div>
  //       </div>
  //       <div style="font-size: 1.5rem; font-weight: bold; color: #007bff;">${match.score}</div>
  //       <div style="text-align: center;">
  //         <img src="${match.awayLogo}" style="width: 52px; height: 52px; object-fit: contain; margin-bottom: 6px;" />
  //         <div style="font-weight: 600;">${match.away}</div>
  //       </div>
  //     </div>

  //     <div style="margin-bottom: 1rem;">
  //       <strong>Win Probability:</strong>
  //       <div style="height: 22px; display: flex; border-radius: 8px; overflow: hidden; margin-top: 6px;">
  //         <div style="width: ${homeWidth}%; background-color: #dc3545; color: white; text-align: center; line-height: 22px;">
  //           ${match.home} ${homeWin}%
  //         </div>
  //         <div style="width: ${drawWidth}%; background-color: #6c757d; color: white; text-align: center; line-height: 22px;">
  //           Draw ${drawWin}%
  //         </div>
  //         <div style="width: ${awayWidth}%; background-color: #0dcaf0; color: white; text-align: center; line-height: 22px;">
  //           ${match.away} ${awayWin}%
  //         </div>
  //       </div>
  //     </div>


  //     <!-- Explore Button Wrapper -->
  //     <div id="${exploreWrapperId}" style="text-align: center; padding: 15px 0;">
  //       <button id="${exploreBtnId}" onclick="toggleExplore('${detailsId}', '${exploreBtnId}', '${exploreWrapperId}')" style="
  //         border-radius: 50px;
  //         padding: 10px 24px;
  //         font-weight: 600;
  //         box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  //         border: none;
  //         background-color: #ffc107;
  //         color: #000;
  //         cursor: pointer;
  //         font-weight: 700;
  //       ">Explore More</button>
  //     </div>

  //     <!-- Details Section -->
  //     <div id="${detailsId}" style="display: none; margin-top: 1rem; padding: 20px; background: rgba(248,249,250,0.95);">
  //       <hr />
  //       <div><strong>🔮 Prediction:</strong> ${match.prediction}</div>
  //       <div style="margin-top: 0.5rem;"><strong>📈 Expected Goals (xG):</strong> ${match.xgHome} - ${match.xgAway}</div>
  //       <div style="margin-top: 0.5rem;">
  //         <strong>⚡ Pressure Index:</strong>
  //         <div style="height: 20px; background-color: #ffc107; width: ${match.pressureIndex}%; text-align: center; color: black; line-height: 20px;">
  //           ${match.pressureIndex}%
  //         </div>
  //       </div>
  //       <div style="margin-top: 0.5rem;">
  //         <strong>🎯 Confidence Level:</strong>
  //         <div style="height: 20px; background-color: #198754; width: ${match.confidence}%; text-align: center; color: white; line-height: 20px;">
  //           ${match.confidence}%
  //         </div>
  //       </div>
  //       <div style="margin-top: 0.5rem;">
  //         <strong>✅ Value Bet:</strong> 
  //         ${
  //           match.valueBet
  //             ? "<span style='background:#198754; color:#fff; padding:2px 8px; border-radius:6px; font-weight:600;'>Yes</span>"
  //             : "<span style='background:#dc3545; color:#fff; padding:2px 8px; border-radius:6px; font-weight:600;'>No</span>"
  //         }
  //       </div>
  //       <div style="margin-top: 0.5rem;">
  //         <strong>💰 Pre-Match Odds:</strong> Home ${match.odds.home} • Draw ${match.odds.draw} • Away ${match.odds.away}
  //       </div>
  //       <div style="margin-top: 0.5rem;">
  //         <strong>📺 Live Odds:</strong> ${match.liveOdds ? match.liveOdds : "Not available"}
  //       </div>

  //       <!-- Close Button -->
  //       <div style="text-align: center; margin-top: 1.5rem; padding: 10px 0;">
  //         <button onclick="toggleExplore('${detailsId}', '${exploreBtnId}', '${exploreWrapperId}')" style="
  //           border-radius: 50px;
  //           padding: 10px 24px;
  //           font-weight: 600;
  //           border: none;
  //           background-color: #dc3545;
  //           color: white;
  //           cursor: pointer;
  //         ">✖ Close</button>
  //       </div>
  //     </div>
  //   `;

  //   container.appendChild(card);
  // });
}

function toggleExplore(detailsId, exploreBtnId, exploreWrapperId) {
  const details = document.getElementById(detailsId);
  const exploreBtn = document.getElementById(exploreBtnId);
  const exploreWrapper = document.getElementById(exploreWrapperId);

  const isOpen = details.style.display === "block";

  if (isOpen) {
    details.style.display = "none";
    exploreBtn.style.display = "inline-block";
    exploreWrapper.style.padding = "15px 0"; // restore padding
  } else {
    details.style.display = "block";
    exploreBtn.style.display = "none";
    exploreWrapper.style.padding = "0"; // remove empty padding
  }
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
    const url = `../../game/backend/getAllLeague.php?date=${dateYYYYMMDD}`;
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
