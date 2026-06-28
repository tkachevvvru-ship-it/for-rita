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

const catchEmojis = ["⭐", "♡", "✦", "🌸", "🦋", "🍭", "🌈", "💎"];

const musicNotes = [
  { note: "C", freq: 523.25, emoji: "🌸", label: "Цветочек" },
  { note: "D", freq: 587.33, emoji: "🌞", label: "Солнышко" },
  { note: "E", freq: 659.25, emoji: "⭐", label: "Звёздочка" },
  { note: "F", freq: 698.46, emoji: "🦋", label: "Бабочка" },
  { note: "G", freq: 783.99, emoji: "🌈", label: "Радуга" },
  { note: "A", freq: 880.00, emoji: "💎", label: "Бриллик" },
  { note: "B", freq: 987.77, emoji: "🎀", label: "Бантик" },
  { note: "C2", freq: 1046.50, emoji: "💖", label: "Сердечко" },
];

const buildParts = [
  { id: "eye-left", emoji: "👀", label: "Глазки" },
  { id: "eye-right", emoji: "👀", label: "Глазки" },
  { id: "mouth", emoji: "👄", label: "Ротик" },
  { id: "cheek-left", emoji: "🌸", label: "Щёчка" },
  { id: "cheek-right", emoji: "🌸", label: "Щёчка" },
];

const coloringColors = [
  "#ff6eb8", "#ff9f5e", "#ffd55e", "#5ee8a5",
  "#5ec8ff", "#b88aff", "#ff6b6b", "#c4ff6b",
];

const state = {
  storyIndex: 0,
  openedPlaces: new Set(),
  mood: 0,
  usedItems: new Set(),
  coloring: { color: "#ff6eb8" },
  catch: { score: 0, active: false, timer: null, timeLeft: 30 },
  build: { filled: new Set() },
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

function replayClass(element, className, duration = 700) {
  if (!element) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  window.setTimeout(() => element.classList.remove(className), duration);
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
    { threshold: 0.1 }
  );

  $$(".reveal").forEach((section) => observer.observe(section));
}

