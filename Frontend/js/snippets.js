// snippets.js — loads the snippet dataset and resolves today's puzzle

// Language "families" used for close-guess feedback (amber tile).
// Guessing a language in the same family as the answer is closer than
// a totally unrelated guess, but still not correct.
const LANGUAGE_FAMILIES = {
  "C-style":      ["C", "C++", "C#", "Java", "Kotlin", "Go", "Rust", "Swift", "Objective-C"],
  "Scripting":    ["Python", "Ruby", "Perl", "Lua", "PHP", "JavaScript", "TypeScript", "Dart"],
  "Functional":   ["Haskell", "Elixir", "Clojure", "Scala", "Julia"],
  "Shell":        ["Bash", "PowerShell"],
  "Data/Markup":  ["SQL", "HTML", "CSS", "MATLAB", "R"],
  "Low-level":    ["Assembly"]
};

// Full list of guessable languages, derived from the families above.
const ALL_LANGUAGES = Object.values(LANGUAGE_FAMILIES).flat().sort();

function familyOf(language) {
  for (const [family, langs] of Object.entries(LANGUAGE_FAMILIES)) {
    if (langs.includes(language)) return family;
  }
  return null;
}

async function loadSnippets() {
  const res = await fetch("data/snippets.json");
  if (!res.ok) throw new Error("Could not load snippet data");
  return res.json();
}

// Deterministic "day number" since a fixed epoch, so every player sees
// the same puzzle on the same calendar day (their local time).
function dayNumber(date = new Date()) {
  const epoch = new Date(2026, 0, 1); // Jan 1 2026 = day 0
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((date.setHours(0, 0, 0, 0) - epoch.setHours(0, 0, 0, 0)) / msPerDay);
}

function getDailySnippet(snippets, date = new Date()) {
  const idx = ((dayNumber(date) % snippets.length) + snippets.length) % snippets.length;
  return snippets[idx];
}