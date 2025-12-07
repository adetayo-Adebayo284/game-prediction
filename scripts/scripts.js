// // Sample data for predicted matches per sport and odds - normally from API
// const sampleMatches = 
// {
//     Soccer: [
//         {
//             home: "Manchester United",
//             away: "Chelsea",
//             league: "Premier League",
//             time: "2025-08-12 19:45",
//             score: "1 - 2",
//             prediction: "BTTS - No",
//             confidence: 85,
//             homeLogo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
//             awayLogo: "https://upload.wikimedia.org/wikipedia/en/c/c2/Chelsea_FC.svg"
//         },
//         {
//             home: "Barcelona",
//             away: "Real Madrid",
//             league: "La Liga",
//             time: "2025-08-13 21:00",
//             score: "3 - 2",
//             prediction: "Over 2.5 Goals",
//             confidence: 78,
//             homeLogo: "https://upload.wikimedia.org/wikipedia/en/0/09/FC_Barcelona_%28crest%29.svg",
//             awayLogo: "https://upload.wikimedia.org/wikipedia/en/f/fc/Real_Madrid_CF.svg"
//         },
//         {
//             home: "Paris Saint-Germain",
//             away: "Lyon",
//             league: "Ligue 1",
//             time: "2025-08-14 18:30",
//             score: "2 - 0",
//             prediction: "Home Win",
//             confidence: 90,
//             homeLogo: "https://upload.wikimedia.org/wikipedia/en/e/e1/Paris_Saint-Germain_F.C..svg",
//             awayLogo: "https://upload.wikimedia.org/wikipedia/en/7/7c/Olympique_Lyonnais.svg"
//         }
//     ],
//     Basketball: [
//         {
//             home: "LA Lakers",
//             away: "Boston Celtics",
//             league: "NBA",
//             time: "2025-08-15 20:00",
//             score: "102 - 99",
//             prediction: "Home Win",
//             confidence: 88,
//             homeLogo: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg",
//             awayLogo: "https://upload.wikimedia.org/wikipedia/en/8/8f/Boston_Celtics.svg"
//         }
//     ],
//     Hockey: [
//         {
//             home: "Toronto Maple Leafs",
//             away: "Montreal Canadiens",
//             league: "NHL",
//             time: "2025-08-16 19:30",
//             score: "4 - 3",
//             prediction: "Away Win",
//             confidence: 72,
//             homeLogo: "https://upload.wikimedia.org/wikipedia/en/7/7f/Toronto_Maple_Leafs_logo.svg",
//             awayLogo: "https://upload.wikimedia.org/wikipedia/en/1/12/Montreal_Canadiens_logo.svg"
//         }
//     ],
//     "American Football": [
//         {
//             home: "Dallas Cowboys",
//             away: "Green Bay Packers",
//             league: "NFL",
//             time: "2025-08-17 18:00",
//             score: "21 - 17",
//             prediction: "Home Win",
//             confidence: 83,
//             homeLogo: "https://upload.wikimedia.org/wikipedia/commons/1/15/Dallas_Cowboys.svg",
//             awayLogo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Green_Bay_Packers_logo.svg"
//         }
//     ],
//     "Table Tennis": [
//         {
//             home: "Player A",
//             away: "Player B",
//             league: "World TT Championship",
//             time: "2025-08-18 14:00",
//             score: "3 - 1",
//             prediction: "Home Win",
//             confidence: 76,
//             homeLogo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Table_tennis_pictogram.svg",
//             awayLogo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Table_tennis_pictogram.svg"
//         }
//     ],
//     "Horse Race": [
//         {
//             home: "Thunderbolt",
//             away: "Speed King",
//             league: "Grand National",
//             time: "2025-08-19 16:30",
//             score: "N/A",
//             prediction: "Winner: Thunderbolt",
//             confidence: 81,
//             homeLogo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Horse_silhouette_icon.svg",
//             awayLogo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Horse_silhouette_icon.svg"
//         }
//     ]
// };


// // Initialize sampleMatches object with all sports (empty arrays)
// const sampleMatches = {
//   Soccer: [],
//   Basketball: [],
//   Hockey: [],
//   "American Football": [],
//   "Table Tennis": [],
//   "Horse Race": []
// };

// // Function to populate sampleMatches from localStorage
// function populateSampleMatches() {
//   try {
//     const stored = localStorage.getItem("defaultPredictions");
//     if (!stored) {
//       console.warn("No 'predictedMatches' key found.");
//       return;
//     }

//     const storedMatches = JSON.parse(stored);    

//     if (!Array.isArray(storedMatches)) {
//       console.error("'predictedMatches' is not an array!");
//       return;
//     }

//     // Group matches by sport
//     const sports = [...new Set(storedMatches.map(m => m.sport))];

//     sports.forEach(sport => {
//       // Filter matches for this sport
//       const matches = storedMatches.filter(m => m.sport === sport);

