/* ----------------------------
    Demo Data Setup (production-ready)
----------------------------*/
const DEMO_RESPONSE = {
    sports: ["Soccer"], //, "Basketball", "Volleyball", "Hockey", "Tennis", "Cricket", "Rugby"
    risk_levels: { 
        very_low:  [1.10, 1.40],
        low:       [1.41, 1.80],
        medium:    [1.81, 2.50],
        high:      [2.51, 5.00],
        very_high: [5.01, 50.00]
    }
};

/* ----------------------------
    DOM Elements & state
----------------------------*/
const sportEl = document.getElementById('sport');
const riskGroup = document.getElementById('riskGroup');
const generateBtn = document.getElementById('generateBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const resetBtn = document.getElementById('resetBtn');
const oddsRangeEl = document.getElementById('oddsTarget');
const oddsNumberEl = document.getElementById('oddsTargetNumber');
const oddsLabelEl = document.getElementById('oddsTargetLabel');
const spinner = document.getElementById('spinner');
const selectedCountEl = document.getElementById('selectedCount');
const totalOddsEl = document.getElementById('totalOdds');
const totalOddsBigEl = document.getElementById('totalOddsBig');
const targetEchoEl = document.getElementById('targetEcho');
const toleranceEchoEl = document.getElementById('toleranceEcho');
const riskEchoEl = document.getElementById('riskEcho');

let state = {
    sport: DEMO_RESPONSE.sports[0].toLowerCase(),
    risk: 'low',
    target: 10,
    tolerance: 0.10,
    rows: [],
    selectedIds: new Set()
};

/* ----------------------------
    Helpers
----------------------------*/
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const fmtOdds = x => Number(x).toFixed(2);
const wait = ms => new Promise(r => setTimeout(r, ms));
const prettyRisk = r => r.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase());
const showSpinner = on => spinner.classList.toggle('show', on);
const product = (arr, sel=x=>x) => arr.reduce((p,c)=>p*Number(sel(c)||1),1) || 1;
const riskColors = {very_low:"green",low:"limegreen",medium:"orange",high:"orangered",very_high:"red",unclassified:"gray"};

/* ----------------------------
    Accumulator logic
----------------------------*/
function buildAccumulator(pool, target, tolerancePct=0.10){
    pool = pool.filter(m => m.sport.toLowerCase()===state.sport && m.risk===state.risk);
    const sorted = [...pool].sort((a,b)=>b.odds-a.odds);

    let best=[], bestDiff=Infinity, picked=[], current=1;
    const targetLow = target*(1-tolerancePct), targetHigh = target*(1+tolerancePct);

    for(const m of sorted){
        if(current*m.odds <= targetHigh){
            picked.push(m); current *= m.odds;
            const diff = Math.abs(current - target);
            if(diff<bestDiff){ bestDiff=diff; best=[...picked]; }
            if(current>=targetLow && current<=targetHigh) return picked;
        }
    }
    return best;
}

/* ----------------------------
    Custom alert
----------------------------*/
function showCustomAlert(msg,type="info"){
    const alertBox=document.getElementById("custom-alert");
    const alertContent=alertBox.querySelector(".custom-alert-content");
    const alertIcon=document.getElementById("alert-icon");
    alertContent.className=`custom-alert-content alert-${type}`;
    document.getElementById("alert-title").textContent=type.toUpperCase();
    document.getElementById("alert-message").textContent=msg;
    alertIcon.textContent=({success:"✅",warning:"⚠️",error:"❌",info:"ℹ️"})[type]||"🔔";
    alertBox.classList.remove("hidden");
    document.getElementById("alert-ok-btn").onclick=()=>alertBox.classList.add("hidden");
}

// /* ----------------------------
//     Render matches
// ----------------------------*/
// function renderList(){
//     const selC=document.getElementById('selectedList');
//     const unselC=document.getElementById('unselectedList');
//     const selH=document.getElementById('selectedHeader');
//     const unselH=document.getElementById('unselectedHeader');
//     selC.innerHTML=''; unselC.innerHTML='';

//     const filtered=state.rows.filter(m=>m.sport.toLowerCase()===state.sport);
//     const selCount=filtered.filter(m=>state.selectedIds.has(m.id)).length;
//     const unselCount=filtered.length-selCount;

//     selH.textContent=selCount?`Selected Matches (${selCount})`:"No Matches Selected";
//     unselH.textContent=unselCount?`Other Matches (${unselCount})`:"No Other Matches";

