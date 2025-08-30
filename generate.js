//  /* ----------------------------
//     Demo Data Setup (unchanged)
//     Replace with backend fetch in production
// -----------------------------*/
// const DEMO_RESPONSE = {
//     sports: ["Soccer", "Basketball", "Volleyball", "Hockey", "Tennis", "Cricket", "Rugby"],
//     risk_levels: { very_low: [1.10, 1.40], low: [1.41, 1.80], medium: [1.81, 2.60], high: [2.61, 3.50] },
//     teams: {
//         soccer: ["Real Madrid", "Barcelona", "Man City", "Liverpool", "PSG", "AC Milan"],
//         basketball: ["Lakers", "Celtics", "Warriors", "Bulls", "Nets", "Heat"],
//         volleyball: ["Volley A", "Volley B", "Volley C", "Volley D"],
//         hockey: ["Rangers", "Bruins", "Maple Leafs", "Blackhawks"],
//         tennis: ["Djokovic", "Nadal", "Federer", "Alcaraz"],
//         cricket: ["India", "Australia", "England", "Pakistan"],
//         rugby: ["All Blacks", "Springboks", "England Rugby", "France Rugby"]
//     },
//     markets: {
//         soccer: ["Win", "Draw", "Over 2.5", "Under 2.5"],
//         basketball: ["Win", "Over Points", "Under Points"],
//         volleyball: ["Win", "Set Handicap", "Over Points"],
//         hockey: ["Win", "Over Goals", "Under Goals"],
//         tennis: ["Win", "Over Sets", "Under Sets"],
//         cricket: ["Win", "Top Batsman", "Over Runs"],
//         rugby: ["Win", "Try Handicap", "Over Points"]
//     }
// };

// /* ----------------------------
//     Wire up DOM + state
// -----------------------------*/
// const POPULAR_SPORTS = DEMO_RESPONSE.sports;
// const RISK_LEVELS = DEMO_RESPONSE.risk_levels;
// const TEAMS = DEMO_RESPONSE.teams;
// const MARKETS = DEMO_RESPONSE.markets;

// const sportEl = document.getElementById('sport');
// const riskGroup = document.getElementById('riskGroup');
// const generateBtn = document.getElementById('generateBtn');
// const regenerateBtn = document.getElementById('regenerateBtn');
// const resetBtn = document.getElementById('resetBtn');
// const oddsRangeEl = document.getElementById('oddsTarget');
// const oddsNumberEl = document.getElementById('oddsTargetNumber');
// const oddsLabelEl = document.getElementById('oddsTargetLabel');
// const listEl = document.getElementById('list');
// const spinner = document.getElementById('spinner');
// const selectedCountEl = document.getElementById('selectedCount');
// const totalOddsEl = document.getElementById('totalOdds');
// const totalOddsBigEl = document.getElementById('totalOddsBig');
// const targetEchoEl = document.getElementById('targetEcho');
// const toleranceEchoEl = document.getElementById('toleranceEcho');
// const riskEchoEl = document.getElementById('riskEcho');

// let state = {
//     sport: POPULAR_SPORTS[0].toLowerCase(),
//     risk: 'low',
//     target: 500,
//     tolerance: 0.10,
//     candidates: [],
//     rows: [],
//     selectedIds: new Set()
// };

// /* ----------------------------
//     Small helpers
// -----------------------------*/
// const rand = (min, max) => Math.random() * (max - min) + min;
// const pick = arr => arr[Math.floor(Math.random() * arr.length)];
// const shuffle = arr => arr.map(v => [v, Math.random()]).sort((a, b) => a[1] - b[1]).map(v => v[0]);
// const fmtOdds = x => Number(x).toFixed(2);
// const wait = ms => new Promise(r => setTimeout(r, ms));
// const prettyRisk = r => r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
// const showSpinner = on => spinner.classList.toggle('show', on);

// // product helper — numeric multiplication, robust for empty arrays
// function product(arr, selector = x => x) {
//     if (!arr || arr.length === 0) return 1;
//     return arr.reduce((p, c) => p * Number(selector(c) || 1), 1);
// }