//       // Group by home+away+league+time
//       const grouped = {};
//       matches.forEach(m => {
//         const key = `${m.home}|${m.away}|${m.league}|${m.time}`;
//         if (!grouped[key]) {
//           grouped[key] = {
//             home: m.home,
//             away: m.away,
//             league: m.league,
//             time: m.kick,
//             odd: m.odds,
//             score: m.score || "",
//             prediction: m.prediction || "",
//             confidence: m.confidence || 0,
//             homeLogo: m.homeLogo || "",
//             awayLogo: m.awayLogo || ""
//           };
//         }
//       });

//       // Convert grouped matches to array and assign to sampleMatches[sport]
//       sampleMatches[sport] = Object.values(grouped);
//     });

//     console.log("sampleMatches populated:", sampleMatches);
//   } catch (error) {
//     console.error("Error parsing 'predictedMatches' from localStorage:", error);
//   }
// }

// // Wait 20 seconds before fetching
// setTimeout(populateSampleMatches, 20000);
// // ENDS HERE 

// Initialize sampleMatches object with all sports (empty arrays)
const sampleMatches = {
  Soccer: [],
  Basketball: [],
  Hockey: [],
  "American Football": [],
  "Table Tennis": [],
  "Horse Race": []
};

// Function to populate sampleMatches from localStorage
function populateSampleMatches() {
  try {
    const stored = localStorage.getItem("defaultPredictions");
    if (!stored) {
      console.warn("No 'defaultPredictions' key found.");
      return;
    }

    const storedMatches = JSON.parse(stored);    

    if (!Array.isArray(storedMatches)) {
      console.error("'defaultPredictions' is not an array!");
      return;
    }

    // Group matches by sport **without deduplicating**
    const sports = [...new Set(storedMatches.map(m => m.sport))];

    sports.forEach(sport => {
      // Filter matches for this sport
      const matches = storedMatches
        .filter(m => m.sport === sport)
        .map(m => ({
          home: m.home,
          away: m.away,
          league: m.league,
          time: m.time || m.kick,       // use either time or kick if present
          odd: m.odd || m.odds || null,  // numeric odd
          score: m.score || "",
          prediction: m.prediction || [],
          confidence: m.confidence || 0,
          homeLogo: m.homeLogo || "",
          awayLogo: m.awayLogo || ""
        }));

      // Assign all matches directly
      sampleMatches[sport] = matches;
    });

    console.log("AA:", sampleMatches);
  } catch (error) {
    console.error("Error parsing 'defaultPredictions' from localStorage:", error);
  }
}

// Wait 20 seconds before fetching
setTimeout(populateSampleMatches, 20000);




document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        // remove active + reset color
        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.remove('active');
            l.style.color = ''; // reset
        });

        // set active + apply color
        this.classList.add('active');
        this.style.color = '#8ef0a0';
    });
});



// JavaScript to change header background on scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('.prediction-header');
    const scrollPosition = window.scrollY;

    if (scrollPosition > 50) { // Adjust scroll position for effect trigger
        header.style.backgroundColor = 'rgba(15, 42, 23, 0.95)'; // Darker on scroll
    } else {
        header.style.backgroundColor = 'rgba(15, 23, 42, 0.9)'; // Original color
    }
});


let lastScrollTops = 0;
const panel = document.querySelector(".filters-panel");
const foot = document.getElementById("footer");
const rightAds = document.getElementById("right-ads");

let isHidden = false;
const buffer = 20; // minimum scroll difference to trigger show/hide

window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    // Calculate how far we are from the bottom
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);

    if (window.innerWidth <= 991.99) {
        // Scroll down → hide panel only when near bottom
        if (!isHidden && distanceToBottom <= buffer) {
            panel.classList.add("d-none");
            isHidden = true;
            foot.style.marginBottom = "120px";
            console.log("Near bottom → hide panel", scrollTop);
        } 
        // Scroll up → show panel if it was hidden
        // else if (isHidden && scrollTop < lastScrollTops - buffer) {
            // panel.classList.remove("d-none");
            // isHidden = false;
            // console.log("Scrolling up ↑ show panel", scrollTop);
        // }
    }

    lastScrollTops = scrollTop <= 0 ? 0 : scrollTop;
});






// window.addEventListener("wheel", (e) => {
//     if (e.deltaY > 0) {
//     // User scrolls down → keep window scrolling down
//     window.scrollBy({
//         top: 150, // adjust speed
//         left: 0,
//         behavior: "smooth",
//     });
//     }
// });

