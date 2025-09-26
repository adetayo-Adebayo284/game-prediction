(function () {
  const container = document.querySelector('.right-ads.prediction-carousel');
  if (!container) return;

  const track = container.querySelector('#carouselTrack');
  const dotsContainer = container.querySelector('#carouselDots');
  const prevBtn = container.querySelector('.prev-btn');
  const nextBtn = container.querySelector('.next-btn');
  const gameEl = container.querySelector('#gameName');

  // ✅ Utility: get today in DD-MM-YYYY
  function getTodayKey() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  // ✅ Load matchesDB from localStorage
  let matchesDB = {};
  try {
    const raw = localStorage.getItem("matchesDB");
    if (raw) {
      matchesDB = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Invalid matchesDB in localStorage, resetting");
    matchesDB = {};
  }

  // ✅ Always check today
  const todayKey = getTodayKey();
  let needRefetch = true;

  if (matchesDB[todayKey] && Array.isArray(matchesDB[todayKey]) && matchesDB[todayKey].length) {
    needRefetch = false; // we already have today’s data
  }

  // ✅ Fetch fresh data if needed
  async function fetchMatches(dateStr) {
    try {
      const res = await fetch(`../../game/backend/getAllLeague.php?date=${dateStr}`);
      const data = await res.json();
      if (data && typeof data === "object") {
        matchesDB = { ...matchesDB, ...data };
        localStorage.setItem("matchesDB", JSON.stringify(matchesDB));
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
    }
  }

  // ✅ Initial fetch immediately (if today missing)
  const todayIso = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  if (needRefetch) {
    fetchMatches(todayIso).then(() => {
      renderPredictions(matchesDB[todayKey] || []);
    });
  } else {
    renderPredictions(matchesDB[todayKey] || []);
  }

  // ✅ Format countdown
  function formatCountdown(timeDiff) {
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    let str = "";
    if (days > 0) str += `${days}d `;
    str += `${hours}h ${minutes}m ${seconds}s`;
    return str;
  }

  // ✅ Render predictions into carousel
  function renderPredictions(predictions) {
    if (!Array.isArray(predictions) || predictions.length === 0) {
      track.innerHTML = `<p>No predictions available today</p>`;
      return;
    }

    track.innerHTML = "";
    dotsContainer.innerHTML = "";

    predictions.forEach((p, i) => {
      const slide = document.createElement('div');
      slide.className = 'slide';

      // parse date safely
      const matchDate = new Date(`${p.date} ${p.time || p.matchTime || "00:00"}`);

      function updateCountdown() {
        const now = new Date();
        const timeDiff = matchDate - now;

        let text = "";
        if (timeDiff <= 0) {
          text = "Match started";
          clearInterval(countdownInterval);
        } else {
          text = formatCountdown(timeDiff);
        }
        const el = slide.querySelector('.countdown');
        if (el) el.textContent = text;
      }

      const countdownInterval = setInterval(updateCountdown, 1000);

      slide.innerHTML = `
        <!-- Header -->
        <div class="match-info">
          <img src="${p.leagueLogo || p.competitionLogo || ''}" alt="league logo" class="comp-logo" style="width:20px;height:20px;">
          <span>${p.league || p.tournament || ""}</span>
          <span>${p.time || p.matchTime || ""}</span>
        </div>

        <!-- Teams -->
        <div class="teams">
          <div class="team">
            <img src="${p.homeLogo || ''}" alt="${p.home || p.homeName} logo" class="team-logo">
            <span>${p.home || p.homeName}</span>
          </div>
          <div class="vs-block">
            <span class="vs-text" style="font-size: 0.8rem;">${p.score ? p.score : "VS"}</span>
            <span class="countdown"></span>
          </div>
          <div class="team">
            <img src="${p.awayLogo || ''}" alt="${p.away || p.awayName} logo" class="team-logo">
            <span>${p.away || p.awayName}</span>
          </div>
        </div>

        <!-- Extra info -->
        <div class="extra-info">
          ${p.predictions && p.predictions.length ? `<span>🎯 ${p.predictions[0].market}</span>` : ""}
          ${p.predictions && p.predictions.length ? `<span>💰 Predictions: ${Object.values(p.predictions[0].values || {}).join(" / ")}</span>` : ""}
        </div>
        <div class="date-info">
          <span>🕒 ${p.date}</span>
        </div>
        <div class="prediction-footer">
          <button class="btn btn-primary" aria-label="View Prediction Details" onclick="alert('Prediction details for ${p.home} vs ${p.away}')">View Prediction</button>
        </div>
      `;

      track.appendChild(slide);

      // add dot
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = i === 0 ? 'active' : '';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);

      // start initial countdown
      updateCountdown();
    });

    const slides = track.querySelectorAll('.slide');
    let index = 0;
    let autoplayTimer = null;

    function update() {
      track.style.transform = `translateX(${-index * 100}%)`;
      dotsContainer.querySelectorAll('button').forEach((b, i) => {
        b.classList.toggle('active', i === index);
      });
      gameEl.textContent = predictions[index].sport || predictions[index].game || "Game";
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      update();
      resetAutoplay();
    }

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));

    function startAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = setInterval(() => goTo(index + 1), 4500);
    }

    function resetAutoplay() {
      startAutoplay();
    }

    update();
    startAutoplay();
  }
})();




// (function () {
//   const container = document.querySelector('.right-ads.prediction-carousel');
//   if (!container) return;

//   const track = container.querySelector('#carouselTrack');
//   const dotsContainer = container.querySelector('#carouselDots');
//   const prevBtn = container.querySelector('.prev-btn');
//   const nextBtn = container.querySelector('.next-btn');
//   const gameEl = container.querySelector('#gameName');

