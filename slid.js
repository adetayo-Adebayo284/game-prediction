const adsSlides = document.querySelector('.ads-slides');
const adsSlide = document.querySelectorAll('.ads-slide');
const adsPrev = document.querySelector('.ads-prev');
const adsNext = document.querySelector('.ads-next');
const adsBanner = document.getElementById('adsBanner');
const toggleAdsBtn = document.getElementById('toggleAdsBtn');
const adsPreview = document.querySelector('.ads-preview');
const adsPreviewText = document.querySelector('.ads-preview-text');



const icon = document.getElementById('toggle');
const header = document.querySelector('.predict-header');
const carouselGroup = document.getElementById('carouselGroup');
const wrap = document.querySelector('.prediction-carousel');
const main = document.querySelector("body > div.container-fluid.main-container")
// const panel = document.querySelector(".filters-panel");

const scrWidth = window.innerWidth
console.log(scrWidth);

icon.onclick = e => {
    e.preventDefault();
    panel.classList.remove("d-none");
    if (window.innerWidth >= 992) return;

    if (header.classList.contains('d-none')) {
        // Show the header and carousel group
        header.classList.remove('d-none');
        carouselGroup.style.display = 'block';
        window.scrollTo(0, document.documentElement.scrollHeight);
        icon.textContent = 'Close Schedule';
        panel.classList.remove("d-none")
    } else {
        // Hide the header and carousel group
        header.classList.add('d-none');
        carouselGroup.style.display = 'none';
        icon.style.display = 'block';
        icon.textContent = 'Sports Schedule';
        panel.classList.add("d-none")
        main.style.padding = '0'; // Remove the extra margin to eliminate empty space
    }
}


let adsIndex = 0;
let adsAutoSlide;
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID = 0;

function showAdsSlide(i) {
    if (i >= adsSlide.length) adsIndex = 0;
    else if (i < 0) adsIndex = adsSlide.length - 1;
    else adsIndex = i;

    currentTranslate = -adsIndex * adsSlides.clientWidth;
    prevTranslate = currentTranslate;
    setSliderPosition();

    // Update preview image and text
    const img = adsSlide[adsIndex].querySelector('img');
    adsPreview.style.backgroundImage = `url('${img.src}')`;

    // Fade in text overlay
    adsPreviewText.classList.remove('show');
    setTimeout(() => {
        adsPreviewText.textContent = img.alt || '';
        adsPreviewText.classList.add('show');
    }, 150);
}

function setSliderPosition() {
    adsSlides.style.transform = `translateX(${currentTranslate}px)`;
}

function animation() {
    setSliderPosition();
    if (isDragging) requestAnimationFrame(animation);
}

function touchStart() {
    return function(e) {
        isDragging = true;
        startPos = getPositionX(e);
        animationID = requestAnimationFrame(animation);
        adsSlides.style.transition = 'none';
        stopAdsAutoSlide();
    };
}

function touchMove(event) {
    if (isDragging) {
        const currentPosition = getPositionX(event);
        const diff = currentPosition - startPos;
        currentTranslate = prevTranslate + diff;
    }
}

function touchEnd() {
    isDragging = false;
    cancelAnimationFrame(animationID);

    const movedBy = currentTranslate - prevTranslate;
    if (movedBy < -100) adsIndex++;
    else if (movedBy > 100) adsIndex--;

    showAdsSlide(adsIndex);
    adsSlides.style.transition = 'transform 0.5s ease-in-out';
    startAdsAutoSlide();
}

function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

function startAdsAutoSlide() {
    stopAdsAutoSlide();
    adsAutoSlide = setInterval(() => {
        adsIndex++;
        showAdsSlide(adsIndex);
    }, 5000);
}

function stopAdsAutoSlide() {
    clearInterval(adsAutoSlide);
}

// Navigation
adsNext.addEventListener('click', () => { adsIndex++; showAdsSlide(adsIndex); restartAuto(); });
adsPrev.addEventListener('click', () => { adsIndex--; showAdsSlide(adsIndex); restartAuto(); });

function restartAuto() {
    stopAdsAutoSlide();
    startAdsAutoSlide();
}

// Toggle ads image
toggleAdsBtn.addEventListener('click', () => {
    adsBanner.classList.toggle('collapsed');
    if (adsBanner.classList.contains('collapsed')) {
        toggleAdsBtn.textContent = '▼';
        toggleAdsBtn.title = 'Expand Ads';
    } else {
        toggleAdsBtn.textContent = '▲';
        toggleAdsBtn.title = 'Collapse Ads';
    }
});

// Drag/Swipe image
adsSlides.addEventListener('mousedown', touchStart());
adsSlides.addEventListener('mouseup', touchEnd);
adsSlides.addEventListener('mouseleave', () => { if (isDragging) touchEnd(); });
adsSlides.addEventListener('mousemove', touchMove);
adsSlides.addEventListener('touchstart', touchStart());
adsSlides.addEventListener('touchend', touchEnd);
adsSlides.addEventListener('touchmove', touchMove);

// Start collapsed & init
adsBanner.classList.add('collapsed');
toggleAdsBtn.textContent = '▼';
toggleAdsBtn.title = 'Expand Ads';
showAdsSlide(adsIndex);
startAdsAutoSlide();

// Hide toggle only if out of view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        toggleAdsBtn.classList.toggle('hidden', !entry.isIntersecting);
    });
}, { threshold: 0 });
observer.observe(adsBanner);

// collapse icon
const toggleBtn = document.querySelector('.ads-toggle-btn');

let fadeTimeout;

function showToggleBtn() {
  clearTimeout(fadeTimeout);
  toggleBtn.style.opacity = '1';
  fadeTimeout = setTimeout(() => {
    toggleBtn.style.opacity = '0.3';
  }, 3000);
}

adsBanner.addEventListener('click', showToggleBtn);
adsBanner.addEventListener('touchstart', showToggleBtn);

// Swiper init
const swiper = new Swiper(".prediction-swiper", {
  loop: true,
  autoplay: {
    delay: 5000, // 5 seconds per slide
    disableOnInteraction: false,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

// Countdown logic
function updateCountdowns() {
  document.querySelectorAll(".countdown").forEach(el => {
    const targetTime = new Date(el.dataset.time).getTime();
    const now = new Date().getTime();
    const diff = targetTime - now;

    if (diff <= 0) {
      el.textContent = "Live";
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    el.textContent = `${hours}h ${minutes}m ${seconds}s`;
  });
}
setInterval(updateCountdowns, 1000);
updateCountdowns();





