(() => {
  const sportsData = {
    Soccer: {
      tournaments: {
        // --- Existing ---
        "Turkey - Super Lig": [
          { 
            id: 1, 
            homeTeam: "Trabzonspor", 
            awayTeam: "Kocaelispor", 
            prediction: "Over 2.5", 
            dateTime: "11 Aug 2025, 19:45", 
            probability: "65%",
            homeLogo: "https://upload.wikimedia.org/wikipedia/commons/4/47/Trabzonspor_logo.png", 
            awayLogo: "https://upload.wikimedia.org/wikipedia/commons/0/02/Kocaelispor_logo.png"
          },
          { 
            id: 2, 
            homeTeam: "Galatasaray", 
            awayTeam: "Fenerbahce", 
            prediction: "Under 2.5", 
            dateTime: "12 Aug 2025, 18:00", 
            probability: "70%",
            homeLogo: "https://upload.wikimedia.org/wikipedia/commons/1/13/Galatasaray_S.K._logo.png", 
            awayLogo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Fenerbah%C3%A7e_S.K._logo.png"
          }
        ],
        "France - Ligue 2": [
          { 
            id: 3, 
            homeTeam: "Amiens SC", 
            awayTeam: "Reims", 
            prediction: "Over 1.5", 
            dateTime: "13 Aug 2025, 17:00", 
            probability: "60%",
            homeLogo: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Amiens_SC_logo.png", 
            awayLogo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Stade_de_Reims_logo.png"
          }
        ],

        // --- New ones ---
        "International - African Nations Championship": [],
        "Nigeria - NPFL": [],
        "England - Premier League": [],
        "England - EFL League One": [],
        "Spain - La Liga": [],
        "Europe - UEFA Champions League": [],
        "Europe - UEFA Europa League": [],
        "Europe - UEFA Europa Conference League": [],
        "Italy - Serie A": [],
        "Germany - Bundesliga": [],
        "France - Ligue 1": [],
        "Portugal - Liga NOS": [],
        "Netherlands - Eredivisie": [],
        "Belgium - Pro League": [],
        "South Africa - Premier Soccer League": [],
        "Kenya - Kenyan Premier League": [],
        "Tanzania - Ligi Kuu Bara": [],
        "Brazil - Serie A": [],
        "Argentina - Primera División": []
      }
    },
    Basketball: {
      tournaments: {
        NBA: [
          { 
            id: 4, 
            homeTeam: "Lakers", 
            awayTeam: "Warriors", 
            prediction: "Lakers win", 
            dateTime: "15 Aug 2025, 20:00", 
            probability: "55%",
            homeLogo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Los_Angeles_Lakers_logo.svg", 
            awayLogo: "https://upload.wikimedia.org/wikipedia/commons/0/04/Golden_State_Warriors_logo.svg"
          }
        ]
      }
    },
    Hockey: {
      tournaments: {
        NHL: [
          { 
            id: 5, 
            homeTeam: "Bruins", 
            awayTeam: "Maple Leafs", 
            prediction: "Maple Leafs win", 
            dateTime: "14 Aug 2025, 19:00", 
            probability: "50%",
            homeLogo: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Boston_Bruins_logo.svg", 
            awayLogo: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Toronto_Maple_Leafs_logo.svg"
          }
        ]
      }
    },
    "American Football": {
      tournaments: {
        NFL: [
          { 
            id: 6, 
            homeTeam: "Patriots", 
            awayTeam: "Packers", 
            prediction: "Packers win", 
            dateTime: "16 Aug 2025, 18:30", 
            probability: "60%",
            homeLogo: "https://upload.wikimedia.org/wikipedia/commons/8/8f/New_England_Patriots_logo.svg", 
            awayLogo: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Green_Bay_Packers_logo.svg"
          }
        ]
      }
    },
    "Table Tennis": {
      tournaments: {
        "ITTF World Tour": [
          { 
            id: 7, 
            homeTeam: "Player A", 
            awayTeam: "Player B", 
            prediction: "Player A wins", 
            dateTime: "17 Aug 2025, 15:00", 
            probability: "55%",
            homeLogo: "https://upload.wikimedia.org/wikipedia/commons/d/d7/ITTF_logo.svg", 
            awayLogo: "https://upload.wikimedia.org/wikipedia/commons/d/d7/ITTF_logo.svg"
          }
        ]
      }
    },
    "Horse Race": {
      tournaments: {
        "Kentucky Derby": [
          { 
            id: 8, 
            homeTeam: "Horse 1", 
            awayTeam: "Horse 2", 
            prediction: "Horse 1 wins", 
            dateTime: "18 Aug 2025, 14:00", 
            probability: "45%",
            homeLogo: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Kentucky_derby_logo.png", 
            awayLogo: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Kentucky_derby_logo.png"
          }
        ]
      }
    }
  };


  // Flatten all matches with proper fields
  const allMatches = [];
  Object.entries(sportsData).forEach(([sportName, sportObj]) => {
    Object.entries(sportObj.tournaments).forEach(([tourneyName, matches]) => {
      matches.forEach(m => allMatches.push({
        id: m.id,
        sport: sportName,
        league: tourneyName,
        home: m.homeTeam,
        away: m.awayTeam,
        homeLogo: "", // add logos here if available
        awayLogo: "",
        time: m.dateTime,
        score: "-",
        prediction: m.prediction,
        confidence: parseInt(m.probability) || 0
      }));
    });
  });

  const openSelectorBtn = document.getElementById("openSelectorBtn");
  const todayPredictionHeader = document.getElementById("todayPredictionHeader");
  const matchSelector = document.getElementById("matchSelector");
  const selectorOptions = document.getElementById("selectorOptions");
  const applySelectionBtn = document.getElementById("applySelectionBtn");
  const modalCloseBtn = matchSelector.querySelector(".modal-close");
  const selectedInfoEl = document.getElementById("selectedInfo");
  const matchCarousel = document.getElementById("matchCarousel");

  let selectedSports = [];
  let selectedTournaments = [];
  let selectedMatches = [];

  todayPredictionHeader.addEventListener("click", () => openSelectorBtn.click());

  function populateSelectorOptions() {
    selectorOptions.innerHTML = "";

    // Sports
    const sportsSection = document.createElement("div");
    sportsSection.className = "selector-section";
    sportsSection.innerHTML = `
      <strong>Sports</strong>
      <label><input type="checkbox" id="selectAllSports"/> Select All</label>
    `;
    Object.keys(sportsData).forEach(sport => {
      sportsSection.innerHTML += `<label><input type="checkbox" name="sport" value="${sport}"/> ${sport}</label>`;
    });
    selectorOptions.appendChild(sportsSection);

    // Tournaments
    const tournamentsSection = document.createElement("div");
    tournamentsSection.className = "selector-section";
    tournamentsSection.innerHTML = `
      <strong>Tournaments</strong>
      <label><input type="checkbox" id="selectAllTournaments"/> Select All</label>
    `;
    selectorOptions.appendChild(tournamentsSection);

    // Matches
    const matchesSection = document.createElement("div");
    matchesSection.className = "selector-section";
    matchesSection.innerHTML = `
      <strong>Matches</strong>
      <label><input type="checkbox" id="selectAllMatches"/> Select All</label>
    `;
    selectorOptions.appendChild(matchesSection);

    // Events
    selectorOptions.querySelectorAll('input[name="sport"]').forEach(cb => cb.addEventListener("change", onSportChange));
    selectorOptions.querySelector("#selectAllSports").addEventListener("change", toggleAllSports);
    selectorOptions.querySelector("#selectAllTournaments").addEventListener("change", toggleAllTournaments);
    selectorOptions.querySelector("#selectAllMatches").addEventListener("change", toggleAllMatches);
  }

  // --- NEW FUNCTIONS ---

  function toggleAllSports(e) {
    const checked = e.target.checked;
    selectorOptions.querySelectorAll('input[name="sport"]').forEach(cb => (cb.checked = checked));
    onSportChange();
  }

  function toggleAllTournaments(e) {
    const checked = e.target.checked;
    selectorOptions.querySelectorAll('input[name="tournament"]').forEach(cb => (cb.checked = checked));
    onTournamentChange();
  }

  function toggleAllMatches(e) {
    const checked = e.target.checked;
    selectorOptions.querySelectorAll('input[name="match"]').forEach(cb => (cb.checked = checked));
    onMatchChange();
  }
  function onSportChange() {
    selectedSports = Array.from(selectorOptions.querySelectorAll('input[name="sport"]:checked')).map(cb => cb.value);
    updateTournamentsList(selectedSports);
    selectedTournaments = [];
    selectedMatches = [];
    updateMatchesList([]);
    updateApplyButtonState();
  }

  function updateTournamentsList(selectedSports) {
    const tournamentsSection = selectorOptions.querySelectorAll('.selector-section')[1];
    tournamentsSection.querySelectorAll('label').forEach(l => l.remove());

    let tournamentsSet = new Set();
    selectedSports.forEach(sport => {
      Object.keys(sportsData[sport]?.tournaments || {}).forEach(t => tournamentsSet.add(t));
    });

    Array.from(tournamentsSet).forEach(tourney => {
      const label = document.createElement("label");
      label.innerHTML = `<input type="checkbox" name="tournament" value="${tourney}"/> ${tourney}`;
      tournamentsSection.appendChild(label);
    });

    tournamentsSection.querySelectorAll('input[name="tournament"]').forEach(cb => cb.addEventListener("change", onTournamentChange));
  }

  function onTournamentChange() {
    selectedTournaments = Array.from(selectorOptions.querySelectorAll('input[name="tournament"]:checked')).map(cb => cb.value);
    updateMatchesList(selectedTournaments);
    updateApplyButtonState();
  }

  function updateMatchesList(selectedTournaments) {
    const matchesSection = selectorOptions.querySelectorAll('.selector-section')[2];
    matchesSection.querySelectorAll('label').forEach(l => l.remove());

    let matchesToShow = [];
    selectedTournaments.forEach(tourney => {
      allMatches.forEach(m => { if (m.league === tourney) matchesToShow.push(m); });
    });

    matchesToShow.forEach(match => {
      const label = document.createElement("label");
      label.innerHTML = `<input type="checkbox" name="match" value="${match.id}"/> ${match.home} - ${match.away} (${match.time})`;
      matchesSection.appendChild(label);
    });

    matchesSection.querySelectorAll('input[name="match"]').forEach(cb => cb.addEventListener("change", onMatchChange));
  }

  function onMatchChange() {
    selectedMatches = Array.from(selectorOptions.querySelectorAll('input[name="match"]:checked')).map(cb => parseInt(cb.value));
    updateApplyButtonState();
  }

  function updateApplyButtonState() {
    applySelectionBtn.disabled = selectedMatches.length === 0;
  }

  // function renderMatchCarousel(matchesToRender = []) {
  //   matchCarousel.innerHTML = "";
  //   if (matchesToRender.length === 0) {
  //     matchCarousel.innerHTML = "<p style='color:#ddd;'>No matches to display.</p>";
  //     return;
  //   }

  //   matchesToRender.forEach((match, index) => {
  //     const accordionId = `accordion-${index}`;
  //     const headingId = `heading-${index}`;
  //     const collapseId = `collapse-${index}`;
  //     const tooltipId = `tooltip-${index}`;

  //     const card = document.createElement("div");
  //     card.className = "match-card";
  //     card.style.width = "100%";

  //     card.innerHTML = `
  //       <div class="accordion accordion-flush" id="${accordionId}">
  //         <div class="accordion-item">
  //           <h2 class="accordion-header" id="${headingId}">
  //             <button class="accordion-button" type="button" data-bs-toggle="collapse" 
  //               data-bs-target="#${collapseId}" aria-expanded="${index === 0 ? "true" : "false"}" 
  //               aria-controls="${collapseId}">
  //               ${match.home} vs ${match.away}
  //             </button>
  //           </h2>
  //           <div id="${collapseId}" class="accordion-collapse collapse ${index === 0 ? "show" : ""}" 
  //             aria-labelledby="${headingId}" data-bs-parent="#${accordionId}">
  //             <div class="accordion-body">
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
  //               <div class="tooltip-custom confidence-badge" tabindex="0" aria-describedby="${tooltipId}">
  //                 Confidence: ${match.confidence}%
  //                 <span class="tooltip-text" role="tooltip" id="${tooltipId}">
  //                   Confidence indicates likelihood of prediction accuracy
  //                 </span>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     `;

  //     matchCarousel.appendChild(card);
  //   });
  // }

  function renderMatchCarousel(matchesToRender = []) {
    matchCarousel.innerHTML = "";

    if (matchesToRender.length === 0) {
      matchCarousel.innerHTML = "<p style='color:#ddd;'>No matches to display.</p>";
      return;
    }

    let currentlyOpenId = null; // Track the currently open accordion

    matchesToRender.forEach((match, index) => {
      const accordionId = `accordion-${index}`;
      const headingId = `heading-${index}`;
      const collapseId = `collapse-${index}`;
      const tooltipId = `tooltip-${index}`;

      const card = document.createElement("div");
      card.className = "match-card";
      card.style.width = "100%";

      // Make the first accordion open by default
      const isOpen = index === 0;
      if (isOpen) currentlyOpenId = collapseId;

      card.innerHTML = `
        <div class="accordion accordion-flush match-card" style="padding: 0; margin: 0; overflow: hidden;" id="${accordionId}">
          <div class="accordion-item">
            <h2 class="accordion-header" id="${headingId}">
              <button class="accordion-button ${isOpen ? "" : "collapsed"}" type="button"
                aria-expanded="${isOpen}" aria-controls="${collapseId}">
                ${match.home} vs ${match.away}
              </button>
            </h2>
            <div id="${collapseId}" class="accordion-collapse collapse ${isOpen ? "show" : ""}"
              aria-labelledby="${headingId}">
              <div class="accordion-body">
                <div class="match-header">
                  <div class="team">
                    <img src="${match.homeLogo}" alt="${match.home} logo" class="team-logo" />
                    <div class="team-name">${match.home}</div>
                  </div>
                  <div class="match-score">${match.score}</div>
                  <div class="team">
                    <img src="${match.awayLogo}" alt="${match.away} logo" class="team-logo" />
                    <div class="team-name">${match.away}</div>
                  </div>
                </div>
                <div class="match-info">${match.league} • ${match.time}</div>
                <div class="prediction-details">Prediction: ${match.prediction}</div>
                <div class="tooltip-badge confidence-badge" tabindex="0" aria-describedby="${tooltipId}">
                  Confidence: ${match.confidence}%
                  <span class="tooltip-texts" role="tooltip" id="${tooltipId}">
                    Confidence indicates likelihood of prediction accuracy
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.getElementById('matchList').style.display = 'none';
      matchCarousel.appendChild(card);

      // Add click handler to toggle accordion
      // Custom logic to close other accordions when one is opened
      const accordionButton = card.querySelector(`#${headingId} button`);
      const collapseElement = card.querySelector(`#${collapseId}`);

      accordionButton.addEventListener("click", function () {
        // If this accordion is already open
        if (collapseElement.classList.contains("show")) {
          // Close it first
          collapseElement.classList.remove("show");

          // Reopen it immediately (or with a slight delay if you want animation)
          setTimeout(() => {
            collapseElement.classList.add("show");
          }, 150); // adjust delay for smoother effect
        } else {
          // Close all other accordions
          document.querySelectorAll(".accordion-collapse.show").forEach((openCollapse) => {
            openCollapse.classList.remove("show");
          });

          // Open the clicked accordion
          collapseElement.classList.add("show");
        }

        // ⬇️ Smooth scroll into view
       
      });

    });
  }

  const cardSection = document.getElementById("matchCarousel"); // or your wrapper
  
  cardSection.addEventListener("wheel", (e) => {
    if (e.deltaY > 0) {
      // User scrolls down → keep window scrolling down
      window.scrollBy({
        top: 150, // adjust speed
        left: 0,
        behavior: "smooth",
      });
    }
  });



  function openModal() {
    matchSelector.hidden = false;
    setTimeout(() => matchSelector.classList.add("show"), 20);
    openSelectorBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    matchSelector.classList.remove("show");
    setTimeout(() => {
      matchSelector.hidden = true;
      document.body.style.overflow = "";
    }, 300);
    openSelectorBtn.setAttribute("aria-expanded", "false");
  }

  function applySelection() {
    closeModal();
    const selectedText = selectedMatches.length > 0
      ? `${selectedMatches.length} Match${selectedMatches.length > 1 ? "es" : ""} Selected`
      : "No Matches Selected";
    selectedInfoEl.textContent = selectedText;

    const selectedMatchObjects = allMatches.filter(m => selectedMatches.includes(m.id));
    renderMatchCarousel(selectedMatchObjects);
  }

  function init() {
    populateSelectorOptions();
    openSelectorBtn.addEventListener("click", openModal);
    modalCloseBtn.addEventListener("click", closeModal);
    applySelectionBtn.addEventListener("click", applySelection);
    matchSelector.querySelector(".modal-content").addEventListener("click", e => e.stopPropagation());
    matchSelector.addEventListener("click", closeModal);
  }

  init();
})();