function setupParallax() {
  const clouds = $$(".cloud");
  const twinkles = $$(".twinkle");
  if (!clouds.length) return;

  let ticking = false;
  window.addEventListener("mousemove", (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      clouds.forEach((c, i) => {
        const speed = (i + 1) * 8;
        c.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
      twinkles.forEach((t, i) => {
        const speed = (i + 1) * 4;
        t.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
      ticking = false;
    });
  });
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
      replayClass(place, "pressed", 580);
      state.openedPlaces.add(placeId);

      const secret = place.querySelector(".place-secret");
      if (secret) showToast(secret.textContent);
      createBurst(place, ["✦", "⭐", "♡", "✧"], 18);
      createLocalHeart(place);

      if (state.openedPlaces.size === 5) {
        $("#mapComplete").classList.add("show");
        createSparkles(50);
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
      button.classList.add("used");
      replayClass(button, "item-pop", 640);
      replayClass($("#gameTooth"), "care-pop", 640);
      replayClass($(".game-shell"), "magic-active", 700);
      replayClass($("#moodFill"), "meter-pop", 580);
      button.disabled = true;
      updateMood();
      showToast(gamePhrases[index % gamePhrases.length]);
      $("#gameStatus").textContent = gamePhrases[index % gamePhrases.length];
      createLocalHeart(button);
      createBurst(button, ["♡", "⭐", "✦", "💧"], 18);

      if (state.mood === 100) {
        $("#gameStatus").textContent = "Ура! Зубик получил много заботы и любви!";
        $("#gameFinale").classList.add("show");
        createBurst($("#gameTooth"), ["⭐", "♡", "✦", "✨"], 34);
        createSparkles(90);
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

function createBurst(source, icons = ["✦", "♡", "⭐"], amount = 14) {
  const rect = source.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let index = 0; index < amount; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / amount + Math.random() * 0.45;
    const distance = 48 + Math.random() * 58;

    particle.className = "burst-particle";
    particle.textContent = icons[index % icons.length];
    particle.style.setProperty("--x", `${centerX}px`);
    particle.style.setProperty("--y", `${centerY}px`);
    particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--spin", `${Math.random() * 260 - 130}deg`);
    particle.style.setProperty("--size", `${18 + Math.random() * 16}px`);

    document.body.appendChild(particle);
    particle.addEventListener("animationend", () => particle.remove());
  }
}

function setupSupportWords() {
  $$(".support-card").forEach((card) => {
    card.addEventListener("click", () => {
      $$(".support-card").forEach((otherCard) => otherCard.classList.remove("active"));
      card.classList.add("active");
      replayClass(card, "celebrate", 780);
      showToast(card.textContent.trim());
      createLocalHeart(card);
      createBurst(card, ["♡", "💖", "✦", "⭐"], 22);
      createSparkles(18);
    });
  });

  $("#moreKindness").addEventListener("click", () => {
    const phrase = supportPhrases[Math.floor(Math.random() * supportPhrases.length)];
    $("#randomPhrase").textContent = phrase;
    showToast(phrase);
    replayClass($(".random-kind"), "celebrate", 780);
    createBurst($("#moreKindness"), ["♡", "💖", "✦", "⭐"], 24);
    createSparkles(34);
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
    state.build.filled.clear();
    updateStory();
    updateMood();
    $$(".map-place").forEach((place) => place.classList.remove("open"));
    $$(".item-button").forEach((button) => {
      button.disabled = false;
      button.classList.remove("used", "item-pop");
    });
    $("#mapComplete").classList.remove("show");
    $("#gameFinale").classList.remove("show");
    $("#certificate").classList.remove("show");
    $("#gameStatus").textContent = "Зубик ждёт немного заботы.";
    $("#top").scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("Миссия начинается снова!");
    resetColoring();
    resetCatch();
    resetBuild();
  });
}

// ===== COLORING GAME =====
function setupColoring() {
  const paletteColors = $$(".palette-color");
  paletteColors.forEach((btn) => {
    btn.addEventListener("click", () => {
      paletteColors.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      state.coloring.color = btn.dataset.color;
    });
  });

  $$(".coloring-svg .tooth-part").forEach((part) => {
    part.addEventListener("click", () => {
      part.style.fill = state.coloring.color;
      part.classList.add("filled");
      replayClass(part, "filled", 400);
      createBurst(part, ["🎨", "✨", "⭐"], 8);
    });
  });

  const resetBtn = $("#coloringReset");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetColoring);
  }
}

function resetColoring() {
  $$(".coloring-svg .tooth-part").forEach((part) => {
    part.style.fill = "#fff";
    part.classList.remove("filled");
  });
}

// ===== CATCH GAME =====
function setupCatch() {
  const startBtn = $("#catchStart");
  if (!startBtn) return;

  startBtn.addEventListener("click", startCatchGame);

  const field = $("#catchField");
  if (field) {
    field.addEventListener("click", (e) => {
      const item = e.target.closest(".catch-item");
      if (!item || item.classList.contains("caught")) return;
      catchItem(item);
    });
    field.addEventListener("touchstart", (e) => {
      const item = e.target.closest(".catch-item");
      if (!item || item.classList.contains("caught")) return;
      e.preventDefault();
      catchItem(item);
    }, { passive: false });
  }
}

function startCatchGame() {
  state.catch.score = 0;
  state.catch.active = true;
  state.catch.timeLeft = 30;

  const scoreEl = $("#catchScore");
  const timeEl = $("#catchTime");
  const resultEl = $("#catchResult");
  const startBtn = $("#catchStart");

  if (scoreEl) scoreEl.textContent = "0";
  if (timeEl) timeEl.textContent = "30";
  if (resultEl) resultEl.classList.remove("show");
  if (startBtn) startBtn.disabled = true;

  const field = $("#catchField");
  if (field) field.innerHTML = "";

  spawnCatchItems();

  state.catch.timer = setInterval(() => {
    state.catch.timeLeft--;
    if (timeEl) timeEl.textContent = state.catch.timeLeft;

    if (state.catch.timeLeft <= 0) {
      endCatchGame();
    }
  }, 1000);
}

function spawnCatchItems() {
  if (!state.catch.active) return;

  const field = $("#catchField");
  if (!field) return;

  const item = document.createElement("span");
  item.className = "catch-item";
  item.textContent = catchEmojis[Math.floor(Math.random() * catchEmojis.length)];
  item.style.left = `${10 + Math.random() * 80}%`;
  item.style.animationDuration = `${2.5 + Math.random() * 2}s`;
  item.style.fontSize = `${28 + Math.random() * 20}px`;

  field.appendChild(item);
  item.addEventListener("animationend", () => item.remove());

  if (state.catch.active) {
    setTimeout(spawnCatchItems, 400 + Math.random() * 600);
  }
}

function catchItem(item) {
  item.classList.add("caught");
  state.catch.score++;
  const scoreEl = $("#catchScore");
  if (scoreEl) scoreEl.textContent = state.catch.score;

  createBurst(item, ["⭐", "✨", "💖"], 6);

  setTimeout(() => item.remove(), 300);
}

function endCatchGame() {
  state.catch.active = false;
  clearInterval(state.catch.timer);

  const startBtn = $("#catchStart");
  const resultEl = $("#catchResult");
  const resultText = $("#catchResultText");

  if (startBtn) startBtn.disabled = false;

  const score = state.catch.score;
  let msg;
  if (score >= 25) msg = `Ух ты! ${score} звёздочек! Ты настоящая волшебница! 🌟`;
  else if (score >= 15) msg = `${score} звёздочек! Какая ловкая ручка! ⭐`;
  else if (score >= 8) msg = `${score} звёздочек! Молодец! ✨`;
  else msg = `${score} звёздочек! Попробуй ещё раз! 💪`;

  if (resultText) resultText.textContent = msg;
  if (resultEl) resultEl.classList.add("show");
  showToast(msg);
  createSparkles(30);
}

function resetCatch() {
  state.catch.active = false;
  state.catch.score = 0;
  state.catch.timeLeft = 30;
  clearInterval(state.catch.timer);

  const scoreEl = $("#catchScore");
  const timeEl = $("#catchTime");
  const resultEl = $("#catchResult");

  if (scoreEl) scoreEl.textContent = "0";
  if (timeEl) timeEl.textContent = "30";
  if (resultEl) resultEl.classList.remove("show");

  const field = $("#catchField");
  if (field) field.innerHTML = "";
}

// ===== MUSIC GAME =====
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playNote(freq, duration = 0.4) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function setupMusic() {
  $$(".music-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const noteData = musicNotes.find((n) => n.note === btn.dataset.note);
      if (!noteData) return;

      playNote(noteData.freq);
      replayClass(btn, "playing", 500);
      createBurst(btn, ["🎵", "🎶", "✨", noteData.emoji], 10);
      showToast(`${noteData.emoji} ${noteData.label}!`);
    });

    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      btn.click();
    }, { passive: false });
  });
}

