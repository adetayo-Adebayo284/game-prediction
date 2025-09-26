const choiceDateContainer = document.getElementById("choice-date");
const matchListDOM = document.getElementById("matchList-choice");

const labels = { "-3": "", "-2": "", "-1": "Yesterday", "0": "Today", "1": "Tomorrow", "2": "", "3": "" };
const today = new Date();

// Mock matches database keyed by date (day-month-year)
const matchesDB = {};

// Generate date buttons dynamically (-3 to +3 days)
for (let offset = -3; offset <= 3; offset++) {
  const d = new Date(today);
  d.setDate(today.getDate() + offset);

  const dayOfWeek = d.toLocaleDateString("default", { weekday: "long" });
  
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}`;  // ✅ YYYY-MM-DD

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
    loadMatches(formattedDate);
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


function renderMatches(matches) {
  // --- Inject custom CSS for scrollbar once ---
  if (!document.getElementById("custom-scrollbar-style")) {
    const style = document.createElement("style");
    style.id = "custom-scrollbar-style";
    style.innerHTML = `
      .slider-container::-webkit-scrollbar {
        height: 6px;
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
      }
    `;
    document.head.appendChild(style);
  }

  matchListDOM.innerHTML = `<div class="predictions-container"></div>`;
  const container = matchListDOM.querySelector(".predictions-container");

  if (!matches || matches.length === 0) {
    container.innerHTML = `<div class="loader">No matches available for this date.</div>`;
    return;
  }

  matches.forEach((match, index) => {
    const detailsId = `details${index}`;
    const exploreWrapperId = `exploreWrapper${index}`;
    const exploreBtnId = `exploreBtn${index}`;

    // --- Compute Win Probabilities ---
    const homeWin = parseFloat(match.homeWinProbability || 0);
    const awayWin = parseFloat(match.awayWinProbability || 0);
    const drawWin = parseFloat(match.drawProbability || 0);
    const totalWin = homeWin + awayWin + drawWin || 1;
    const homeWidth = (homeWin / totalWin) * 100;
    const drawWidth = (drawWin / totalWin) * 100;
    const awayWidth = (awayWin / totalWin) * 100;

    const odds = match.odds || { home: "-", draw: "-", away: "-" };
    const xgHome = match.xgHome || "-";
    const xgAway = match.xgAway || "-";
    const liveOdds = match.liveOdds || null;

    // --- Compute Main Prediction ---
    let mainPrediction = "Not available";
    let mainConfidence = 0;
    if (match.predictions && match.predictions.length) {
      match.predictions.forEach(pred => {
        const values = pred.values || {};
        const entries = Object.entries(values);
        if (entries.length && typeof values === "object") {
          const [pick, conf] = entries.reduce((a,b) => a[1] > b[1] ? a : b);
          if (conf > mainConfidence) {
            mainConfidence = conf;
            mainPrediction = pick;
          }
        }
      });
    }

    // --- Pressure Index and Value Bet logic ---
    const pressureIndex = Math.round(Math.min(mainConfidence, 100));
    const valueBet = mainConfidence >= 70;

    const card = document.createElement("article");
    card.className = "prediction-card";
    card.style.cssText = `
      background: rgba(255, 255, 255, 0.08);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 20px !important;
      font-family: 'Segoe UI', sans-serif;
      color: #fff;
      margin: 20px 0 !important;
    `;

    card.innerHTML = `
      <div style="color: #fff; margin-bottom: 1rem; font-weight: 700; font-size: 1.1rem;">
        ${match.league} • Kickoff: 
        ${match.kickoff 
            ? new Date(match.kickoff).toLocaleDateString("default", { day: "2-digit", month: "short", year: "numeric" }) 
              + " " 
              + new Date(match.kickoff).toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" }) 
            : todayYYYYMMDD 
        } • Status: ${match.status}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div style="text-align: center;">
          <img src="${match.homeLogo || 'placeholder.png'}" style="width: 52px; height: 52px; object-fit: contain; margin-bottom: 6px;" />
          <div style="font-weight: 700; color: #ffd700;">${match.home}</div>
        </div>
        <div style="font-size: 1.2rem; font-weight: bold; color: #fff;">${match.score || "vs"}</div>
        <div style="text-align: center;">
          <img src="${match.awayLogo || 'placeholder.png'}" style="width: 52px; height: 52px; object-fit: contain; margin-bottom: 6px;" />
          <div style="font-weight: 700; color: #ffd700;">${match.away}</div>
        </div>
      </div>

      ${homeWin || awayWin || drawWin ? `
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
      </div>` : ""}

      <!-- Explore Details -->
      <div id="${exploreWrapperId}" style="text-align: center; padding: 15px 0;">
        <button id="${exploreBtnId}" onclick="toggleExplore('${detailsId}', '${exploreBtnId}', '${exploreWrapperId}')" style="
          border-radius: 50px;
          padding: 10px 24px;
          font-weight: 600;
          border: 2px solid #ffc107;
          background-color: transparent;
          color: #fff;
          cursor: pointer;
        ">Explore More</button>
      </div>

      <div id="${detailsId}" style="display: none; margin-top: 1rem; background: #1f2e4a; color: #ffd700; font-weight: 700; border-radius: 10px;">
        <h5>OVERALL</h5>
        <hr />
        <div style="text-transform: uppercase;"><strong>🔮 Prediction:</strong> ${mainPrediction}</div>
        <div style="margin-top: 1rem; color: #ffd700;"><strong>📈 Expected Goals (xG):</strong> ${xgHome} - ${xgAway}</div>
        <div style="margin-top: 1rem;"><strong>⚡ Pressure Index:</strong> 
          <div style="height: 20px; background: #444; border-radius: 10px; overflow: hidden; margin-top: 4px;">
            <div style="width: ${pressureIndex}%; background: #ffc107; height: 100%; text-align: center; line-height: 20px; color: #000;">${pressureIndex}%</div>
          </div>
        </div>
        <div style="margin-top: 1rem;"><strong>🎯 Confidence:</strong> ${mainConfidence}%</div>
        <div style="margin-top: 1rem;"><strong>✅ Value Bet:</strong> <span style="color:${valueBet ? '#0f0' : '#dc3545'};">${valueBet ? "Yes" : "No"}</span></div>
        <div style="margin-top: 1rem;"><strong>💰 Odds:</strong> Home ${odds.home} • Draw ${odds.draw} • Away ${odds.away}</div>
        <div style="margin-top: 1rem;"><strong>📺 Live Odds:</strong> ${liveOdds || "Not available"}</div>

        <!-- Slider -->
        <div class="slider-container" style="overflow-x: auto; display: flex; gap: 12px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; margin-top: 1rem;">
          ${match.predictions && match.predictions.length ? match.predictions.map(pred => {
            // Handle Clean Sheet specially
            if (pred.market === "Clean Sheet" && pred.values && pred.values.scores) {
              const rows = Object.entries(pred.values.scores)
                .map(([score, odd]) => `
                  <tr>
                    <td style="padding:4px 8px;border:1px solid #ccc;">${score}</td>
                    <td style="padding:4px 8px;border:1px solid #ccc;">${odd}</td>
                  </tr>
                `).join("");
              return `
                <div class="slide" style="flex: 0 0 90%; min-width: 240px; background:#2a3d66; padding:14px; border-radius:10px; scroll-snap-align:start; font-size:0.8rem; max-height:260px; overflow-y:auto;">
                  <div><strong>🔮 Market:</strong> ${pred.market}</div>
                  <div style="margin-top:.25rem;"><strong>💰 Values:</strong></div>
                  <table style="border-collapse:collapse;margin-top:4px;width:100%;color:#fff;font-size:0.8rem;">
                    <thead>
                      <tr>
                        <th style="padding:4px 8px;border:1px solid #ccc;">Score</th>
                        <th style="padding:4px 8px;border:1px solid #ccc;">Odds</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rows}
                    </tbody>
                  </table>
                </div>
              `;
            } else {
              // Normal market
              const entries = Object.entries(pred.values || {});
              let bestPick = "N/A";
              let bestConfidence = 0;
              if (entries.length) {
                const [pick, conf] = entries.reduce((a, b) => a[1] > b[1] ? a : b);
                bestPick = pick;
                bestConfidence = conf;
              }
              return `
                <div class="slide" style="flex: 0 0 70%; min-width: 160px; background:#2a3d66; padding:14px; border-radius:10px; scroll-snap-align:start; font-size:0.85rem;">
                  <div><strong>🔮 Market:</strong> ${pred.market}</div>
                  <div style="margin-top: .25rem;"><strong>📊 Prediction:</strong> ${pred.prediction?.pick || bestPick}</div>
                  <div style="margin-top: .25rem;"><strong>🎯 Confidence:</strong> ${pred.prediction?.confidence || bestConfidence}%</div>
                  <div style="margin-top: .25rem;"><strong>💰 Values:</strong> ${entries.map(([k,v]) => `${k}: ${v}`).join(" • ")}</div>
                </div>
              `;
            }
          }).join("") : `<div>No predictions available</div>`}
        </div>

        <div style="text-align: center; margin-top: .5rem;">
          <button onclick="toggleExplore('${detailsId}', '${exploreBtnId}', '${exploreWrapperId}')" style="
            border-radius: 50px;
            padding: 10px 24px;
            background-color: #dc3545;
            color: white;
            cursor: pointer;
          ">✖ Close</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}



