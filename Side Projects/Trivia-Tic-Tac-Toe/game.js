// ── DOM References ──────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const screens = {
  start:   $('#start-screen'),
  loading: $('#loading-screen'),
  quiz:    $('#quiz-screen'),
  reveal:  $('#reveal-screen'),
  game:    $('#game-screen'),
  end:     $('#end-screen'),
};

const els = {
  p1Name:         $('#p1-name'),
  p2Name:         $('#p2-name'),
  timerSelect:    $('#timer-select'),
  categorySelect: $('#category-select'),
  difficultySelect: $('#difficulty-select'),
  startBtn:       $('#start-btn'),
  setupForm:      $('#setup-form'),
  startError:     $('#start-error'),

  loadError:      $('#load-error'),
  loadErrorText:  $('#load-error-text'),
  retryLoadBtn:   $('#retry-load-btn'),

  quizProgress:   $('#quiz-progress'),
  quizTurn:       $('#quiz-turn'),
  quizTimer:      $('#quiz-timer'),
  quizQuestion:   $('#quiz-question'),
  quizAnswers:    $('#quiz-answers'),
  quizP1Score:    $('#quiz-p1-score'),
  quizP2Score:    $('#quiz-p2-score'),

  revealText:     $('#reveal-text'),
  revealSub:      $('#reveal-sub'),
  revealContinue: $('#reveal-continue'),

  gameP1Name:     $('#game-p1-name'),
  gameP1Mark:     $('#game-p1-mark'),
  gameP2Name:     $('#game-p2-name'),
  gameP2Mark:     $('#game-p2-mark'),
  gameP1Info:     $('#game-p1-info'),
  gameP2Info:     $('#game-p2-info'),
  turnIndicator:  $('#turn-indicator'),
  board:          $('#board'),
  cells:          $$('.cell'),

  questionModal:  $('#question-modal'),
  modalTurn:      $('#modal-turn'),
  modalTimer:     $('#modal-timer'),
  modalQuestion:  $('#modal-question'),
  modalAnswers:   $('#modal-answers'),

  scModal:        $('#second-chance-modal'),
  scText:         $('#second-chance-text'),
  scTimer:        $('#second-chance-timer'),
  scYes:          $('#sc-yes'),
  scNo:           $('#sc-no'),

  feedbackModal:  $('#feedback-modal'),
  feedbackIcon:   $('#feedback-icon'),
  feedbackText:   $('#feedback-text'),

  endResult:      $('#end-result'),
  playAgainBtn:   $('#play-again-btn'),
};

// ── Game State ──────────────────────────────────
let state = {
  p1: '', p2: '',
  timerDuration: 30,
  category: '',
  difficulty: 'easy',
  questions: [],       // pre-fetched question pool
  quizIndex: 0,
  quizScores: [0, 0],  // [p1, p2]
  firstPlayer: 0,      // 0 = p1, 1 = p2
  marks: ['X', 'O'],   // marks[0] = p1's mark, marks[1] = p2's mark
  board: Array(9).fill(null),
  currentPlayer: 0,    // 0 or 1
  gameOver: false,
  selectedCell: null,
  isSecondChance: false,
};

let timerInterval = null;
let scTimerInterval = null;
let fetchingMore = false;

// ── Utility ─────────────────────────────────────
function decodeHTML(html) {
  const ta = document.createElement('textarea');
  ta.innerHTML = html;
  return ta.value;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

function showModal(modal) { modal.classList.remove('hidden'); }
function hideModal(modal) { modal.classList.add('hidden'); }

function clearTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

function clearScTimer() {
  if (scTimerInterval) { clearInterval(scTimerInterval); scTimerInterval = null; }
}

function playerName(idx) { return idx === 0 ? state.p1 : state.p2; }
function opponentIdx(idx) { return idx === 0 ? 1 : 0; }

// ── Fetch Categories ────────────────────────────
async function loadCategories() {
  try {
    const res = await fetch('https://opentdb.com/api_category.php');
    const data = await res.json();
    data.trivia_categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      els.categorySelect.appendChild(opt);
    });
  } catch {
    // Silently fail — "Any" category still works
  }
}