// /* ----------------------------
//     Candidate generation (DEMO)
//     In production: replace this with your API response
// -----------------------------*/
// function generateCandidates(sport, risk, count = 40) {
//     const [lo, hi] = RISK_LEVELS[risk];
//     const teams = TEAMS[sport] || [];
//     const markets = MARKETS[sport] || ['Win'];
//     const pool = [];

//     for (let i = 0; i < count; i++) {
//         const home = pick(teams);
//         const away = pick(teams.filter(t => t !== home));
//         const market = pick(markets);
//         const odds = +(rand(lo, hi)).toFixed(2);

//         pool.push({
//             id: `${sport}-${risk}-${i}-${Date.now()}`,
//             sport, risk, home, away, market, odds,
//             league: `${sport.toUpperCase()} League`,
//             kick: new Date(Date.now() + rand(2, 120) * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '),
//             homeLogo: home
//                 ? `https://example.com/logos/${home.toLowerCase()}.png`
//                 : './assets/images.jpg',
//             awayLogo: away
//                 ? `https://example.com/logos/${away.toLowerCase()}.png`
//                 : './assets/images.jpg'

//         });
//     }
//     return shuffle(pool);
// }

// /* ----------------------------
//     Build accumulator (corrected)
//     Greedy + small backtrack trimming
// -----------------------------*/
// function buildAccumulator(pool, target, tolerancePct = 0.10) {
//     const targetLow = target * (1 - tolerancePct);
//     const targetHigh = target * (1 + tolerancePct);

//     // Sort by odds descending to reach target faster
//     const sorted = [...pool].sort((a, b) => b.odds - a.odds);

//     let best = [];
//     let bestDiff = Infinity;
//     let picked = [];
//     let current = 1;

//     for (const m of sorted) {
//         // guard runaway
//         if (current * m.odds <= targetHigh * 1.15) {
//             picked.push(m);
//             current *= m.odds;

//             const diff = Math.abs(current - target);
//             if (diff < bestDiff) {
//                 bestDiff = diff;
//                 best = [...picked];
//             }
//             // if we land inside band — return immediately
//             if (current >= targetLow && current <= targetHigh) {
//                 return picked;
//             }
//         }
//     }

//     // If we didn't land inside band, use best found so far or try trimming
//     picked = best.length ? best : picked;
//     current = product(picked, x => x.odds);

//     // trim largest odds iteratively to try to get closer
//     picked.sort((a, b) => b.odds - a.odds);
//     for (let i = 0; i < picked.length; i++) {
//         if (current >= targetLow && current <= targetHigh) break;
//         const removed = picked[i];
//         const after = current / removed.odds;
//         if (Math.abs(after - target) < Math.abs(current - target)) {
//             current = after;
//             picked.splice(i, 1);
//             i = -1; // restart
//         }
//     }

//     return picked;
// }

// /* ----------------------------
//     Render list (no repeated event binding)
// -----------------------------*/
// function renderList() {
//     listEl.innerHTML = '';
//     for (const m of state.rows) {
//         const row = document.createElement('div');
//         row.className = 'row' + (state.selectedIds.has(m.id) ? ' selected' : '');
//         row.dataset.id = m.id;

//         // Generate unique IDs for accordion
//         const accordionId = `accordion-${m.id}`;
//         const headingId = `heading-${m.id}`;
//         const collapseId = `collapse-${m.id}`;
//         const key = m.id; // for tooltip id
//         const isFavorited = state.selectedIds.has(m.id); // reuse selection for demo fav

//         // Demo prediction
//         const predictions = ["Home Win", "Away Win", "Draw", "Over 2.5", "Under 2.5"];
//         const prediction = pick(predictions);

//         row.innerHTML = `
//         <div class="accordion accordion-flush" id="${accordionId}">
//           <div class="accordion-item">
//             <h2 class="accordion-header" id="${headingId}">
//               <button class="accordion-button collapsed" type="button" 
//                 data-bs-toggle="collapse" 
//                 data-bs-target="#${collapseId}" 
//                 aria-expanded="false" 
//                 aria-controls="${collapseId}">
//                 ${m.home} vs ${m.away}
//               </button>
//             </h2>
//             <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}">
//               <div class="accordion-body">

