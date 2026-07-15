// app.js — entry point: wires DOM, rendering, and game flow together

let snippets = [];
let dayNum = 0;
let state = null;

const els = {
  filename: document.getElementById("filename"),
  codeBlock: document.getElementById("code-block"),
  guessForm: document.getElementById("guess-form"),
  guessInput: document.getElementById("guess-input"),
  guessList: document.getElementById("guess-history"),
  languageOptions: document.getElementById("language-options"),
  remaining: document.getElementById("remaining-count"),
  resultPanel: document.getElementById("result-panel"),
  resultTitle: document.getElementById("result-title"),
  resultSub: document.getElementById("result-sub"),
  shareBtn: document.getElementById("share-btn"),
  statsBtn: document.getElementById("stats-btn"),
  statsPanel: document.getElementById("stats-panel"),
  statsClose: document.getElementById("stats-close"),
  statPlayed: document.getElementById("stat-played"),
  statWinPct: document.getElementById("stat-winpct"),
  statStreak: document.getElementById("stat-streak"),
  statMaxStreak: document.getElementById("stat-maxstreak"),
};

init();

async function init() {
  snippets = await loadSnippets();
  dayNum = dayNumber();
  const snippet = getDailySnippet(snippets, new Date());

  const saved = loadDayState(dayNum);
  state = saved && saved.snippetId === snippet.id ? saved : createGameState(snippet, dayNum);

  populateLanguageOptions();
  renderSnippet(snippet);
  renderGuessHistory();
  updateRemaining();

  if (state.status !== "playing") {
    showResultPanel();
  }

  els.guessForm.addEventListener("submit", onSubmitGuess);
  els.shareBtn.addEventListener("click", onShare);
  els.statsBtn.addEventListener("click", () => els.statsPanel.classList.remove("hidden"));
  els.statsClose.addEventListener("click", () => els.statsPanel.classList.add("hidden"));
}

function populateLanguageOptions() {
  els.languageOptions.innerHTML = ALL_LANGUAGES
    .map(lang => `<option value="${lang}"></option>`)
    .join("");
}

function renderSnippet(snippet) {
  els.filename.textContent = `mystery.${"?".repeat(3)}`;
  const lines = snippet.code.split("\n");
  els.codeBlock.innerHTML = lines
    .map((line, i) => `<span class="line-num">${i + 1}</span><code>${escapeHtml(line) || " "}</code>`)
    .join("\n");
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function onSubmitGuess(e) {
  e.preventDefault();
  if (state.status !== "playing") return;

  const raw = els.guessInput.value.trim();
  if (!raw) return;

  const match = ALL_LANGUAGES.find(l => l.toLowerCase() === raw.toLowerCase());
  if (!match) {
    els.guessInput.classList.add("shake");
    setTimeout(() => els.guessInput.classList.remove("shake"), 400);
    return;
  }

  applyGuess(state, match);
  saveDayState(dayNum, state);
  els.guessInput.value = "";

  renderGuessHistory();
  updateRemaining();

  if (state.status !== "playing") {
    const stats = recordResult({
      won: state.status === "won",
      guessCount: state.guesses.length,
      dayNum
    });
    showResultPanel(stats);
  }
}

function renderGuessHistory() {
  els.guessList.innerHTML = state.guesses
    .map(g => `<li class="guess-row guess-${g.result}"><span class="dot"></span>${g.text}</li>`)
    .join("");
}

function updateRemaining() {
  const left = MAX_GUESSES - state.guesses.length;
  els.remaining.textContent = state.status === "playing"
    ? `${left} guess${left === 1 ? "" : "es"} left`
    : "";
  els.guessInput.disabled = state.status !== "playing";
  els.guessForm.querySelector("button").disabled = state.status !== "playing";
}

function showResultPanel(stats = loadStats()) {
  const won = state.status === "won";
  els.resultPanel.classList.remove("hidden");
  els.resultPanel.classList.toggle("won", won);
  els.resultTitle.textContent = won ? "Solved it!" : "Out of guesses";
  els.resultSub.textContent = won
    ? `It was ${state.answer}, in ${state.guesses.length}/${MAX_GUESSES}.`
    : `The answer was ${state.answer}.`;

  els.statPlayed.textContent = stats.played;
  els.statWinPct.textContent = stats.played ? Math.round((stats.wins / stats.played) * 100) + "%" : "0%";
  els.statStreak.textContent = stats.currentStreak;
  els.statMaxStreak.textContent = stats.maxStreak;
}

async function onShare() {
  const text = buildShareText(state, dayNum);
  try {
    await navigator.clipboard.writeText(text);
    els.shareBtn.textContent = "Copied!";
    setTimeout(() => (els.shareBtn.textContent = "Share result"), 1500);
  } catch {
    alert(text);
  }
}