function showCustomAlert(title, message, type) {
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

 
// Header Animation text
const phrases = [
  "Accurate Sports Predictions",
  "Winning Basketball Tips",
  "Live Soccer Forecasts",
  "Expert Hockey Insights",
  "Trusted Football Odds",
  "Your Daily Sports Edge"
];

const typedText = document.getElementById("typed-text");
let phraseIndex = 0;
let letterIndex = 0;
const typingDelay = 100;
const erasingDelay = 50;
const newPhraseDelay = 1500;

function type() {
  if (letterIndex < phrases[phraseIndex].length) {
    typedText.textContent += phrases[phraseIndex].charAt(letterIndex);
    letterIndex++;
    setTimeout(type, typingDelay);
  } else {
    setTimeout(erase, newPhraseDelay);
  }
}

function erase() {
  if (letterIndex > 0) {
    typedText.textContent = phrases[phraseIndex].substring(0, letterIndex - 1);
    letterIndex--;
    setTimeout(erase, erasingDelay);
  } else {
    phraseIndex = (phraseIndex + 1) % phrases.length;
    setTimeout(type, typingDelay);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  typedText.textContent = "";
  type();
});

// Hold current selected filters
let selectedSport = null;
let selectedOdds = null;
let selectedRisk = "low risk";

// Store favorites and notes in localStorage keys
const FAVORITES_KEY = "eaglePredictFavorites";
const NOTES_KEY = "eaglePredictNotes";

// Load favorites and notes or initialize empty
let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || {};
let notes = JSON.parse(localStorage.getItem(NOTES_KEY)) || {};

// UI elements
const sportBtns = document.querySelectorAll("#sportBtns button");
const oddsBtns = document.querySelectorAll("#oddsBtns button");
const riskRadios = document.querySelectorAll("input[name='risk']");
const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");
const predictionsList = document.getElementById("predictionsList");

let stickToBottom = true; // default: auto-scroll enabled
let lastScrollTop = 0;

// ------------- FROM HERE -------------------

// const defaultSport = [
//     "Soccer", "Basketball", "Hockey",
//     "American Football", "Table Tennis",
//     "Horse Race", "Car Rice"
// ];

const defaultSport = [
    "Soccer"
];

defaultSport.forEach(index => {
    let btn = document.createElement('button');
    btn.className = "btn btn-sport me-2 mb-2";
    btn.setAttribute("data-sport", index);
    btn.setAttribute("role", "listitem");
    btn.textContent = index; // Add text to button

    // Append button to the sportBtns container in DOM
    const sportBtnsContainer = document.getElementById('sportBtns');
    sportBtnsContainer.appendChild(btn);

    // Add event listener after appending to the DOM
    btn.addEventListener("click", () => {
        // Remove 'active' class from all buttons
        document.querySelectorAll('#sportBtns button').forEach(b => b.classList.remove("active"));
        // Add 'active' class to clicked button
        btn.classList.add("active");

        // Store selected sport
        selectedSport = btn.dataset.sport;
        resetBtn.classList.add("d-none");
        generateBtn.classList.remove("d-none");
    });
});


// ------------- TO HERE -------------------


// Toggle stick-to-bottom when user clicks anywhere in the predictions list
predictionsList.addEventListener("click", () => {
  stickToBottom = !stickToBottom;
});


// Scroll clicked card into view AND enable stick-to-bottom
function scrollCardIntoView(card) {
  stickToBottom = true; // re-enable auto-scroll
  card.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Add event listeners for selection buttons
sportBtns.forEach(btn =>
    btn.addEventListener("click", () => {
        sportBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active"); 
        selectedSport = btn.dataset.sport;        
    })
);



// ODDS SELECTION
// const oddsOptions = [
//     "Straight Win", "Most Scoring Halves",
//     "Multi Goals", "Correct Score", "DNB", "Over 1.5",
//     "Over 2.5", "Under 3.5", "Under 4.5",
//     "Double Chance", 1, 2, 3, 5

// ]; // Example odds values

const oddsOptions = [
    "Win - Home",
    "Win - Away",
    "Draw",
    "First Team to Score",
    "Half-time/Full-time",
    "Over/Under 5.5 Goals",
    "Win to Nil",
    "Both Halves Over 1.5",
    "Goal Line",
    "Over/Under 7.5 Goals",
    "Draw No Bet",
    "Half-time Result",
    "Asian Handicap",
    "Over/Under Total Goals",
    "Fulltime Result (1X2)",
    "Odd/Even Goals",
    "Red Card?",
    "Corners",
    "Over/Under 1.5 Goals",
    "Double Chance",
    "Exact Goals",
    "Yellow Card?",
    "Over/Under 2.5 Goals",
    "Over/Under 3.5 Goals",
    "Over/Under 4.5 Goals",
    "Clean Sheet",
    "Correct Score",
    "Over/Under 6.5 Goals",
    "Penalty Awarded?",
    "Over/Under 0.5 Goals",
    "Both Teams To Score",
     1, 2, 3, 5,
];



// Create the odds buttons dynamically
oddsOptions.forEach(odd => {
    let btn = document.createElement('button');
    btn.className = "btn btn-odds me-2 mb-2";
    btn.setAttribute("data-odd", odd);
    btn.setAttribute("role", "listitem");
    btn.textContent = `${odd}`; // Set text to the button
    
    // Append button to the oddsBtns container in DOM
    const oddsBtnsContainer = document.getElementById('oddsBtns');
    oddsBtnsContainer.appendChild(btn);

    // Add click event listener to the button
    btn.addEventListener("click", () => {
        // Remove active class from all odds buttons
        document.querySelectorAll('#oddsBtns button').forEach(b => b.classList.remove("active"));
        // Add active class to clicked button
        btn.classList.add("active");

        // Store selected odds
        selectedOdds = btn.dataset.odd;
        resetBtn.classList.add("d-none");
        generateBtn.classList.remove("d-none");
    });
});

// oddsBtns.forEach(btn =>
//     btn.addEventListener("click", () => {
//         oddsBtns.forEach(b => b.classList.remove("active"));
//         btn.classList.add("active");
//         selectedOdds = parseInt(btn.dataset.odd, 10);
//     })
// );

riskRadios.forEach(radio =>
    radio.addEventListener("change", () => {
        selectedRisk = radio.value;
        resetBtn.classList.add("d-none");
        generateBtn.classList.remove("d-none");
    })
);

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

// Save notes to localStorage
function saveNotes() {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

// Generate unique key for a match for storage
function matchKey(match) {
    return `${match.home}-${match.away}-${match.time}-${match.prediction}`.replace(/\s+/g, "_");
}

// Copy to clipboard helper
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // alert("Prediction info copied to clipboard!");
        // Show alert after 2 seconds
        setTimeout(() => {
            showCustomAlert("Success", "Prediction info copied to clipboard", "success");
        }, 20);
    }, () => {
        // alert("Failed to copy to clipboard.");
        setTimeout(() => {
            showCustomAlert("Error", "Unable to copy prediction info to clipboard!", "error");
        }, 20);
    });
}