// ── Fetch Questions ─────────────────────────────
function buildApiUrl(amount) {
  let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple&difficulty=${state.difficulty}`;
  if (state.category) url += `&category=${state.category}`;
  return url;
}

function parseQuestions(results) {
  return results.map(q => {
    const correct = decodeHTML(q.correct_answer);
    const answers = shuffleArray([correct, ...q.incorrect_answers.map(decodeHTML)]);
    return {
      question: decodeHTML(q.question),
      answers,
      correctIndex: answers.indexOf(correct),
    };
  });
}

async function fetchQuestions(amount) {
  const url = buildApiUrl(amount);
  const res = await fetch(url);
  const data = await res.json();
  if (data.response_code !== 0) {
    // Wait briefly and retry once
    await new Promise(r => setTimeout(r, 2000));
    const res2 = await fetch(url);
    const data2 = await res2.json();
    if (data2.response_code !== 0) {
      throw new Error(`Trivia API returned code ${data2.response_code}. There may not be enough questions for your selected options.`);
    }
    return parseQuestions(data2.results);
  }
  return parseQuestions(data.results);
}

async function fetchMoreIfNeeded() {
  const gameQuestionsLeft = state.questions.length;
  if (gameQuestionsLeft < 5 && !fetchingMore) {
    fetchingMore = true;
    try {
      const more = await fetchQuestions(15);
      state.questions.push(...more);
    } catch {
      // Silently fail — we'll try again later
    }
    fetchingMore = false;
  }
}

function takeQuestion() {
  if (state.questions.length === 0) return null;
  const q = state.questions.shift();
  fetchMoreIfNeeded();
  return q;
}

// ── Start Screen ────────────────────────────────
function validateNames() {
  const ok = els.p1Name.value.trim() && els.p2Name.value.trim();
  els.startBtn.disabled = !ok;
}

els.p1Name.addEventListener('input', validateNames);
els.p2Name.addEventListener('input', validateNames);

els.setupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  state.p1 = els.p1Name.value.trim();
  state.p2 = els.p2Name.value.trim();
  state.timerDuration = parseInt(els.timerSelect.value);
  state.category = els.categorySelect.value;
  state.difficulty = els.difficultySelect.value;
  state.questions = [];
  state.quizIndex = 0;
  state.quizScores = [0, 0];
  state.board = Array(9).fill(null);
  state.gameOver = false;
  state.isSecondChance = false;

  els.startError.classList.add('hidden');
  showScreen('loading');
  els.loadError.classList.add('hidden');

  try {
    const qs = await fetchQuestions(20);
    state.questions = qs;
    startQuiz();
  } catch (err) {
    showLoadError(err.message);
  }
});

function showLoadError(msg) {
  els.loadErrorText.textContent = msg || 'Failed to load questions. Check your connection.';
  els.loadError.classList.remove('hidden');
  $('.loader-wrap').style.display = 'none';
}

els.retryLoadBtn.addEventListener('click', async () => {
  els.loadError.classList.add('hidden');
  $('.loader-wrap').style.display = '';
  try {
    const qs = await fetchQuestions(20);
    state.questions = qs;
    startQuiz();
  } catch (err) {
    showLoadError(err.message);
  }
});

// ── Pre-Game Quiz ───────────────────────────────
function startQuiz() {
  state.quizIndex = 0;
  state.quizScores = [0, 0];
  showScreen('quiz');
  showQuizQuestion();
}

function quizCurrentPlayer() {
  // P1, P2, P1, P2, P1 → indices 0,1,0,1,0
  return state.quizIndex % 2 === 0 ? 0 : 1;
}

function showQuizQuestion() {
  const q = takeQuestion();
  if (!q) {
    showLoadError('Ran out of questions. Please retry.');
    showScreen('loading');
    return;
  }

  const pIdx = quizCurrentPlayer();
  els.quizProgress.textContent = `Question ${state.quizIndex + 1} / 5`;
  els.quizTurn.textContent = `${playerName(pIdx)}'s turn`;
  els.quizP1Score.textContent = `${state.p1}: ${state.quizScores[0]}`;
  els.quizP2Score.textContent = `${state.p2}: ${state.quizScores[1]}`;
  els.quizQuestion.textContent = q.question;

  els.quizAnswers.innerHTML = '';
  q.answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = ans;
    btn.addEventListener('click', () => handleQuizAnswer(i, q.correctIndex));
    els.quizAnswers.appendChild(btn);
  });

  startTimer(els.quizTimer, state.timerDuration, () => {
    disableAnswerButtons(els.quizAnswers);
    highlightCorrect(els.quizAnswers, q.correctIndex);
    setTimeout(advanceQuiz, 1200);
  });
}