// ===== BUILD SMILE GAME =====
function setupBuild() {
  let draggedPart = null;

  $$(".build-part").forEach((part) => {
    part.addEventListener("click", () => {
      if (part.classList.contains("used")) return;
      selectBuildPart(part);
    });

    part.addEventListener("dragstart", (e) => {
      if (part.classList.contains("used")) return;
      draggedPart = part;
      part.classList.add("dragging");
      e.dataTransfer.setData("text/plain", part.dataset.part);
    });

    part.addEventListener("dragend", () => {
      part.classList.remove("dragging");
      draggedPart = null;
    });

    part.addEventListener("touchstart", (e) => {
      if (part.classList.contains("used")) return;
      e.preventDefault();
      selectBuildPart(part);
    }, { passive: false });
  });

  $$(".build-slot").forEach((slot) => {
    slot.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!slot.classList.contains("filled")) {
        slot.classList.add("highlight");
      }
    });

    slot.addEventListener("dragleave", () => {
      slot.classList.remove("highlight");
    });

    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      slot.classList.remove("highlight");
      const partId = e.dataTransfer.getData("text/plain");
      if (partId === slot.dataset.slot && !slot.classList.contains("filled")) {
        fillBuildSlot(slot, partId);
      }
    });

    slot.addEventListener("click", () => {
      if (slot.classList.contains("filled")) return;
      if (draggedPart) {
        const partId = draggedPart.dataset.part;
        if (partId === slot.dataset.slot) {
          fillBuildSlot(slot, partId);
          draggedPart.classList.add("used");
          draggedPart = null;
        }
      }
    });
  });

  const resetBtn = $("#buildReset");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetBuild);
  }
}

