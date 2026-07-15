// game.js — core rules: evaluating guesses and building the share grid

const MAX_GUESSES = 6;

// Returns "correct" | "close" | "wrong"
function evaluateGuess(guess, answer) {
  if (guess === answer) return "correct";
  if (familyOf(guess) && familyOf(guess) === familyOf(answer)) return "close";
  return "wrong";
}

function createGameState(snippet, dayNum) {
  return {
    dayNum,
    snippetId: snippet.id,
    answer: snippet.language,
    guesses: [],       // [{ text, result }]
    status: "playing"  // "playing" | "won" | "lost"
  };
}

function applyGuess(state, guessText) {
  if (state.status !== "playing") return state;

  const result = evaluateGuess(guessText, state.answer);
  state.guesses.push({ text: guessText, result });

  if (result === "correct") {
    state.status = "won";
  } else if (state.guesses.length >= MAX_GUESSES) {
    state.status = "lost";
  }
  return state;
}

const RESULT_EMOJI = { correct: "🟩", close: "🟨", wrong: "⬛" };

function buildShareText(state, dayNum) {
  const rows = state.guesses.map(g => RESULT_EMOJI[g.result]).join("\n");
  const guessLabel = state.status === "won" ? `${state.guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  return `Snippedle #${dayNum} ${guessLabel}\n${rows}`;
}