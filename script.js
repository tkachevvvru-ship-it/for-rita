const storySteps = [
  {
    icon: "🦷",
    title: "Зубик загрустил",
    text: "Маленький зубик тихонько попросил: «Подари мне немного заботы».",
  },
  {
    icon: "🧚",
    title: "Фея услышала его",
    text: "Фея Улыбки прилетела с мягким светом и сказала: «Мы рядом».",
  },
  {
    icon: "⭐",
    title: "Героиня получила звёздочку храбрости",
    text: "Самая смелая девочка засияла, потому что она умеет держаться.",
  },
  {
    icon: "💖",
    title: "Все вместе помогают зубику улыбнуться",
    text: "Сердечки, капельки и добрые слова подарили зубику много заботы.",
  },
];

const gamePhrases = [
  "Зубик почувствовал заботу.",
  "Стало чуть-чуть легче.",
  "Какая храбрая героиня!",
  "Фея улыбается!",
  "Ты молодец!",
];

const supportPhrases = [
  "Ты супер!",
  "Фея гордится тобой!",
  "Зубик получил сердечко.",
  "Ещё немного волшебства!",
  "Какая смелая улыбка!",
  "Ты справляешься!",
  "Мы рядом!",
  "Ты очень храбрая. Я рядом с тобой.",
];

const state = {
  storyIndex: 0,
  openedPlaces: new Set(),
  mood: 0,
  usedItems: new Set(),
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const toast = $("#toast");
const sparkleLayer = $("#sparkleLayer");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function setupPhotoFallback() {
  ["#heroPhoto", "#certificatePhoto"].forEach((selector) => {
    const image = $(selector);
    if (!image) return;
    image.addEventListener("error", () => {
      image.parentElement.classList.add("photo-missing");
    });
  });
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  $$(".reveal").forEach((section) => observer.observe(section));
}

function setupScrollButtons() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-scroll]");
    if (!button) return;

    const target = $(button.dataset.scroll);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

function updateStory() {
  const step = storySteps[state.storyIndex];
  $("#storyIcon").textContent = step.icon;
  $("#storyCount").textContent = `Шаг ${state.storyIndex + 1} из ${storySteps.length}`;
  $("#storyTitle").textContent = step.title;
  $("#storyText").textContent = step.text;
  $$(".story-progress span").forEach((dot, index) => {
    dot.classList.toggle("active", index <= state.storyIndex);
  });
  $("#nextStory").textContent =
    state.storyIndex === storySteps.length - 1 ? "Ещё раз" : "Дальше";
}

function setupStory() {
  $("#nextStory").addEventListener("click", () => {
    if (state.storyIndex === storySteps.length - 1) {
      state.storyIndex = 0;
      showToast("Ты справилась! Зубик уже чувствует заботу.");
    } else {
      state.storyIndex += 1;
    }
    updateStory();
  });
}

function setupMap() {
  $$(".map-place").forEach((place) => {
    place.addEventListener("click", () => {
      const placeId = place.dataset.place;
      place.classList.add("open");
      state.openedPlaces.add(placeId);

      const secret = place.querySelector(".place-secret");
      if (secret) showToast(secret.textContent);

      if (state.openedPlaces.size === 5) {
        $("#mapComplete").classList.add("show");
        createSparkles(34);
      }
    });
  });
}

function moodClass(value) {
  if (value >= 80) return "happy";
  if (value >= 40) return "calm";
  return "sad";
}

function updateMood() {
  const tooth = $("#gameTooth");
  const mood = state.mood;
  tooth.classList.remove("sad", "calm", "happy");
  tooth.classList.add(moodClass(mood));
  tooth.setAttribute(
    "aria-label",
    mood >= 80 ? "Зубик счастлив" : mood >= 40 ? "Зубик спокоен" : "Зубик грустит"
  );
  $("#moodValue").textContent = `${mood}%`;
  $("#moodFill").style.width = `${mood}%`;
}

function setupGame() {
  $$(".item-button").forEach((button, index) => {
    button.addEventListener("click", () => {
      const item = button.dataset.item;
      if (state.usedItems.has(item) || state.mood >= 100) return;

      state.usedItems.add(item);
      state.mood = Math.min(100, state.mood + 20);
      button.disabled = true;
      updateMood();
      showToast(gamePhrases[index % gamePhrases.length]);
      $("#gameStatus").textContent = gamePhrases[index % gamePhrases.length];
      createLocalHeart(button);

      if (state.mood === 100) {
        $("#gameStatus").textContent = "Ура! Зубик получил много заботы и любви!";
        $("#gameFinale").classList.add("show");
        createSparkles(70);
      }
    });
  });
}

function createSparkles(amount) {
  for (let index = 0; index < amount; index += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "falling-sparkle";
    sparkle.textContent = index % 3 === 0 ? "⭐" : index % 3 === 1 ? "✦" : "♡";
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.animationDelay = `${Math.random() * 0.8}s`;
    sparkle.style.setProperty("--drift", `${Math.random() * 140 - 70}px`);
    sparkleLayer.appendChild(sparkle);
    sparkle.addEventListener("animationend", () => sparkle.remove());
  }
}

function createLocalHeart(source) {
  const rect = source.getBoundingClientRect();
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = "♡";
  heart.style.left = `${rect.left + rect.width / 2}px`;
  heart.style.top = `${rect.top + rect.height / 2}px`;
  document.body.appendChild(heart);
  heart.addEventListener("animationend", () => heart.remove());
}

function setupSupportWords() {
  $$(".support-card").forEach((card) => {
    card.addEventListener("click", () => {
      $$(".support-card").forEach((otherCard) => otherCard.classList.remove("active"));
      card.classList.add("active");
      showToast(card.textContent.trim());
      createLocalHeart(card);
    });
  });

  $("#moreKindness").addEventListener("click", () => {
    const phrase = supportPhrases[Math.floor(Math.random() * supportPhrases.length)];
    $("#randomPhrase").textContent = phrase;
    showToast(phrase);
    createSparkles(12);
  });

  $("#kindWordsButton").addEventListener("click", () => {
    showToast("Ты очень храбрая. Я рядом с тобой.");
    createSparkles(14);
  });
}

function setupMedal() {
  $("#showMedal").addEventListener("click", () => {
    $("#certificate").classList.add("show");
    $("#certificate").scrollIntoView({ behavior: "smooth", block: "center" });
    createSparkles(42);
  });

  $("#printMedal").addEventListener("click", () => {
    $("#certificate").classList.add("show");
    window.setTimeout(() => window.print(), 120);
  });

  $("#restartMission").addEventListener("click", () => {
    state.storyIndex = 0;
    state.openedPlaces.clear();
    state.mood = 0;
    state.usedItems.clear();
    updateStory();
    updateMood();
    $$(".map-place").forEach((place) => place.classList.remove("open"));
    $$(".item-button").forEach((button) => {
      button.disabled = false;
    });
    $("#mapComplete").classList.remove("show");
    $("#gameFinale").classList.remove("show");
    $("#certificate").classList.remove("show");
    $("#gameStatus").textContent = "Зубик ждёт немного заботы.";
    $("#top").scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("Миссия начинается снова!");
  });
}

function boot() {
  setupPhotoFallback();
  setupReveal();
  setupScrollButtons();
  setupStory();
  setupMap();
  setupGame();
  setupSupportWords();
  setupMedal();
  updateStory();
  updateMood();
}

document.addEventListener("DOMContentLoaded", boot);