// Function to generate prediction cards
function renderPredictions(matches) {
   
    console.log(matches);
    
    predictionsList.innerHTML = "";
    generateBtn.classList.add("d-none");
    resetBtn.classList.remove("d-none");

    matches.forEach((match, index) => {
        const key = matchKey(match);
        const isFavorited = favorites[key] === true;
        // const noteText = notes[key] || "";

        const card = document.createElement("article");
        card.className = "prediction-card mb-4";
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `Prediction for ${match.home} versus ${match.away}, prediction: ${match.prediction} with confidence ${match.confidence} percent`);

        // Generate unique IDs for each match's accordion and collapse section
        const accordionId = `accordionItem${index}`;
        const collapseId = `collapse${index}`;
        const headingId = `heading${index}`;

        // Prepare a readable prediction string
        let predictionText = "No prediction available";
        if (Array.isArray(match.prediction) && match.prediction.length > 0) {
            const preds = match.prediction[0].predictions;
            if (preds && typeof preds === "object") {
                predictionText = Object.entries(preds)
                    .map(([key, value]) => `${key.replace(/_/g, " ")}: ${value.toFixed(2)}%`)
                    .join(" | ");
            }
        }

        card.innerHTML = `
            <div class="accordion accordion-flush" id="${accordionId}">
                <div class="accordion-item">
                    <h2 class="accordion-header" id="${headingId}">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                            ${match.home} vs ${match.away}
                        </button>
                    </h2>
                    <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}">
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
                            <div class="prediction-details">Prediction: ${predictionText}</div>
                            <!--<div class="tooltip-badge confidence-badge" tabindex="0" aria-describedby="tooltip-${key}">
                                Confidence: ${match.confidence}%
                                <span class="tooltip-texts" role="tooltip" id="tooltip-${key}">Confidence indicates likelihood of prediction accuracy</span>
                            </div>-->

                            <div class="card-actions" role="group" aria-label="Prediction actions">
                                <button class="action-btn btn-save" aria-pressed="${isFavorited}" aria-label="${isFavorited ? "Remove from favorites" : "Add to favorites"}" title="${isFavorited ? "Remove from favorites" : "Add to favorites"}">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="${isFavorited ? "#ffc107" : "none"}" stroke="#ffd700" stroke-width="2" viewBox="0 0 24 24" width="24" height="24" style="vertical-align: middle;">
                                        <path stroke-linejoin="round" stroke-linecap="round" d="M12 17.27L18.18 21 15.64 14.14 22 10.27 15.09 10.14 12 3 8.91 10.14 2 10.27 8.36 14.14 5.82 21z"/>
                                    </svg>
                                </button>
                                <button class="action-btn btn-share" aria-label="Share prediction" title="Copy prediction info">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#ffd700" stroke-width="2" viewBox="0 0 24 24" width="24" height="24" style="vertical-align: middle;">
                                        <path stroke-linejoin="round" stroke-linecap="round" d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Favorite button toggle logic
        const btnSave = card.querySelector(".btn-save");
        btnSave.addEventListener("click", () => {
            if (favorites[key]) {
                delete favorites[key];
                btnSave.setAttribute("aria-pressed", "false");
                btnSave.title = "Add to favorites";
                btnSave.querySelector("svg").setAttribute("fill", "none");
                btnSave.classList.remove("saved");
            } else {
                favorites[key] = true;
                btnSave.setAttribute("aria-pressed", "true");
                btnSave.title = "Remove from favorites";
                btnSave.querySelector("svg").setAttribute("fill", "#ffc107");
                btnSave.classList.add("saved");
            }
            saveFavorites();
        });
        // Initialize favorite button style
        if (isFavorited) {
            btnSave.classList.add("saved");
        }

        // Share button logic
        const btnShare = card.querySelector(".btn-share");
        btnShare.addEventListener("click", () => {
            const textToCopy = `Prediction for ${match.home} vs ${match.away} on ${match.time}:\nPrediction: ${match.prediction}\nConfidence: ${match.confidence}%\nLeague: ${match.league}`;
            copyToClipboard(textToCopy);
        });

        predictionsList.appendChild(card);

        // Open the first accordion by default
        if (index === 0) {
            const firstCollapse = card.querySelector(`#collapse${index}`);
            const firstButton = card.querySelector(`#${headingId} .accordion-button`);
            firstCollapse.classList.add('show');
            firstButton.setAttribute('aria-expanded', 'true');
        }

        // Custom logic to close other accordions when one is opened
        const buttons = document.querySelectorAll('.accordion-button');
        buttons.forEach(button => {
            button.addEventListener('click', function () {
                const targetCollapse = document.querySelector(this.getAttribute('data-bs-target'));
                if (targetCollapse.classList.contains('show')) {
                    return; // If it's already open, do nothing
                }
                const openCollapse = document.querySelector('.accordion-collapse.show');
                if (openCollapse) {
                    openCollapse.classList.remove('show'); // Close the currently open one
                }
                targetCollapse.classList.add('show'); // Open the clicked one
            });
        });
    });
}