let selectedBuildPart = null;

function selectBuildPart(part) {
  $$(".build-part").forEach((p) => p.classList.remove("selected"));
  part.classList.add("selected");
  selectedBuildPart = part;

  const partId = part.dataset.part;
  $$(`.build-slot[data-slot="${partId}"]`).forEach((slot) => {
    if (!slot.classList.contains("filled")) {
      slot.classList.add("highlight");
    }
  });

  setTimeout(() => {
    $$(".build-slot").forEach((s) => s.classList.remove("highlight"));
  }, 2000);

  const slot = $(`.build-slot[data-slot="${partId}"]`);
  if (slot && !slot.classList.contains("filled")) {
    fillBuildSlot(slot, partId);
    part.classList.add("used");
    selectedBuildPart = null;
  }
}

function fillBuildSlot(slot, partId) {
  slot.classList.add("filled");
  slot.classList.remove("highlight");

  const partData = buildParts.find((p) => p.id === partId);
  if (partData) {
    slot.innerHTML = `<span class="slot-emoji">${partData.emoji}</span>`;
  }

  state.build.filled.add(partId);
  replayClass(slot, "filled", 400);
  createBurst(slot, ["✨", "⭐", "💖"], 8);

  updateBuildProgress();

  if (state.build.filled.size === buildParts.length) {
    setTimeout(() => {
      const celebration = $("#buildCelebration");
      if (celebration) celebration.classList.add("show");
      showToast("Ура! Улыбка собрана! 🎉");
      createSparkles(60);
    }, 400);
  }
}

function updateBuildProgress() {
  $$(".build-progress-dot").forEach((dot, i) => {
    if (i < state.build.filled.size) {
      dot.classList.add("filled");
    } else {
      dot.classList.remove("filled");
    }
  });
}

function resetBuild() {
  state.build.filled.clear();
  selectedBuildPart = null;

  $$(".build-slot").forEach((slot) => {
    slot.classList.remove("filled", "highlight");
    slot.innerHTML = "";
  });

  $$(".build-part").forEach((part) => {
    part.classList.remove("used", "selected", "dragging");
  });

  $$(".build-progress-dot").forEach((dot) => {
    dot.classList.remove("filled");
  });

  const celebration = $("#buildCelebration");
  if (celebration) celebration.classList.remove("show");
}

function boot() {
  setupPhotoFallback();
  setupReveal();
  setupParallax();
  setupScrollButtons();
  setupStory();
  setupMap();
  setupGame();
  setupSupportWords();
  setupMedal();
  setupColoring();
  setupCatch();
  setupMusic();
  setupBuild();
  updateStory();
  updateMood();
}

document.addEventListener("DOMContentLoaded", boot);