function handleQuizAnswer(selected, correctIndex) {
  clearTimer();
  disableAnswerButtons(els.quizAnswers);

  const btns = els.quizAnswers.querySelectorAll('.answer-btn');
  if (selected === correctIndex) {
    btns[selected].classList.add('correct');
    state.quizScores[quizCurrentPlayer()]++;
  } else {
    btns[selected].classList.add('wrong');
    btns[correctIndex].classList.add('correct');
  }

  els.quizP1Score.textContent = `${state.p1}: ${state.quizScores[0]}`;
  els.quizP2Score.textContent = `${state.p2}: ${state.quizScores[1]}`;

  setTimeout(advanceQuiz, 1200);
}

function advanceQuiz() {
  state.quizIndex++;
  if (state.quizIndex < 5) {
    showQuizQuestion();
  } else {
    determineFirstPlayer();
  }
}

// ── Determine First Player & Marks ──────────────
function determineFirstPlayer() {
  if (state.quizScores[0] > state.quizScores[1]) {
    state.firstPlayer = 0;
  } else if (state.quizScores[1] > state.quizScores[0]) {
    state.firstPlayer = 1;
  } else {
    state.firstPlayer = Math.random() < 0.5 ? 0 : 1;
  }

  // Randomly assign X and O
  if (Math.random() < 0.5) {
    state.marks = ['X', 'O'];
  } else {
    state.marks = ['O', 'X'];
  }

  state.currentPlayer = state.firstPlayer;

  const name = playerName(state.firstPlayer);
  const mark = state.marks[state.firstPlayer];
  els.revealText.textContent = `${name} goes first!`;
  els.revealSub.textContent = `Playing as ${mark}`;

  showScreen('reveal');
}

els.revealContinue.addEventListener('click', startGame);

// ── Main Game ───────────────────────────────────
function startGame() {
  showScreen('game');
  renderBoard();
  updateGameHeader();
}

function updateGameHeader() {
  els.gameP1Name.textContent = state.p1;
  els.gameP1Mark.textContent = state.marks[0];
  els.gameP1Mark.className = `player-mark ${state.marks[0].toLowerCase()}`;
  els.gameP2Name.textContent = state.p2;
  els.gameP2Mark.textContent = state.marks[1];
  els.gameP2Mark.className = `player-mark ${state.marks[1].toLowerCase()}`;

  els.gameP1Info.classList.toggle('active-turn', state.currentPlayer === 0);
  els.gameP2Info.classList.toggle('active-turn', state.currentPlayer === 1);
  els.turnIndicator.textContent = `${playerName(state.currentPlayer)}'s turn`;
}

function renderBoard() {
  els.cells.forEach((cell, i) => {
    cell.textContent = state.board[i] || '';
    cell.className = 'cell';
    if (state.board[i]) {
      cell.classList.add(state.board[i].toLowerCase());
      cell.disabled = true;
    } else {
      cell.disabled = state.gameOver;
    }
  });
}

els.cells.forEach(cell => {
  cell.addEventListener('click', () => {
    const idx = parseInt(cell.dataset.index);
    if (state.board[idx] || state.gameOver) return;
    state.selectedCell = idx;
    state.isSecondChance = false;
    showQuestionModal();
  });
});

// ── Question Modal ──────────────────────────────
function showQuestionModal() {
  const q = takeQuestion();
  if (!q) {
    // Out of questions — place mark without question
    placeMark(state.selectedCell);
    return;
  }

  els.modalTurn.textContent = `${playerName(state.currentPlayer)}, answer to claim the square!`;
  els.modalQuestion.textContent = q.question;
  els.modalAnswers.innerHTML = '';

  q.answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = ans;
    btn.addEventListener('click', () => handleGameAnswer(i, q.correctIndex));
    els.modalAnswers.appendChild(btn);
  });

  showModal(els.questionModal);

  startTimer(els.modalTimer, state.timerDuration, () => {
    disableAnswerButtons(els.modalAnswers);
    highlightCorrect(els.modalAnswers, q.correctIndex);
    showFeedback(false, 'Time\'s up!');
    setTimeout(() => {
      hideModal(els.questionModal);
      promptSecondChance();
    }, 1200);
  });
}

