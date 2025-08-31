(function () {
  const container = document.querySelector('.right-ads.prediction-carousel');
  if (!container) return;

  const track = container.querySelector('#carouselTrack');
  const dotsContainer = container.querySelector('#carouselDots');
  const prevBtn = container.querySelector('.prev-btn');
  const nextBtn = container.querySelector('.next-btn');
  const gameEl = container.querySelector('#gameName');

  // FULL dynamic data
  const predictions = [
    {
      game: "Football",
      tournament: "Europe UEFA Super Cup",
      match: "İstanbul Başakşehir vs Viking",
      competitionLogo: "europe-uefa-logo.png",
      matchTime: "20:00",
      date: "Wed - 27 Aug 2025",
      homeLogo: "istanbul-logo.png",
      homeName: "İstanbul Başakşehir",
      awayLogo: "viking-logo.png",
      awayName: "Viking",
      countdown: "", // Dynamic countdown will be inserted here
      prediction: "2nd Half Under 1.5 Goals",
      odds: "1.91",
    },
    {
      game: "Basketball",
      tournament: "Premier League",
      match: "Arsenal vs Chelsea",
      competitionLogo: "premier-league-logo.png",
      matchTime: "19:00",
      date: "Sat - 16 Aug 2025",
      homeLogo: "arsenal-logo.png",
      homeName: "Arsenal",
      awayLogo: "chelsea-logo.png",
      awayName: "Chelsea",
      countdown: "", // Dynamic countdown will be inserted here
      prediction: "Arsenal to win",
      odds: "2.10",
    },
    {
      game: "Volleyball",
      tournament: "Premier League",
      match: "Team A vs Team B",
      competitionLogo: "premier-league-logo.png",
      matchTime: "19:00",
      date: "Sat - 16 Aug 2025",
      homeLogo: "arsenal-logo.png",
      homeName: "Manchester United",
      awayLogo: "chelsea-logo.png",
      awayName: "Liverpool",
      countdown: "", // Dynamic countdown will be inserted here
      prediction: "Liverpool to win",
      odds: "2.10",
    }
  ];

  // Function to format countdown in "h m s" format (excluding days if 0)
  function formatCountdown(timeDiff) {
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    // Format the countdown to omit days if it's zero
    let countdownStr = "";
    if (days > 0) {
      countdownStr += `${days}d `;
    }
    countdownStr += `${hours}h ${minutes}m ${seconds}s`;

    return countdownStr;
  }

  // Build slides dynamically
  predictions.forEach((p, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide';

    // Parse the match date
    const matchDate = new Date(`${p.date} ${p.matchTime}`);
    
    // Function to update the countdown
    function updateCountdown() {
      const now = new Date();
      const timeDiff = matchDate - now;

      if (timeDiff <= 0) {
        p.countdown = "Match started";
        clearInterval(countdownInterval);
      } else {
        p.countdown = formatCountdown(timeDiff);
      }

      // Update the countdown in the DOM
      slide.querySelector('.countdown').textContent = p.countdown;
    }

    // Start countdown update every second
    const countdownInterval = setInterval(updateCountdown, 1000);

    slide.innerHTML = `
      <!-- Header -->
      <div class="match-info">
        <img src="${p.competitionLogo}" alt="${p.tournament} logo" class="comp-logo" style="width:20px;height:20px;">
        <span>${p.tournament}</span>
        <span>${p.matchTime}</span>
      </div>

      <!-- Teams -->
      <div class="teams">
        <div class="team">
          <img src="${p.homeLogo}" alt="${p.homeName} logo" class="team-logo">
          <span>${p.homeName}</span>
        </div>
        <div class="vs-block">
          <span class="vs-text">VS</span>
          <span class="countdown">${p.countdown}</span>
        </div>
        <div class="team">
          <img src="${p.awayLogo}" alt="${p.awayName} logo" class="team-logo">
          <span>${p.awayName}</span>
        </div>
      </div>

      <!-- Extra info -->
      <div class="extra-info">
        <span>🎯 ${p.prediction}</span>
        <span>💰 Odds: ${p.odds}</span>
      </div>
      <div class="date-info">
        <span>🕒 ${p.date}</span>
      </div>
      <div class="prediction-footer">
        <button class="btn btn-primary" aria-label="View Prediction Details" onclick="alert('Prediction details for ${p.match}')">View Prediction</button>
      </div>
    `;

    // Append the slide to the carousel track
    track.appendChild(slide);

    // Dots navigation
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = i === 0 ? 'active' : '';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const slides = track.querySelectorAll('.slide');
  let index = 0;
  let autoplayTimer = null;

  function update() {
    track.style.transform = `translateX(${-index * 100}%)`;
    dotsContainer.querySelectorAll('button').forEach((b, i) => {
      b.classList.toggle('active', i === index);
    });
    // Update header info
    gameEl.textContent = predictions[index].game;
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
})();