//                 <div class="match-header">
//                   <div class="team">
//                     <img src="${m.homeLogo}" alt="${m.home} logo" class="team-logo" />
//                     <div class="team-name">${m.home}</div>
//                   </div>
//                   <div class="match-score">@ ${fmtOdds(m.odds)}</div>
//                   <div class="team">
//                     <img src="${m.awayLogo}" alt="${m.away} logo" class="team-logo" />
//                     <div class="team-name">${m.away}</div>
//                   </div>
//                 </div>

//                 <div class="match-info">
//                   ${m.market} • ${prettyRisk(m.risk)} • ${m.league} • ${m.kick}
//                 </div>

//                 <div class="prediction-details">
//                   Prediction: ${prediction}
//                 </div>

//                 <div class="tooltip-badge confidence-badge" tabindex="0" aria-describedby="tooltip-${key}">
//                   Confidence: ${m.confidence || 'N/A'}%
//                   <span class="tooltip-texts" role="tooltip" id="tooltip-${key}">
//                     Confidence indicates likelihood of prediction accuracy
//                   </span>
//                 </div>

//                 <div class="card-actions" role="group" aria-label="Prediction actions">
//                   <button class="action-btn btn-save" aria-pressed="${isFavorited}" 
//                     aria-label="${isFavorited ? "Remove from favorites" : "Add to favorites"}" 
//                     title="${isFavorited ? "Remove from favorites" : "Add to favorites"}">
//                     <svg xmlns="http://www.w3.org/2000/svg" fill="${isFavorited ? "#ffc107" : "none"}" stroke="#ffd700" stroke-width="2" viewBox="0 0 24 24" width="24" height="24" style="vertical-align: middle;">
//                       <path stroke-linejoin="round" stroke-linecap="round" d="M12 17.27L18.18 21 15.64 14.14 22 10.27 15.09 10.14 12 3 8.91 10.14 2 10.27 8.36 14.14 5.82 21z"/>
//                     </svg>
//                   </button>

//                   <button class="action-btn copy-btn" 
//                     data-text="${m.home} vs ${m.away} | Prediction: ${prediction} | Odds: ${fmtOdds(m.odds)}"
//                     aria-label="Copy prediction" title="Copy prediction info">
//                     📋 Copy
//                   </button>

//                   <button class="action-btn share-btn" 
//                     data-text="${m.home} vs ${m.away} | Prediction: ${prediction} | Odds: ${fmtOdds(m.odds)}"
//                     aria-label="Share prediction" title="Share prediction info">
//                     📤 Share
//                   </button>
//                 </div>

//               </div>
//             </div>
//           </div>
//         </div>
//         `;

//         listEl.appendChild(row);
//     }

//     // Attach copy/share events
//     document.querySelectorAll('.copy-btn').forEach(btn => {
//         btn.addEventListener('click', () => {
//             navigator.clipboard.writeText(btn.dataset.text).then(() => alert('Copied to clipboard!'));
//         });
//     });

//     document.querySelectorAll('.share-btn').forEach(btn => {
//         btn.addEventListener('click', () => {
//             if (navigator.share) {
//                 navigator.share({ text: btn.dataset.text }).catch(err => console.log(err));
//             } else {
//                 alert('Sharing not supported on this device.');
//             }
//         });
//     });
// }


// /* ----------------------------
//     Auto select matches based on user preferences
//     Uses buildAccumulator to pick best combination
// -----------------------------*/
// function autoSelectMatches() {
//     // Clear previous selection
//     state.selectedIds.clear();

//     // Use buildAccumulator to find best picks from state.rows
//     const picks = buildAccumulator(state.rows, state.target, state.tolerance);

//     // Save picks into state.selectedIds
//     picks.forEach(p => state.selectedIds.add(p.id));

//     // Update UI buttons/rows
//     document.querySelectorAll('#list .row').forEach(row => {
//         const id = row.dataset.id;
//         const btn = row.querySelector('.select-btn');
//         if (state.selectedIds.has(id)) {
//             row.classList.add('selected');
//             btn.classList.add('selected');
//             btn.textContent = 'Auto-Selected';
//         } else {
//             row.classList.remove('selected');
//             btn.classList.remove('selected');
//             btn.textContent = 'Select';
//         }
//     });