//     filtered.forEach(m=>{
//         const isSel = state.selectedIds.has(m.id);
//         const row = document.createElement('div');
//         row.className='row'+(isSel?' selected':'');
//         row.dataset.id = m.id;
//         const accordionId=`accordion-${m.id}`;
//         const headingId=`heading-${m.id}`;
//         const collapseId=`collapse-${m.id}`;
//         const prediction = pick(["Home Win","Away Win","Draw","Over 2.5","Under 2.5"]);
//         const badgeColor=riskColors[m.risk]||"gray";

//         row.innerHTML=`
//         <div class="accordion" id="${accordionId}">
//           <div class="accordion-item">
//             <h2 class="accordion-header" id="${headingId}" data-target="#${collapseId}">
//               <button class="accordion-button" type="button">${m.home} vs ${m.away}</button>
//               <span class="select-btn ${isSel?'selected':''}" title="${isSel?'Deselect':'Select'}">${isSel?'✅':'⭕'}</span>
//             </h2>
//             <div id="${collapseId}" class="accordion-collapse" style="display:none;">
//               <div class="accordion-body">
//                 <div class="match-header">
//                   <div class="team"><img src="${m.homeLogo}" alt="${m.home}" class="team-logo" /><div class="team-name">${m.home}</div></div>
//                   <div class="vs">vs</div>
//                   <div class="team"><img src="${m.awayLogo}" alt="${m.away}" class="team-logo" /><div class="team-name">${m.away}</div></div>
//                   <div class="match-score">@ ${fmtOdds(m.odds)}</div>
//                 </div>
//                 <div class="match-info">
//                     ${m.market} • 
//                     <span class="risk-badge" style="color:${badgeColor};font-weight:bold;">
//                         ${prettyRisk(m.risk)}
//                     </span> • 
//                     ${m.league} • ${m.kick}
//                 </div>
//                 <div class="prediction-details">Prediction: ${prediction}</div>
//                 <div class="card-actions">
//                   <button class="copy-btn" 
//                           data-text="${m.home} vs ${m.away} | Prediction: ${prediction} | Odds: ${fmtOdds(m.odds)}">🔗</button>
//                   <button class="delete-btn" data-id="${m.id}">🗑️</button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>`;
//         (isSel?selC:unselC).appendChild(row);
//     });

//     ['selectedList','unselectedList'].forEach(id=>{
//         const cont=document.getElementById(id);
//         cont.onclick=e=>{
//             const copyBtn=e.target.closest('.copy-btn');
//             if(copyBtn){navigator.clipboard.writeText(copyBtn.dataset.text).then(()=>showCustomAlert("Copied!","success"));return;}
//             const delBtn=e.target.closest('.delete-btn');
//             if(delBtn){state.rows=state.rows.filter(r=>r.id!==delBtn.dataset.id);state.selectedIds.delete(delBtn.dataset.id);renderList();updateTotals();return;}
//             const selBtn=e.target.closest('.select-btn');
//             if(selBtn){const row=selBtn.closest('.row');if(!row)return;const rowId=row.dataset.id;state.selectedIds.has(rowId)?state.selectedIds.delete(rowId):state.selectedIds.add(rowId);renderList();updateTotals();return;}
//             const header=e.target.closest('.accordion-header');
//             if(header){const collapseId=header.getAttribute('data-target');const el=cont.querySelector(collapseId);if(!el)return;const show=el.style.display==='block';cont.querySelectorAll('.accordion-collapse').forEach(x=>x.style.display='none');el.style.display=show?'none':'block';}
//         };
//     });
// }


/* ----------------------------
    Render matches
----------------------------*/
// === Universal Time Converter Function ===
function convertKickTime(kickStr, operation = 'subtract', hours = 0) {
    if (!kickStr) return '';

    // Parse kick string assuming Nigeria local time (UTC+1)
    const localDate = new Date(kickStr.replace(' ', 'T') + '+01:00');

    // Determine offset direction
    const offset = hours * 60 * 60 * 1000;
    const adjustedDate = new Date(
        operation === 'add'
            ? localDate.getTime() + offset
            : localDate.getTime() - offset
    );

    // Format output
    const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    return adjustedDate.toLocaleString('en-US', options) + ' CST';
}