function handleGameAnswer(selected, correctIndex) {
  clearTimer();
  disableAnswerButtons(els.modalAnswers);

  const btns = els.modalAnswers.querySelectorAll('.answer-btn');

  if (selected === correctIndex) {
    btns[selected].classList.add('correct');
    showFeedback(true, 'Correct!');
    setTimeout(() => {
      hideModal(els.questionModal);
      placeMark(state.selectedCell);
    }, 1000);
  } else {
    btns[selected].classList.add('wrong');
    btns[correctIndex].classList.add('correct');
    showFeedback(false, 'Wrong answer!');
    setTimeout(() => {
      hideModal(els.questionModal);
      promptSecondChance();
    }, 1200);
  }
}

function showFeedback(correct, msg) {
  els.feedbackIcon.textContent = correct ? '\u2713' : '\u2717';
  els.feedbackIcon.style.color = correct ? 'var(--success)' : 'var(--danger)';
  els.feedbackText.textContent = msg;
  showModal(els.feedbackModal);
  setTimeout(() => hideModal(els.feedbackModal), 1000);
}

// ── Second Chance ───────────────────────────────
function promptSecondChance() {
  const opp = opponentIdx(state.currentPlayer);
  const cur = state.currentPlayer;
  els.scText.textContent = `${playerName(opp)}, give ${playerName(cur)} another chance?`;

  showModal(els.scModal);
  let secondsLeft = 5;
  els.scTimer.textContent = secondsLeft;
  els.scTimer.classList.remove('danger');

  clearScTimer();
  scTimerInterval = setInterval(() => {
    secondsLeft--;
    els.scTimer.textContent = secondsLeft;
    if (secondsLeft <= 3) els.scTimer.classList.add('danger');
    if (secondsLeft <= 0) {
      clearScTimer();
      handleSecondChanceResponse(false);
    }
  }, 1000);

  els.scYes.onclick = () => { clearScTimer(); handleSecondChanceResponse(true); };
  els.scNo.onclick  = () => { clearScTimer(); handleSecondChanceResponse(false); };
}

function handleSecondChanceResponse(yes) {
  hideModal(els.scModal);
  if (yes) {
    state.isSecondChance = true;
    showQuestionModal(); // same player, same cell, new question
  } else {
    // Turn passes, no mark placed
    state.currentPlayer = opponentIdx(state.currentPlayer);
    updateGameHeader();
  }
}

// ── Place Mark & Win Detection ──────────────────
function placeMark(cellIdx) {
  const mark = state.marks[state.currentPlayer];
  state.board[cellIdx] = mark;
  renderBoard();

  const winLine = checkWin(mark);
  if (winLine) {
    highlightWin(winLine);
    state.gameOver = true;
    renderBoard(); // disable cells
    // Re-highlight after renderBoard clears classes
    highlightWin(winLine);
    setTimeout(() => showEnd(`${playerName(state.currentPlayer)} wins!`), 1200);
    return;
  }

  if (state.board.every(c => c !== null)) {
    state.gameOver = true;
    setTimeout(() => showEnd("It's a draw!"), 800);
    return;
  }

  state.currentPlayer = opponentIdx(state.currentPlayer);
  updateGameHeader();
}

const WIN_LINES = [
  [0,1,2], [3,4,5], [6,7,8], // rows
  [0,3,6], [1,4,7], [2,5,8], // cols
  [0,4,8], [2,4,6],           // diagonals
];

function checkWin(mark) {
  for (const line of WIN_LINES) {
    if (line.every(i => state.board[i] === mark)) return line;
  }
  return null;
}

function highlightWin(line) {
  line.forEach(i => els.cells[i].classList.add('win-cell'));
}

// ── End Screen ──────────────────────────────────
function showEnd(msg) {
  els.endResult.textContent = msg;
  showScreen('end');
}

els.playAgainBtn.addEventListener('click', () => {
  // Return to start with names pre-filled
  showScreen('start');
});

// ── Timer Helper ────────────────────────────────
function startTimer(timerEl, duration, onExpire) {
  clearTimer();
  let secondsLeft = duration;
  timerEl.textContent = secondsLeft;
  timerEl.classList.remove('danger');

  timerInterval = setInterval(() => {
    secondsLeft--;
    timerEl.textContent = secondsLeft;
    if (secondsLeft <= 10) timerEl.classList.add('danger');
    if (secondsLeft <= 0) {
      clearTimer();
      onExpire();
    }
  }, 1000);
}

function disableAnswerButtons(container) {
  container.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
}

function highlightCorrect(container, correctIndex) {
  const btns = container.querySelectorAll('.answer-btn');
  btns[correctIndex].classList.add('correct');
}

// ── Init ────────────────────────────────────────
loadCategories();