//     updateTotals();
// }

// /* ----------------------------
//     Click handler (single delegation)
// -----------------------------*/
// function onListClick(e) {
//     const row = e.target.closest('.row');
//     if (!row) return;
//     const id = row.dataset.id;

//     if (e.target.classList.contains('expand')) {
//         const body = row.querySelector('.body');
//         body.classList.toggle('show');
//         e.target.textContent = body.classList.contains('show') ? 'Details ▴' : 'Details ▾';
//         return;
//     }

//     if (e.target.classList.contains('select-btn')) {
//         // toggle manual selection
//         if (state.selectedIds.has(id)) {
//             state.selectedIds.delete(id);
//             row.classList.remove('selected');
//             e.target.classList.remove('selected');
//             e.target.textContent = 'Select';
//         } else {
//             state.selectedIds.add(id);
//             row.classList.add('selected');
//             e.target.classList.add('selected');
//             e.target.textContent = 'Selected';
//         }
//         updateTotals();
//     }
// }

// /* ----------------------------
//     Totals display (accurate)
// -----------------------------*/
// function updateTotals() {
//     // Get all selected matches
//     const selected = state.rows.filter(r => state.selectedIds.has(r.id));

//     // ✅ Multiply all odds together (accumulator style)
//     const total = selected.reduce((acc, x) => acc * parseFloat(x.odds), 1);

//     // Keep to 2 decimals
//     const safeTotal = Number(total).toFixed(2);

//     // Update UI
//     selectedCountEl.textContent = selected.length;
//     totalOddsEl.textContent = safeTotal;
//     totalOddsBigEl.textContent = safeTotal;

//     // ✅ Highlight if within target range
//     const low = state.target * (1 - state.tolerance);
//     const high = state.target * (1 + state.tolerance);

//     totalOddsBigEl.style.color =
//         (total >= low && total <= high)
//             ? 'var(--ok)'
//             : 'var(--text)';

//     // Save state
//     state.totalOdds = total;
// }


// /* ----------------------------
//     Control functions & generate/regenerate
// -----------------------------*/
// function syncTargetUI() {
//     oddsLabelEl.textContent = Number(state.target).toFixed(2);
//     targetEchoEl.textContent = Number(state.target).toFixed(2);
//     toleranceEchoEl.textContent = `±${Math.round(state.tolerance * 100)}%`;
// }
// function setRisk(r) {
//     state.risk = r;
//     Array.from(riskGroup.querySelectorAll('.pill')).forEach(p => p.classList.toggle('active', p.dataset.risk === r));
//     riskEchoEl.textContent = prettyRisk(r);
// }

// async function generate() {
//     showSpinner(true);
//     await wait(300);
//     state.candidates = generateCandidates(state.sport, state.risk, 60);
//     state.rows = [...state.candidates];
//     renderList();
//     // Auto-select based on user preferences
//     autoSelectMatches();
//     showSpinner(false);
// }

// async function regenerate() {
//     showSpinner(true);
//     await wait(300);
//     const fresh = generateCandidates(state.sport, state.risk, 60);
//     state.candidates = fresh;
//     state.rows = [...fresh];
//     renderList();
//     autoSelectMatches();
//     showSpinner(false);
// }

// /* ----------------------------
//     Attach UI, events (only once)
// -----------------------------*/
// (function init() {
//     // populate selects/pills (kept minimal since earlier code already filled them)
//     POPULAR_SPORTS.forEach(s => {
//         const opt = document.createElement('option'); opt.value = s.toLowerCase(); opt.textContent = s; sportEl.appendChild(opt);
//     });
//     Object.keys(RISK_LEVELS).forEach(r => {
//         const btn = document.createElement('button'); btn.className = `pill ${r === 'low' ? 'active' : ''}`; btn.dataset.risk = r;
//         btn.textContent = r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()); riskGroup.appendChild(btn);
//     });

//     // delegate clicks once
//     listEl.addEventListener('click', onListClick);

