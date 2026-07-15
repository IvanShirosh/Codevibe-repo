// storage.js — localStorage helpers for streak, stats, and daily state

const STORAGE_KEY = "snippedle_stats_v1";
const STATE_KEY_PREFIX = "snippedle_state_";

function defaultStats() {
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastWinDay: null, // day number of last successful puzzle
    guessDistribution: [0, 0, 0, 0, 0, 0] // index 0 = won in 1 guess, etc.
  };
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultStats();
  } catch {
    return defaultStats();
  }
}

function saveStats(stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function recordResult({ won, guessCount, dayNum }) {
  const stats = loadStats();
  stats.played += 1;

  if (won) {
    stats.wins += 1;
    stats.guessDistribution[guessCount - 1] += 1;

    if (stats.lastWinDay === dayNum - 1) {
      stats.currentStreak += 1;
    } else {
      stats.currentStreak = 1;
    }
    stats.lastWinDay = dayNum;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }

  saveStats(stats);
  return stats;
}

// Per-day game state, so a reload mid-puzzle doesn't lose progress
// and a completed puzzle can't be replayed for a fresh streak count.
function loadDayState(dayNum) {
  try {
    const raw = localStorage.getItem(STATE_KEY_PREFIX + dayNum);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDayState(dayNum, state) {
  localStorage.setItem(STATE_KEY_PREFIX + dayNum, JSON.stringify(state));
}