function toggleExplore(detailsId, exploreBtnId, exploreWrapperId) {
  const details = document.getElementById(detailsId);
  const exploreBtn = document.getElementById(exploreBtnId);
  const exploreWrapper = document.getElementById(exploreWrapperId);

  const isOpen = details.style.display === "block";

  if (isOpen) {
    details.style.display = "none";
    exploreBtn.style.display = "inline-block";
    exploreWrapper.style.padding = "15px 0";
  } else {
    details.style.display = "block";
    exploreBtn.style.display = "none";
    exploreWrapper.style.padding = "0";
  }
}


// Load matches for a date
const todays = new Date();
const yyyy = todays.getFullYear();
const mm = String(todays.getMonth() + 1).padStart(2, "0");
const dd = String(todays.getDate()).padStart(2, "0");
const todayYYYYMMDD = `${yyyy}-${mm}-${dd}`;

async function loadMatches(dateYYYYMMDD) {
  showLoader();

  try {
    const url = `../../game/backend/getAllLeague.php?date=${dateYYYYMMDD}`;
    const res = await fetch(url);
    const data = await res.json();

    // ✅ Save to localStorage
    localStorage.setItem("matchesDB", JSON.stringify(data));
    Object.assign(matchesDB, data);

    // ✅ Collect all matches from all leagues
    let matches = [];
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        matches = matches.concat(data[key]);
      }
    });

    console.log("Loaded from API:", matches);
    renderMatches(matches);
  } catch (err) {
    console.error("Error loading matches:", err);

    // ✅ Load ALL matches from localStorage
    const cached = localStorage.getItem("matchesDB");
    if (cached) {
      const data = JSON.parse(cached);
      Object.assign(matchesDB, data);

      let matches = [];
      Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
          matches = matches.concat(data[key]);
        }
      });

      console.log("Loaded from localStorage:", matches);
      renderMatches(matches);
    } else {
      renderMatches([]); // show "No matches available"
    }
  }
}

// Dynamic load using today
loadMatches(todayYYYYMMDD);