//     // wire controls
//     riskGroup.addEventListener('click', e => {
//         const b = e.target.closest('.pill'); if (!b) return;
//         setRisk(b.dataset.risk); regenerate();
//     });
//     oddsRangeEl.addEventListener('input', e => { const v = Math.max(2, Math.min(1000, +e.target.value)); oddsNumberEl.value = v; state.target = v; syncTargetUI(); });
//     oddsNumberEl.addEventListener('input', e => { const v = Math.max(2, Math.min(1000, +e.target.value)); oddsRangeEl.value = v; state.target = v; syncTargetUI(); });
//     sportEl.addEventListener('change', e => { state.sport = e.target.value; });
//     generateBtn.addEventListener('click', generate);
//     regenerateBtn.addEventListener('click', regenerate);
//     resetBtn.addEventListener('click', () => {
//         state.selectedIds.clear();
//         listEl.querySelectorAll('.row').forEach(r => {
//             r.classList.remove('selected');
//             const btn = r.querySelector('.select-btn'); if (btn) { btn.classList.remove('selected'); btn.textContent = 'Select'; }
//         });
//         updateTotals();
//     });

//     syncTargetUI();
//     setRisk('low');
// })();











/* ----------------------------
    Demo Data Setup (unchanged)
    Replace with backend fetch in production
-----------------------------*/
const DEMO_RESPONSE = {
    sports: ["Soccer", "Basketball", "Volleyball", "Hockey", "Tennis", "Cricket", "Rugby"],
    risk_levels: { very_low: [1.10, 1.40], low: [1.41, 1.80], medium: [1.81, 2.60], high: [2.61, 3.50] },
    teams: {
        soccer: ["Real Madrid", "Barcelona", "Man City", "Liverpool", "PSG", "AC Milan"],
        basketball: ["Lakers", "Celtics", "Warriors", "Bulls", "Nets", "Heat"],
        volleyball: ["Volley A", "Volley B", "Volley C", "Volley D"],
        hockey: ["Rangers", "Bruins", "Maple Leafs", "Blackhawks"],
        tennis: ["Djokovic", "Nadal", "Federer", "Alcaraz"],
        cricket: ["India", "Australia", "England", "Pakistan"],
        rugby: ["All Blacks", "Springboks", "England Rugby", "France Rugby"]
    },
    markets: {
        soccer: ["Win", "Draw", "Over 2.5", "Under 2.5"],
        basketball: ["Win", "Over Points", "Under Points"],
        volleyball: ["Win", "Set Handicap", "Over Points"],
        hockey: ["Win", "Over Goals", "Under Goals"],
        tennis: ["Win", "Over Sets", "Under Sets"],
        cricket: ["Win", "Top Batsman", "Over Runs"],
        rugby: ["Win", "Try Handicap", "Over Points"]
    }
};