//   // ✅ Load predictions from localStorage (multi-sport support)
//   let predictions = [];
//   try {
//     // we expect localStorage keys like "football", "basketball", etc.
//     for (let i = 0; i < localStorage.length; i++) {
//       const key = localStorage.key(i);
//       try {
//         const parsed = JSON.parse(localStorage.getItem(key));
//         if (Array.isArray(parsed)) {
//           predictions = predictions.concat(parsed);
//         }
//       } catch (err) {
//         console.warn(`Skipping invalid localStorage entry for ${key}`);
//       }
//     }
//   } catch (err) {
//     console.error("Error reading from localStorage:", err);
//     predictions = [];
//   }

//   console.log("HRE: ", predictions);
  

//   // ✅ If nothing in localStorage, seed with demo football data
//   if (!predictions.length) {
//     predictions = [
//       {
//         game: "Football",
//         tournament: "Europe UEFA Super Cup",
//         match: "İstanbul Başakşehir vs Viking",
//         competitionLogo: "europe-uefa-logo.png",
//         matchTime: "20:00",
//         date: "Wed - 27 Sep 2025",
//         homeLogo: "istanbul-logo.png",
//         homeName: "İstanbul Başakşehir",
//         awayLogo: "viking-logo.png",
//         awayName: "Viking",
//         countdown: "",
//         prediction: "2nd Half Under 1.5 Goals",
//         odds: "1.91",
//       },
//       {
//         game: "Basketball",
//         tournament: "Premier League",
//         match: "Arsenal vs Chelsea",
//         competitionLogo: "premier-league-logo.png",
//         matchTime: "19:00",
//         date: "Sat - 16 Aug 2025",
//         homeLogo: "arsenal-logo.png",
//         homeName: "Arsenal",
//         awayLogo: "chelsea-logo.png",
//         awayName: "Chelsea",
//         countdown: "",
//         prediction: "Arsenal to win",
//         odds: "2.10",
//       }
//     ];
//     localStorage.setItem("football", JSON.stringify([predictions[0]]));
//     localStorage.setItem("basketball", JSON.stringify([predictions[1]]));
//   }

//   // ⏳ Format countdown in "h m s"
//   function formatCountdown(timeDiff) {
//     const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
//     const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//     const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
//     const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

//     let str = "";
//     if (days > 0) str += `${days}d `;
//     str += `${hours}h ${minutes}m ${seconds}s`;
//     return str;
//   }

//   // 🖼 Build slides dynamically
//   predictions.forEach((p, i) => {
//     const slide = document.createElement('div');
//     slide.className = 'slide';

//     // parse date safely
//     const matchDate = new Date(`${p.date} ${p.matchTime}`);

//     function updateCountdown() {
//       const now = new Date();
//       const timeDiff = matchDate - now;

//       if (timeDiff <= 0) {
//         p.countdown = "Match started";
//         clearInterval(countdownInterval);
//       } else {
//         p.countdown = formatCountdown(timeDiff);
//       }
//       const el = slide.querySelector('.countdown');
//       if (el) el.textContent = p.countdown;
//     }

//     const countdownInterval = setInterval(updateCountdown, 1000);

//     slide.innerHTML = `
//       <!-- Header -->
//       <div class="match-info">
//         <img src="${p.competitionLogo}" alt="${p.tournament} logo" class="comp-logo" style="width:20px;height:20px;">
//         <span>${p.tournament}</span>
//         <span>${p.matchTime}</span>
//       </div>

//       <!-- Teams -->
//       <div class="teams">
//         <div class="team">
//           <img src="${p.homeLogo}" alt="${p.homeName} logo" class="team-logo">
//           <span>${p.homeName}</span>
//         </div>
//         <div class="vs-block">
//           <span class="vs-text">VS</span>
//           <span class="countdown">${p.countdown}</span>
//         </div>
//         <div class="team">
//           <img src="${p.awayLogo}" alt="${p.awayName} logo" class="team-logo">
//           <span>${p.away}</span>
//         </div>
//       </div>

//       <!-- Extra info -->
//       <div class="extra-info">
//         <span>🎯 ${p.prediction}</span>
//         <span>💰 Odds: ${p.odds}</span>
//       </div>
//       <div class="date-info">
//         <span>🕒 ${p.date}</span>
//       </div>
//       <div class="prediction-footer">
//         <button class="btn btn-primary" aria-label="View Prediction Details" onclick="alert('Prediction details for ${p.match}')">View Prediction</button>
//       </div>
//     `;

//     track.appendChild(slide);

//     // add dot
//     const dot = document.createElement('button');
//     dot.type = 'button';
//     dot.className = i === 0 ? 'active' : '';
//     dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
//     dot.addEventListener('click', () => goTo(i));
//     dotsContainer.appendChild(dot);

//     // start initial countdown
//     updateCountdown();
//   });

//   const slides = track.querySelectorAll('.slide');
//   let index = 0;
//   let autoplayTimer = null;

//   function update() {
//     track.style.transform = `translateX(${-index * 100}%)`;
//     dotsContainer.querySelectorAll('button').forEach((b, i) => {
//       b.classList.toggle('active', i === index);
//     });
//     gameEl.textContent = predictions[index].game;
//   }

//   function goTo(i) {
//     index = (i + slides.length) % slides.length;
//     update();
//     resetAutoplay();
//   }

//   prevBtn.addEventListener('click', () => goTo(index - 1));
//   nextBtn.addEventListener('click', () => goTo(index + 1));

//   function startAutoplay() {
//     if (autoplayTimer) clearInterval(autoplayTimer);
//     autoplayTimer = setInterval(() => goTo(index + 1), 4500);
//   }

//   function resetAutoplay() {
//     startAutoplay();
//   }

//   update();
//   startAutoplay();
// })();