function renderList(){
    const selC=document.getElementById('selectedList');
    const unselC=document.getElementById('unselectedList');
    const selH=document.getElementById('selectedHeader');
    const unselH=document.getElementById('unselectedHeader');
    selC.innerHTML=''; unselC.innerHTML='';

    const filtered=state.rows.filter(m=>m.sport.toLowerCase()===state.sport);
    const selCount=filtered.filter(m=>state.selectedIds.has(m.id)).length;
    const unselCount=filtered.length-selCount;

    // --- Inject custom scrollbar CSS once ---
    if (!document.getElementById("custom-scrollbar-style")) {
        const style = document.createElement("style");
        style.id = "custom-scrollbar-style";
        style.innerHTML = `
            /* Custom scrollbar for swiper slides */
            .swiper-slide::-webkit-scrollbar {
                width: 6px;   /* thin scrollbar */
            }
            .swiper-slide::-webkit-scrollbar-track {
                background: transparent;
            }
            .swiper-slide::-webkit-scrollbar-thumb {
                background: #ffc107;   /* yellow thumb */
                border-radius: 6px;
            }
            .swiper-slide::-webkit-scrollbar-thumb:hover {
                background: #ffdd33;   /* lighter on hover */
            }
            /* Firefox support */
            .swiper-slide {
                scrollbar-width: thin;
                scrollbar-color: #ffc107 transparent;
            }
        `;
        document.head.appendChild(style);
    }

    // --- Safely update headers ---
    if (selH) {
        selH.textContent = selCount ? `Selected Matches (${selCount})` : "No Matches Selected";
    }
    if (unselH) {
        unselH.textContent = unselCount ? `Other Matches (${unselCount})` : "No Other Matches";
    }

    filtered.forEach(m => {
        const isSel = state.selectedIds.has(m.id);
        const row = document.createElement('div');
        row.className = 'row' + (isSel ? ' selected' : '');
        row.dataset.id = m.id;
        const accordionId = `accordion-${m.id}`;
        const headingId = `heading-${m.id}`;
        const collapseId = `collapse-${m.id}`;
        const badgeColor = riskColors[m.risk] || "gray";

        // --- Build Swiper slides for predictions ---
        let predictionSwiperHTML = "";
        if (Array.isArray(m.prediction) && m.prediction.length) {
            const slides = m.prediction.map(p => {
                const values = Object.entries(p.predictions)
                    .map(([key, val]) => {
                        if (val == null) return `<div>${key.replace(/_/g,' ')}: N/A</div>`;
                        const percent = Number(val).toFixed(2);

                        let color = "#9e9e9e";
                        if (percent >= 70) color = "#4CAF50"; // green
                        else if (percent >= 50) color = "#FB8C00"; // orange
                        else color = "#E53935"; // red

                        return `<div style="font-size:13px;color:${color};font-weight:bold;margin-bottom:4px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
                            ${key.replace(/_/g,' ')}: ${percent}%
                        </div>`;
                    }).join("");

                return `<div class="swiper-slide" style="
                            background: #000;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                            padding: 12px;
                            border-radius: 12px;
                            width: 150px;  /* reduced width */
                            height: 160px; /* slightly smaller */
                            overflow-y: auto;
                            font-family: 'Segoe UI', sans-serif;
                            color: #fff;
                            box-sizing: border-box;
                        ">
                            <strong style="display:block;margin-bottom:6px;">${p.market}</strong>
                            ${values}
                        </div>`;
            }).join("");

            predictionSwiperHTML = `
            <div class="swiper-container swiper-predictions-${m.id}" style="padding:10px 0;">
                <div class="swiper-wrapper">
                    ${slides}
                </div>
                <div class="swiper-pagination" style="opacity: 0;"></div>
                <div class="swiper-button-prev" style="color:#ffc107; opacity: 0;"></div>
                <div class="swiper-button-next" style="color:#ffc107; opacity: 0;"></div>
            </div>`;
        }

        // --- Build the main card ---
        row.innerHTML = `
        <div class="accordion" id="${accordionId}" style="
            background: rgba(30, 30, 40, 0.95);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            padding: 20px;
            border-radius: 12px;
            font-family: 'Segoe UI', sans-serif;
            color: #f5f5f5;
            margin: 20px 0;
        ">
            <div class="accordion-item">
                <h2 class="accordion-header" id="${headingId}" data-target="#${collapseId}">
                    <button class="accordion-button" type="button">${m.home} vs ${m.away}</button>
                    <span class="select-btn ${isSel ? 'selected' : ''}" 
                        title="${isSel ? 'Deselect' : 'Select'}">${isSel ? '✅' : '⭕'}</span>
                </h2>
                <div id="${collapseId}" class="accordion-collapse" style="display:none;">
                    <div class="accordion-body">
                        <div class="match-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                            <div class="team" style="display:flex;align-items:center;">
                                <img src="${m.homeLogo}" alt="${m.home}" class="team-logo" 
                                    style="width:40px;height:40px;border-radius:50%;margin-right:6px;" />
                                <div class="team-name">${m.home}</div>
                            </div>
                            <div class="vs">vs</div>
                            <div class="team" style="display:flex;align-items:center;">
                                <img src="${m.awayLogo}" alt="${m.away}" class="team-logo" 
                                    style="width:40px;height:40px;border-radius:50%;margin-right:6px;" />
                                <div class="team-name">${m.away}</div>
                            </div>
                            <div class="match-score" style="margin: 0 1rem 0 0; padding: 5px; background: #2a356b; ">@ ${fmtOdds(m.odds)}</div>
                        </div>
                        <div class="match-info" style="margin-bottom:10px;">
                            ${m.market} • 
                            <span class="risk-badge" style="color:${badgeColor};font-weight:bold;">
                                ${prettyRisk(m.risk)}
                            </span> • 
                            ${m.league} • ${ convertKickTime(m.kick, 'subtract', 7)}
                        </div>
                        <div class="prediction-details">${predictionSwiperHTML}</div>
                        <div class="card-actions" style="margin-top:10px;">
                            <button class="copy-btn"
                                style="cursor: pointer;"  
                                data-text="${m.home} vs ${m.away} | Prediction: ${predictionSwiperHTML.replace(/<[^>]*>?/gm, '')} | Odds: ${fmtOdds(m.odds)}">🔗</button>
                            <button class="delete-btn" style="cursor: pointer;" data-id="${m.id}">🗑️</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        (isSel ? selC : unselC).appendChild(row);

        // --- Initialize Swiper for this match ---
        if (Array.isArray(m.prediction) && m.prediction.length) {
            new Swiper(`.swiper-predictions-${m.id}`, {
                slidesPerView: "auto",
                spaceBetween: 8,
                pagination: { 
                    el: `.swiper-predictions-${m.id} .swiper-pagination`, 
                    clickable: true 
                },
                navigation: {
                    nextEl: `.swiper-predictions-${m.id} .swiper-button-next`,
                    prevEl: `.swiper-predictions-${m.id} .swiper-button-prev`,
                },
                mousewheel: true,
                freeMode: true,
                centerInsufficientSlides: true,
            });
        }
    });





    ['selectedList','unselectedList'].forEach(id=>{
        const cont=document.getElementById(id);
        cont.onclick=async e=>{
            const copyBtn=e.target.closest('.copy-btn');
            if(copyBtn){
                navigator.clipboard.writeText(copyBtn.dataset.text)
                .then(()=>showCustomAlert("Copied!","success"));
                return;
            }

            // 🗑️ Delete button with spinner
            const delBtn=e.target.closest('.delete-btn');
            if(delBtn){
                showSpinner(true);
                await wait(600); // simulate processing
                state.rows=state.rows.filter(r=>r.id!==delBtn.dataset.id);
                state.selectedIds.delete(delBtn.dataset.id);
                renderList(); updateTotals();
                showSpinner(false);
                return;
            }

            // ✅ Select / Deselect with spinner
            const selBtn=e.target.closest('.select-btn');
            if(selBtn){
                const row=selBtn.closest('.row');
                if(!row) return;
                const rowId=row.dataset.id;

                showSpinner(true);
                await wait(600); // simulate processing
                if(state.selectedIds.has(rowId)){
                    state.selectedIds.delete(rowId);
                } else {
                    state.selectedIds.add(rowId);
                }
                renderList(); updateTotals();
                showSpinner(false);
                return;
            }

            // Accordion toggle
            const header=e.target.closest('.accordion-header');
            if(header){
                const collapseId=header.getAttribute('data-target');
                const el=cont.querySelector(collapseId);
                if(!el) return;
                const show=el.style.display==='block';
                cont.querySelectorAll('.accordion-collapse')
                    .forEach(x=>x.style.display='none');
                el.style.display=show?'none':'block';
            }
        };
    });

}


/* ----------------------------
    Auto-select matches
----------------------------*/
function autoSelectMatches(){
    state.selectedIds.clear();
    const filtered = state.rows.filter(m=>m.sport.toLowerCase()===state.sport && m.risk===state.risk);
    const picks = buildAccumulator(filtered,state.target,state.tolerance);
    picks.forEach(p=>state.selectedIds.add(p.id));
    renderList(); updateTotals();
}

/* ----------------------------
    Update totals
----------------------------*/
function updateTotals(){
    const sel=state.rows.filter(r=>state.selectedIds.has(r.id));
    if(sel.length===0){selectedCountEl.textContent=0;totalOddsEl.textContent="0.00";totalOddsBigEl.textContent="0.00";totalOddsBigEl.style.color='var(--text)';return;}
    const total=product(sel,x=>x.odds).toFixed(2);
    selectedCountEl.textContent=sel.length;
    totalOddsEl.textContent=total;
    totalOddsBigEl.textContent=total;
    const low=state.target*(1-state.tolerance),high=state.target*(1+state.tolerance);
    totalOddsBigEl.style.color=(total>=low&&total<=high)?'var(--ok)':'var(--text)';
}

/* ----------------------------
    UI helpers
----------------------------*/
function syncTargetUI(){oddsLabelEl.textContent=state.target.toFixed(2);targetEchoEl.textContent=state.target.toFixed(2);toleranceEchoEl.textContent=`±${Math.round(state.tolerance*100)}%`;}
function setRisk(r){state.risk=r;Array.from(riskGroup.querySelectorAll('.pill')).forEach(p=>p.classList.toggle('active',p.dataset.risk===r));riskEchoEl.textContent=prettyRisk(r);}

/* ----------------------------
    Generate / Regenerate
----------------------------*/
async function generate(){showSpinner(true);await wait(200);autoSelectMatches();showSpinner(false);}
async function regenerate(){showSpinner(true);await wait(200);autoSelectMatches();showSpinner(false);}

/* ----------------------------
   Load API matches dynamically with confidence and risk
----------------------------*/
function loadApiMatches(apiData) {
    if (!Array.isArray(apiData) || apiData.length === 0) return;

    // Determine min and max odds for normalization
    const oddsArray = apiData.map(m => m.odds);
    const minOdd = Math.min(...oddsArray);
    const maxOdd = Math.max(...oddsArray);

    state.rows = apiData.map(match => {
        // --- 1. Calculate highest prediction probability ---
        let highestPrediction = 0;
        if (Array.isArray(match.prediction) && match.prediction.length > 0) {
            highestPrediction = Math.max(
                ...match.prediction.map(p => Math.max(p.home || 0, p.away || 0, p.draw || 0))
            );
        }

        // --- 2. Normalize odds (0-100 scale) ---
        const normalizedOdd = ((maxOdd - match.odds) / (maxOdd - minOdd)) * 100;

        // --- 3. Weighted confidence (70% prediction, 30% odds) ---
        const confidence = Number(((highestPrediction * 0.7) + (normalizedOdd * 0.3)).toFixed(2));

        // --- 4. Classify risk ---
        let risk = 'unclassified';
        for (const [level, [min, max]] of Object.entries(DEMO_RESPONSE.risk_levels)) {
            if (match.odds >= min && match.odds <= max) {
                risk = level;
                break;
            }
        }

        return {
            ...match,
            confidence,
            risk
        };
    });

    // // --- 5. Store updated matches in localStorage ---
    // localStorage.setItem("defaultPredictions", JSON.stringify(state.rows));

    // --- 6. Render and auto-select ---
    renderList();
    autoSelectMatches();
}


resetBtn.addEventListener("click", async () => {
    showSpinner(true);
    await wait(300); // simulate processing
    state.selectedIds.clear();
    renderList();
    updateTotals();
    showSpinner(false);
});


/* ----------------------------
    Initialization
----------------------------*/
(function init(){
    DEMO_RESPONSE.sports.forEach(s=>{const opt=document.createElement('option');opt.value=s.toLowerCase();opt.textContent=s;sportEl.appendChild(opt);});
    Object.keys(DEMO_RESPONSE.risk_levels).forEach(r=>{const btn=document.createElement('button');btn.className=`pill ${r==='low'?'active':''}`;btn.dataset.risk=r;btn.textContent=prettyRisk(r);riskGroup.appendChild(btn);});
    sportEl.addEventListener('change',e=>{state.sport=e.target.value;state.selectedIds.clear();regenerate();});
    riskGroup.addEventListener('click',e=>{const b=e.target.closest('.pill');if(!b)return;setRisk(b.dataset.risk);regenerate();});
    oddsRangeEl.addEventListener('input',e=>{const v=Math.max(2,Math.min(1000,+e.target.value));oddsNumberEl.value=v;state.target=v;syncTargetUI();});
    oddsNumberEl.addEventListener('input',e=>{const v=Math.max(2,Math.min(1000,+e.target.value));oddsRangeEl.value=v;state.target=v;syncTargetUI();});
    generateBtn.addEventListener('click',generate);
    regenerateBtn.addEventListener('click',regenerate);
    resetBtn.addEventListener('click',()=>{state.selectedIds.clear();renderList();updateTotals();});
    syncTargetUI(); setRisk('low');
})();

                