/* ----------------------------
    DOM Elements & state
-----------------------------*/
const sportEl = document.getElementById('sport');
const riskGroup = document.getElementById('riskGroup');
const generateBtn = document.getElementById('generateBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const resetBtn = document.getElementById('resetBtn');
const oddsRangeEl = document.getElementById('oddsTarget');
const oddsNumberEl = document.getElementById('oddsTargetNumber');
const oddsLabelEl = document.getElementById('oddsTargetLabel');
const listEl = document.getElementById('list');
const spinner = document.getElementById('spinner');
const selectedCountEl = document.getElementById('selectedCount');
const totalOddsEl = document.getElementById('totalOdds');
const totalOddsBigEl = document.getElementById('totalOddsBig');
const targetEchoEl = document.getElementById('targetEcho');
const toleranceEchoEl = document.getElementById('toleranceEcho');
const riskEchoEl = document.getElementById('riskEcho');

// Central state
let state = {
    sport: DEMO_RESPONSE.sports[0].toLowerCase(),
    risk: 'low',
    target: 500,
    tolerance: 0.10,
    candidates: [],
    rows: [],
    selectedIds: new Set()
};

/* ----------------------------
    Small helper functions
-----------------------------*/
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => arr.map(v => [v, Math.random()]).sort((a, b) => a[1] - b[1]).map(v => v[0]);
const fmtOdds = x => Number(x).toFixed(2);
const wait = ms => new Promise(r => setTimeout(r, ms));
const prettyRisk = r => r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
const showSpinner = on => spinner.classList.toggle('show', on);

// Product of array (for accumulator calculation)
function product(arr, selector = x => x) {
    if (!arr || arr.length === 0) return 1;
    return arr.reduce((p, c) => p * Number(selector(c) || 1), 1);
}

/* ----------------------------
    Generate candidate matches
-----------------------------*/
function generateCandidates(sport, risk, count = 40) {
    const [lo, hi] = DEMO_RESPONSE.risk_levels[risk];
    const teams = DEMO_RESPONSE.teams[sport] || [];
    const markets = DEMO_RESPONSE.markets[sport] || ['Win'];
    const pool = [];

    for (let i = 0; i < count; i++) {
        const home = pick(teams);
        const away = pick(teams.filter(t => t !== home));
        const market = pick(markets);
        const odds = +(rand(lo, hi)).toFixed(2);

        pool.push({
            id: `${sport}-${risk}-${i}-${Date.now()}`,
            sport, risk, home, away, market, odds,
            league: `${sport.toUpperCase()} League`,
            kick: new Date(Date.now() + rand(2, 120) * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '),
            homeLogo: home ? `https://example.com/logos/${home.toLowerCase()}.png` : './assets/images.jpg',
            awayLogo: away ? `https://example.com/logos/${away.toLowerCase()}.png` : './assets/images.jpg'
        });
    }
    return shuffle(pool);
}

/* ----------------------------
    Accumulator logic for auto-selection
-----------------------------*/
function buildAccumulator(pool, target, tolerancePct = 0.10) {
    const targetLow = target * (1 - tolerancePct);
    const targetHigh = target * (1 + tolerancePct);

    const sorted = [...pool].sort((a, b) => b.odds - a.odds);

    let best = [];
    let bestDiff = Infinity;
    let picked = [];
    let current = 1;

    for (const m of sorted) {
        if (current * m.odds <= targetHigh * 1.15) {
            picked.push(m);
            current *= m.odds;

            const diff = Math.abs(current - target);
            if (diff < bestDiff) {
                bestDiff = diff;
                best = [...picked];
            }

            if (current >= targetLow && current <= targetHigh) {
                return picked;
            }
        }
    }

    picked = best.length ? best : picked;
    current = product(picked, x => x.odds);

    picked.sort((a, b) => b.odds - a.odds);
    for (let i = 0; i < picked.length; i++) {
        if (current >= targetLow && current <= targetHigh) break;
        const removed = picked[i];
        const after = current / removed.odds;
        if (Math.abs(after - target) < Math.abs(current - target)) {
            current = after;
            picked.splice(i, 1);
            i = -1; // restart
        }
    }

    return picked;
}

/* ----------------------------
    Render matches list
    - Shows only home vs away by default
    - Accordion details hidden initially
    - Auto-selected rows highlighted
    - Top-left toggle for ✅/⭕
    - Copy/share buttons inside details
-----------------------------*/
/* ----------------------------
    Render matches list with separate containers
-----------------------------*/
function renderList() {
    const selectedContainer = document.getElementById('selectedList'); 
    const unselectedContainer = document.getElementById('unselectedList'); 
    const selectedHeader = document.getElementById('selectedHeader');
    const unselectedHeader = document.getElementById('unselectedHeader');

    selectedContainer.innerHTML = '';
    unselectedContainer.innerHTML = '';

    // Update headings dynamically
    const selectedCount = [...state.selectedIds].length;
    const unselectedCount = state.rows.length - selectedCount;

    selectedHeader.textContent = selectedCount > 0 
        ? `Selected / Auto-Selected Matches (${selectedCount})` 
        : "No Matches Selected Yet";

    unselectedHeader.textContent = unselectedCount > 0
        ? `Other Matches (Optional) (${unselectedCount})` 
        : "No Other Matches Available";

    // render rows
    state.rows.forEach(m => {
        const isSelected = state.selectedIds.has(m.id);

        const row = document.createElement('div');
        row.className = 'row' + (isSelected ? ' selected' : '');
        row.dataset.id = m.id;

        const accordionId = `accordion-${m.id}`;
        const headingId = `heading-${m.id}`;
        const collapseId = `collapse-${m.id}`;
        const prediction = pick(["Home Win", "Away Win", "Draw", "Over 2.5", "Under 2.5"]);

        row.innerHTML = `
        <div class="accordion" id="${accordionId}">
          <div class="accordion-item">
            <h2 class="accordion-header" id="${headingId}" data-target="#${collapseId}">
              <button class="accordion-button" type="button">
                ${m.home} vs ${m.away}
              </button>
              <span class="select-btn ${isSelected ? 'selected' : ''}" title="${isSelected ? 'Deselect' : 'Select'}">
                ${isSelected ? '✅' : '⭕'}
              </span>
            </h2>
            <div id="${collapseId}" class="accordion-collapse" style="display:none;" aria-labelledby="${headingId}">
              <div class="accordion-body">
                <div class="match-header">
                  <div class="team">
                    <img src="${m.homeLogo}" alt="${m.home} logo" class="team-logo" />
                    <div class="team-name">${m.home}</div>
                  </div>
                  <div class="vs">vs</div>
                  <div class="team">
                    <img src="${m.awayLogo}" alt="${m.away} logo" class="team-logo" />
                    <div class="team-name">${m.away}</div>
                  </div>
                  <div class="match-score">@ ${fmtOdds(m.odds)}</div>
                </div>
                <div class="match-info">
                  ${m.market} • ${prettyRisk(m.risk)} • ${m.league} • ${m.kick}
                </div>
                <div class="prediction-details">
                  Prediction: ${prediction}
                </div>
                <div class="card-actions" role="group">
                  <button class="copy-btn" title="Copy" data-text="${m.home} vs ${m.away} | Prediction: ${prediction} | Odds: ${fmtOdds(m.odds)}">🔗</button>
                  <button class="delete-btn" title="Delete" data-id="${m.id}">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        `;

        (isSelected ? selectedContainer : unselectedContainer).appendChild(row);
    });


    // Event delegation
    ['selectedList', 'unselectedList'].forEach(id => {
        const container = document.getElementById(id);
        container.onclick = (e) => {
            const copyBtn = e.target.closest('.copy-btn');
            if (copyBtn) {
                navigator.clipboard.writeText(copyBtn.dataset.text).then(() => alert('Copied!'));
                return;
            }

            const delBtn = e.target.closest('.delete-btn');
            if (delBtn) {
                const delId = delBtn.dataset.id;
                state.rows = state.rows.filter(r => r.id !== delId);
                state.selectedIds.delete(delId);
                renderList();
                updateTotals();
                return;
            }

            const selBtn = e.target.closest('.select-btn');
            if (selBtn) {
                const row = selBtn.closest('.row');
                if (!row) return;
                const rowId = row.dataset.id;

                // Toggle selection manually
                if (state.selectedIds.has(rowId)) state.selectedIds.delete(rowId);
                else state.selectedIds.add(rowId);

                renderList();
                updateTotals();
                return;
            }

            // 🔥 Make header anywhere clickable
            const header = e.target.closest('.accordion-header');
            if (header) {
                const collapseId = header.getAttribute('data-target');
                const collapseEl = container.querySelector(collapseId);
                if (!collapseEl) return;
                const isVisible = collapseEl.style.display === 'block';

                // Close all open in this container
                container.querySelectorAll('.accordion-collapse').forEach(el => {
                    el.style.display = 'none';
                });

                // Toggle current
                collapseEl.style.display = isVisible ? 'none' : 'block';
            }
        };
    });
}



/* ----------------------------
    Accordion toggle role
    - Allows header click to expand/collapse
-----------------------------*/
function enableAccordionToggle() {
    // Attach event to all headers
    document.querySelectorAll('.accordion-header button').forEach(btn => {
        // Add role for accessibility
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-expanded', 'false');

        btn.addEventListener('click', () => {
            const collapseEl = document.querySelector(btn.dataset.bsTarget);
            const isExpanded = collapseEl.classList.contains('show');

            // Collapse any open accordion first (optional: single-open behavior)
            document.querySelectorAll('.accordion-collapse.show').forEach(openEl => {
                openEl.classList.remove('show');
                const headerBtn = document.querySelector(`[data-bs-target="#${openEl.id}"]`);
                if (headerBtn) headerBtn.setAttribute('aria-expanded', 'false');
            });

            if (!isExpanded) {
                collapseEl.classList.add('show');
                btn.setAttribute('aria-expanded', 'true');
            } else {
                collapseEl.classList.remove('show');
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    });
}


/* ----------------------------
    Auto-select matches logic
-----------------------------*/
function autoSelectMatches() {
    state.selectedIds.clear();
    const picks = buildAccumulator(state.rows, state.target, state.tolerance);
    picks.forEach(p => state.selectedIds.add(p.id));
    renderList();
    updateTotals();
}

/* ----------------------------
    Update totals display
-----------------------------*/
function updateTotals() {
    const selected = state.rows.filter(r => state.selectedIds.has(r.id));
    const total = product(selected, x => x.odds);
    const safeTotal = Number(total).toFixed(2);

    selectedCountEl.textContent = selected.length;
    totalOddsEl.textContent = safeTotal;
    totalOddsBigEl.textContent = safeTotal;

    const low = state.target * (1 - state.tolerance);
    const high = state.target * (1 + state.tolerance);

    totalOddsBigEl.style.color = (total >= low && total <= high) ? 'var(--ok)' : 'var(--text)';
}

/* ----------------------------
    UI control helpers
-----------------------------*/
function syncTargetUI() {
    oddsLabelEl.textContent = Number(state.target).toFixed(2);
    targetEchoEl.textContent = Number(state.target).toFixed(2);
    toleranceEchoEl.textContent = `±${Math.round(state.tolerance * 100)}%`;
}
function setRisk(r) {
    state.risk = r;
    Array.from(riskGroup.querySelectorAll('.pill')).forEach(p => p.classList.toggle('active', p.dataset.risk === r));
    riskEchoEl.textContent = prettyRisk(r);
}

/* ----------------------------
    Generate / regenerate
-----------------------------*/
async function generate() {
    showSpinner(true);
    await wait(300);
    state.candidates = generateCandidates(state.sport, state.risk, 60);
    state.rows = [...state.candidates];
    renderList();
    autoSelectMatches();
    showSpinner(false);
}
async function regenerate() {
    showSpinner(true);
    await wait(300);
    state.candidates = generateCandidates(state.sport, state.risk, 60);
    state.rows = [...state.candidates];
    renderList();
    autoSelectMatches();
    showSpinner(false);
}

/* ----------------------------
    Initialization & event bindings
-----------------------------*/
(function init() {
    // Populate sport select
    DEMO_RESPONSE.sports.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.toLowerCase();
        opt.textContent = s;
        sportEl.appendChild(opt);
    });

    // Populate risk pills
    Object.keys(DEMO_RESPONSE.risk_levels).forEach(r => {
        const btn = document.createElement('button');
        btn.className = `pill ${r === 'low' ? 'active' : ''}`;
        btn.dataset.risk = r;
        btn.textContent = prettyRisk(r);
        riskGroup.appendChild(btn);
    });

    // Event listeners
    sportEl.addEventListener('change', e => { state.sport = e.target.value; });
    riskGroup.addEventListener('click', e => { const b = e.target.closest('.pill'); if (!b) return; setRisk(b.dataset.risk); regenerate(); });
    oddsRangeEl.addEventListener('input', e => { const v = Math.max(2, Math.min(1000, +e.target.value)); oddsNumberEl.value = v; state.target = v; syncTargetUI(); });
    oddsNumberEl.addEventListener('input', e => { const v = Math.max(2, Math.min(1000, +e.target.value)); oddsRangeEl.value = v; state.target = v; syncTargetUI(); });
    generateBtn.addEventListener('click', generate);
    regenerateBtn.addEventListener('click', regenerate);
    resetBtn.addEventListener('click', () => {
        state.selectedIds.clear();
        renderList();
        updateTotals();
    });

    syncTargetUI();
    setRisk('low');
})();