// Function to remove duplicates from matches
function removeDuplicates(matches) {
    const seen = new Set();
    return matches.filter(m => {
        const key = `${m.sport}|${m.home}|${m.away}|${m.market}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function filterMatches(matches, selectedOdds, selectedRisk) {
    if (!Array.isArray(matches)) return [];

    // Step 0: Remove duplicates first
    let uniqueMatches = removeDuplicates(matches);

    // Normalize odds input
    const isNumericOdd = !isNaN(Number(selectedOdds));
    const numericOdds = isNumericOdd ? Number(selectedOdds) : null;

    // Step 1: Filter by selected odds
    let filtered = uniqueMatches
        .map(match => {
            const m = { ...match };

            if (!isNumericOdd) {
                // Filter by market name
                if (Array.isArray(m.prediction)) {
                    const marketMatch = m.prediction.find(
                        p => p.market.toLowerCase().trim() === selectedOdds.toLowerCase().trim()
                    );
                    if (marketMatch) {
                        m.prediction = [marketMatch]; // Keep only selected market
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            } else {
                // Filter by numeric odd
                if (m.odd === undefined || m.odd !== numericOdds) {
                    return null;
                }
            }

            return m;
        })
        .filter(m => m !== null);

    // Step 2: Filter by risk level
    switch (selectedRisk) {
        case "Low risk":
            filtered = filtered.filter(m => m.confidence >= 80);
            break;
        case "Very low risk":
            filtered = filtered.filter(m => m.confidence >= 70);
            break;
        case "Least risk":
        default:
            // No filtering — show all
            break;
    }

    return filtered;
}

// function filterMatches(matches, selectedOdds, selectedRisk) {
//   if (!Array.isArray(matches)) return [];

//   // Normalize odds input
//   const isNumericOdd = !isNaN(Number(selectedOdds));
//   const numericOdds = isNumericOdd ? Number(selectedOdds) : null;

//   // Step 1: Filter by odds (if numeric)
//   let filtered = matches;
//   if (isNumericOdd && numericOdds > 0) {
//     const oddsThreshold = Math.max(1, Math.floor(matches.length * (2 / numericOdds)));
//     filtered = matches.slice(0, oddsThreshold);
//   }

//   // Step 2: Filter by risk level
//   switch (selectedRisk) {
//     case "High risk":
//       filtered = filtered.filter(m => m.confidence < 70); // lower confidence
//       break;
//     case "Low risk":
//       filtered = filtered.filter(m => m.confidence >= 80); // high confidence
//       break;
//     case "Very low risk":
//       filtered = filtered.filter(m => m.confidence >= 70); // moderate confidence
//       break;
//     case "Least risk":
//     default:
//       // No filtering — show all
//       break;
//   }

//   return filtered;
// }


// ------------------- Example Usage -------------------

generateBtn.addEventListener("click", () => {
    if (!selectedSport) {
        // alert("Please select a sport.");
        setTimeout(() => {
            showCustomAlert("Warning", "Please select sport from the list", "warning");
        }, 20);
        return;
    }
    if (!selectedOdds) {
        // alert("Please select odds.");
        setTimeout(() => {
            showCustomAlert("Warning", "Please select odd from the list", "warning");
        }, 20);
        return;
    }
    if (!selectedRisk) {
        // alert("Please select a risk level.");
        setTimeout(() => {
            showCustomAlert("Warning", "Please select a risk level", "warning");
        }, 20);
        return;
    }

    let matches = sampleMatches[selectedSport];

    if (!matches) {
        predictionsList.innerHTML = `<p class="text-center fs-4 text-warning">No data available for selected sport.</p>`;
        return;
    }
    

    console.log("CALL FILTERMA..: ",matches, " ODD: ",  selectedOdds, "RISK: ", selectedRisk);
    const filteredMatches = filterMatches(matches, selectedOdds, selectedRisk);
    console.log("S: ",filteredMatches);

    if (!filteredMatches || filteredMatches.length === 0) {
        setTimeout(() => {
            generateBtn.classList.add("d-none");
            resetBtn.classList.remove("d-none");
            showCustomAlert(
                "warning",
                "No predictions are available for the selected filters. You will be redirected to today’s predictions.",
                "warning"
            );
            window.location.href = "./#todayPredictionHeader";
        }, 20);
        return;
    }
    
    
    renderPredictions(filteredMatches);
    


    // if (!filteredMatches || filteredMatches.length === 0) {
    //     setTimeout(() => {
    //     showCustomAlert(
    //         "warning",
    //         "No predictions are available for the selected filters. You will be redirected to today’s predictions.",
    //         "warning"
    //     );
    //     window.location.href = "http://localhost/game/#todayPredictionHeader";
    //     }, 20);
    //     return;
    // }
});


resetBtn.addEventListener("click", () => {
    setTimeout(() => {
        showCustomAlert(
            "info",
            "The page has been reset to its default state.",
            "info"
        );

        // Reset selections
        selectedSport = null;
        selectedOdds = null;
        selectedRisk = "Low risk";

        // Clear active state on sports buttons
        document.querySelectorAll(".btn-sport").forEach(e => {
            e.classList.remove("active");
        });
        // Clear active state on sports buttons
        document.querySelectorAll(".btn-odds").forEach(e => {
            e.classList.remove("active");
        });

        // Reset risk options (select first one only)
        const riskOptions = document.querySelectorAll(".risk-option");
        riskOptions.forEach((opt, idx) => {
            const input = opt.querySelector("input[type='radio']");
            if (idx === 0) {
                opt.setAttribute("aria-checked", "true");
                input.checked = true;
            } else {
                opt.setAttribute("aria-checked", "false");
                input.checked = false;
            }
        });

        // Show/Hide correct buttons
        generateBtn.classList.remove("d-none");
        resetBtn.classList.add("d-none");

        // REFENDER ALL THE INDEX.HTML PLEASE FIX HERE ONLY
        // predictionsList 

        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, 20);
});




// Mobile bottom nav button click handlers
const bottomNav = document.getElementById("bottomNav");

if (bottomNav) {
    bottomNav.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active from all buttons
            bottomNav.querySelectorAll("button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const nav = btn.getAttribute("data-nav");
            console.log(nav);
            
            if (nav === "home") {
                // Scroll to top
                window.scrollTo({ top: 0, behavior: "smooth" });
                history.replaceState(null, "", "#");
            } 
            else if (nav === "todayPredictionHeader") {
                const section = document.getElementById("todayPredictionHeader");
                if (section) section.scrollIntoView({ behavior: "smooth" });
                history.replaceState(null, "", "#todayPredictionHeader");
            } 
            else if (nav === "histories") { // History
                const section = document.getElementById("histories");
                if (section) section.scrollIntoView({ behavior: "smooth" });
                history.replaceState(null, "", "#histories");
            } 
            else if (nav === "contact") {
                // Open new page
                window.location.href = "contact.html";
            }
        });
    });
}


// Example: pagination click event
document.querySelectorAll(".page-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        // Logic to fetch/display page data
        console.log("Page clicked:", btn.innerText);
    });
});


// // Fetch predictions from localStorage
// const storedPredictions = localStorage.getItem("bestPredictions");
// let todayMatches = [];

// if (storedPredictions) {
//     const predictions = JSON.parse(storedPredictions);

//     // Map each confidence category into a match object
//     Object.keys(predictions).forEach((level) => {
//         const item = predictions[level];
//         if (item && item.time) {
//             const matchDate = new Date(item.time.replace(" ", "T")); 
//             // Convert "2025-09-28 13:00:00" → proper Date

//             todayMatches.push({
//                 fullDate: matchDate.toLocaleDateString([], { 
//                     weekday: "short", year: "numeric", month: "short", day: "numeric" 
//                 }), // e.g. Sun, Sep 28, 2025
//                 time: matchDate.toLocaleTimeString([], { 
//                     hour: "2-digit", minute: "2-digit" 
//                 }),
//                 teams: item.teams || `${item.home} vs ${item.away}`,
//                 league: item.league || "Unknown League",
//                 homeLogo: item.homeLogo || "placeholder_home.png",
//                 awayLogo: item.awayLogo || "placeholder_away.png",
//                 home: item.home || "Home",
//                 away: item.away || "Away",
//                 score: item.score || "-",
//                 prediction: item.prediction || "N/A",
//                 confidence: typeof item.confidence === "number" ? item.confidence : 0,
//                 confidenceLevel: level.replace("_", " ").toUpperCase(), // e.g. very_high → VERY HIGH
//                 isFavorited: item.isFavorited || false
//             });
//         }
//     });
// }

// const matchList = document.getElementById("matchList");

// // If no matches found, show a fallback message
// if (todayMatches.length === 0) {
//     const emptyMsg = document.createElement("p");
//     emptyMsg.className = "text-center py-4 text-muted";
//     emptyMsg.textContent = "No predictions available. Please check back later.";
//     matchList.appendChild(emptyMsg);
// } else {
//     todayMatches.forEach((match, index) => {
//         // Generate unique IDs for each match's accordion and collapse section
//         const accordionId = `accordionItem${index}`;
//         const collapseId = `collapse${index}`;
//         const headingId = `heading${index}`;

//         const card = document.createElement("article");
//         card.className = "prediction-card mb-4";
//         card.setAttribute("tabindex", "0");
//         card.setAttribute(
//             "aria-label",
//             `Prediction for ${match.home} versus ${match.away}, prediction: ${match.prediction} with confidence ${match.confidenceLevel} ${match.confidence}%`
//         );

//         // Confidence formatted safely
//         const confidenceText = match.confidence
//             ? `${match.confidence.toFixed(2)}%`
//             : "N/A";

//         card.innerHTML = `
//             <div class="accordion accordion-flush" id="${accordionId}">
//                 <div class="accordion-item">
//                     <h2 class="accordion-header" id="${headingId}">
//                         <button class="accordion-button" type="button" 
//                             data-bs-toggle="collapse" 
//                             data-bs-target="#${collapseId}" 
//                             aria-expanded="${index === 0 ? "true" : "false"}" 
//                             aria-controls="${collapseId}">
//                             ${match.home} vs ${match.away}
//                         </button>
//                     </h2>
//                     <div id="${collapseId}" 
//                         class="accordion-collapse collapse ${index === 0 ? "show" : ""}" 
//                         aria-labelledby="${headingId}">
//                         <div class="accordion-body">
//                             <div class="match-header">
//                                 <div class="team">
//                                     <img src="${match.homeLogo}" alt="${match.home} logo" class="team-logo" />
//                                     <div class="team-name">${match.home}</div>
//                                 </div>
//                                 <div class="match-score" style="font-size: .8rem;">VS</div>
//                                 <div class="team">
//                                     <img src="${match.awayLogo}" alt="${match.away} logo" class="team-logo" />
//                                     <div class="team-name">${match.away}</div>
//                                 </div>
//                             </div>
//                             <div class="match-info">${match.league} • ${match.fullDate} • ${match.time}</div>
//                             <div class="prediction-details">Prediction: ${match.prediction}</div>
//                             <div class="tooltip-badge confidence-badge" 
//                                 tabindex="0" aria-describedby="tooltip-${index}">
//                                 Confidence: ${match.confidenceLevel} (${confidenceText})
//                                 <span class="tooltip-texts" role="tooltip" id="tooltip-${index}">
//                                     Confidence indicates likelihood of prediction accuracy
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         `;

//         // Append the card to the match list
//         matchList.appendChild(card);

//         // Custom logic to close other accordions when one is opened
//         const accordionButton = card.querySelector(`#${headingId} button`);
//         const collapseElement = card.querySelector(`#${collapseId}`);

//         accordionButton.addEventListener("click", function () {
//             // Check if the clicked accordion is already open
//             if (collapseElement.classList.contains("show")) {
//                 collapseElement.classList.remove("show");
//             } else {
//                 // Close all other accordions
//                 document.querySelectorAll(".accordion-collapse.show").forEach((openCollapse) => {
//                     openCollapse.classList.remove("show");
//                 });

//                 // Open the clicked accordion
//                 collapseElement.classList.add("show");

//                 // Scroll the card into view smoothly
//                 scrollCardIntoView(card);
//             }
//         });
//     });
// }


let todayMatches = [];

// Delay 10 seconds before fetching predictions
setTimeout(() => {
    const storedPredictions = localStorage.getItem("bestPredictions");

    if (storedPredictions) {
        const predictions = JSON.parse(storedPredictions);

        // Map each confidence category into a match object
        Object.keys(predictions).forEach((level) => {
            const item = predictions[level];
            if (item && item.time) {
                const matchDate = new Date(item.time.replace(" ", "T")); 
                // Convert "2025-09-28 13:00:00" → proper Date

                todayMatches.push({
                    fullDate: matchDate.toLocaleDateString([], { 
                        weekday: "short", year: "numeric", month: "short", day: "numeric" 
                    }), // e.g. Sun, Sep 28, 2025
                    time: matchDate.toLocaleTimeString([], { 
                        hour: "2-digit", minute: "2-digit" 
                    }),
                    teams: item.teams || `${item.home} vs ${item.away}`,
                    league: item.league || "Unknown League",
                    homeLogo: item.homeLogo || "placeholder_home.png",
                    awayLogo: item.awayLogo || "placeholder_away.png",
                    home: item.home || "Home",
                    away: item.away || "Away",
                    score: item.score || "-",
                    prediction: item.prediction || "N/A",
                    confidence: typeof item.confidence === "number" ? item.confidence : 0,
                    confidenceLevel: level.replace("_", " ").toUpperCase(), // e.g. very_high → VERY HIGH
                    isFavorited: item.isFavorited || false
                });
            }
        });
    }

    const matchList = document.getElementById("matchList");

    // If no matches found, show a fallback message
    if (todayMatches.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.className = "text-center py-4 text-muted";
        emptyMsg.textContent = "No predictions available. Please check back later.";
        matchList.appendChild(emptyMsg);
    } else {
        todayMatches.forEach((match, index) => {
            // Generate unique IDs for each match's accordion and collapse section
            const accordionId = `accordionItem${index}`;
            const collapseId = `collapse${index}`;
            const headingId = `heading${index}`;

            const card = document.createElement("article");
            card.className = "prediction-card mb-4";
            card.setAttribute("tabindex", "0");
            card.setAttribute(
                "aria-label",
                `Prediction for ${match.home} versus ${match.away}, prediction: ${match.prediction} with confidence ${match.confidenceLevel} ${match.confidence}%`
            );

            // Confidence formatted safely
            const confidenceText = match.confidence
                ? `${match.confidence.toFixed(2)}%`
                : "N/A";

            card.innerHTML = `
                <div class="accordion accordion-flush" id="${accordionId}">
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="${headingId}">
                            <button class="accordion-button" type="button" 
                                data-bs-toggle="collapse" 
                                data-bs-target="#${collapseId}" 
                                aria-expanded="${index === 0 ? "true" : "false"}" 
                                aria-controls="${collapseId}">
                                ${match.home} vs ${match.away}
                            </button>
                        </h2>
                        <div id="${collapseId}" 
                            class="accordion-collapse collapse ${index === 0 ? "show" : ""}" 
                            aria-labelledby="${headingId}">
                            <div class="accordion-body">
                                <div class="match-header">
                                    <div class="team">
                                        <img src="${match.homeLogo}" alt="${match.home} logo" class="team-logo" />
                                        <div class="team-name">${match.home}</div>
                                    </div>
                                    <div class="match-score" style="font-size: .8rem;">VS</div>
                                    <div class="team">
                                        <img src="${match.awayLogo}" alt="${match.away} logo" class="team-logo" />
                                        <div class="team-name">${match.away}</div>
                                    </div>
                                </div>
                                <div class="match-info">${match.league} • ${match.fullDate} • ${match.time}</div>
                                <div class="prediction-details">Prediction: ${match.prediction}</div>
                                <div class="tooltip-badge confidence-badge" 
                                    tabindex="0" aria-describedby="tooltip-${index}">
                                    Confidence: ${match.confidenceLevel} (${confidenceText})
                                    <span class="tooltip-texts" role="tooltip" id="tooltip-${index}">
                                        Confidence indicates likelihood of prediction accuracy
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Append the card to the match list
            matchList.appendChild(card);

            // Custom logic to close other accordions when one is opened
            const accordionButton = card.querySelector(`#${headingId} button`);
            const collapseElement = card.querySelector(`#${collapseId}`);

            accordionButton.addEventListener("click", function () {
                // Check if the clicked accordion is already open
                if (collapseElement.classList.contains("show")) {
                    collapseElement.classList.remove("show");
                } else {
                    // Close all other accordions
                    document.querySelectorAll(".accordion-collapse.show").forEach((openCollapse) => {
                        openCollapse.classList.remove("show");
                    });

                    // Open the clicked accordion
                    collapseElement.classList.add("show");

                    // Scroll the card into view smoothly
                    scrollCardIntoView(card);
                }
            });
        });

        // After 20 seconds (10s fetch + 10s wait), auto-open the first card
        setTimeout(() => {
            const firstCard = document.querySelector("#collapse0");
            if (firstCard) {
                // Close any open cards
                document.querySelectorAll(".accordion-collapse.show").forEach((openCollapse) => {
                    openCollapse.classList.remove("show");
                });
                firstCard.classList.add("show");
                scrollCardIntoView(firstCard.closest(".prediction-card"));
            }
        }, 20000); // 20s total
    }
}, 10000); // initial 10s wait before fetching


// Open the first accordion by default
const firstAccordionCollapse = document.querySelector('.accordion-collapse');
if (firstAccordionCollapse) {
    firstAccordionCollapse.classList.add('show');
}


const riskGroup = document.getElementById('riskGroup');
const riskOptions = riskGroup.querySelectorAll('.risk-option');
const radios = riskGroup.querySelectorAll('input[type="radio"]');

function updateAriaChecked(selectedIndex) {
  riskOptions.forEach((option, i) => {
    option.setAttribute('aria-checked', i === selectedIndex ? 'true' : 'false');
    option.tabIndex = i === selectedIndex ? 0 : -1;
  });
  radios[selectedIndex].checked = true;
  riskOptions[selectedIndex].focus();
}

riskGroup.addEventListener('keydown', (e) => {
  const currentIndex = Array.from(riskOptions).findIndex((opt) => opt.tabIndex === 0);
  let newIndex = currentIndex;

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault();
      newIndex = (currentIndex + 1) % riskOptions.length;
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault();
      newIndex = (currentIndex - 1 + riskOptions.length) % riskOptions.length;
      break;
    case ' ':
    case 'Enter':
      e.preventDefault();
      radios[currentIndex].checked = true;
      break;
  }

  if (newIndex !== currentIndex) {
    updateAriaChecked(newIndex);
  }
});

// Initialize first option as selected/focused if none selected
const initiallyCheckedIndex = Array.from(radios).findIndex((r) => r.checked);
updateAriaChecked(initiallyCheckedIndex >= 0 ? initiallyCheckedIndex : 0);




