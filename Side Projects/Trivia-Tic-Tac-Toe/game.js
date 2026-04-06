// ── DOM References ──────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const screens = {
  start:       $('#start-screen'),
  leaderboard: $('#leaderboard-screen'),
  loading:     $('#loading-screen'),
  quiz:        $('#quiz-screen'),
  reveal:      $('#reveal-screen'),
  game:        $('#game-screen'),
  end:         $('#end-screen'),
};

const els = {
  playerCountSelect: $('#player-count-select'),
  p1Name:         $('#p1-name'),
  p2Name:         $('#p2-name'),
  p3Wrap:         $('#p3-wrap'),
  p3Name:         $('#p3-name'),
  timerSelect:    $('#timer-select'),
  categorySelect: $('#category-select'),
  difficultySelect: $('#difficulty-select'),
  startBtn:       $('#start-btn'),
  setupForm:      $('#setup-form'),
  startError:     $('#start-error'),
  leaderboardBtn: $('#leaderboard-btn'),

  lbBody:         $('#lb-body'),
  lbTable:        $('#lb-table'),
  lbEmpty:        $('#lb-empty'),
  lbBackBtn:      $('#lb-back-btn'),
  lbClearBtn:     $('#lb-clear-btn'),

  loadError:      $('#load-error'),
  loadErrorText:  $('#load-error-text'),
  retryLoadBtn:   $('#retry-load-btn'),

  categoryNotice: $('#category-notice'),

  quizProgress:   $('#quiz-progress'),
  quizTurn:       $('#quiz-turn'),
  quizTimer:      $('#quiz-timer'),
  quizQuestion:   $('#quiz-question'),
  quizAnswers:    $('#quiz-answers'),
  quizScores:     $('#quiz-scores'),

  revealText:     $('#reveal-text'),
  revealSub:      $('#reveal-sub'),
  revealContinue: $('#reveal-continue'),

  gameHeader:     $('#game-header'),
  board:          $('#board'),

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
const MARKS_2P = ['X', 'O'];
const MARKS_3P = ['X', 'O', '\u25B3']; // △

let state = {
  playerCount: 2,
  players: [],        // [{ name, mark }]
  timerDuration: 30,
  category: '',
  difficulty: 'easy',
  questions: [],
  quizIndex: 0,
  quizScores: [],
  quizTotal: 5,
  firstPlayer: 0,
  boardSize: 3,
  winLength: 3,
  board: [],
  currentPlayer: 0,
  gameOver: false,
  selectedCell: null,
  isSecondChance: false,
  categoryFellBack: false,
};

let timerInterval = null;
let scTimerInterval = null;
let fetchingMore = false;
let WIN_LINES = [];

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

function playerName(idx) { return state.players[idx].name; }
function nextPlayerIdx(idx) { return (idx + 1) % state.playerCount; }
function markClass(mark) {
  if (mark === 'X') return 'x';
  if (mark === 'O') return 'o';
  return 't'; // △
}

// ── Win Line Generation ─────────────────────────
function generateWinLines(size, winLen) {
  const lines = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - winLen; c++) {
      lines.push(Array.from({ length: winLen }, (_, k) => r * size + c + k));
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - winLen; r++) {
      lines.push(Array.from({ length: winLen }, (_, k) => (r + k) * size + c));
    }
  }
  for (let r = 0; r <= size - winLen; r++) {
    for (let c = 0; c <= size - winLen; c++) {
      lines.push(Array.from({ length: winLen }, (_, k) => (r + k) * size + (c + k)));
      lines.push(Array.from({ length: winLen }, (_, k) => (r + k) * size + (c + winLen - 1 - k)));
    }
  }
  return lines;
}

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
    // "Any" category still works
  }
}

// ── Fetch Questions ─────────────────────────────
function buildApiUrl(amount, category) {
  let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple&difficulty=${state.difficulty}`;
  if (category) url += `&category=${category}`;
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

function showCategoryNotice(msg) {
  els.categoryNotice.textContent = msg;
  els.categoryNotice.classList.remove('hidden');
  setTimeout(() => els.categoryNotice.classList.add('hidden'), 4000);
}

async function fetchQuestions(amount) {
  const url = buildApiUrl(amount, state.category);
  const res = await fetch(url);
  const data = await res.json();

  if (data.response_code !== 0) {
    // Retry once with same params
    await new Promise(r => setTimeout(r, 2000));
    const res2 = await fetch(url);
    const data2 = await res2.json();

    if (data2.response_code !== 0 && state.category) {
      // Fall back to any category
      state.categoryFellBack = true;
      const fallbackUrl = buildApiUrl(amount, '');
      const res3 = await fetch(fallbackUrl);
      const data3 = await res3.json();
      if (data3.response_code !== 0) {
        throw new Error('Unable to load trivia questions. Please try again.');
      }
      showCategoryNotice('Not enough questions in that category \u2014 using mixed categories instead.');
      return parseQuestions(data3.results);
    }

    if (data2.response_code !== 0) {
      throw new Error('Unable to load trivia questions. Please try again.');
    }
    return parseQuestions(data2.results);
  }
  return parseQuestions(data.results);
}

async function fetchMoreIfNeeded() {
  if (state.questions.length < 8 && !fetchingMore) {
    fetchingMore = true;
    try {
      const more = await fetchQuestions(15);
      state.questions.push(...more);
    } catch {
      // Silently fail
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

// ── Leaderboard (localStorage) ──────────────────
const LB_KEY = 'trivia-ttt-leaderboard';

function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LB_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted data */ }
  return { players: {} };
}

function saveLeaderboard(data) {
  localStorage.setItem(LB_KEY, JSON.stringify(data));
}

function recordGameResult(winnerIdx) {
  const lb = loadLeaderboard();
  const isDraw = winnerIdx === -1;

  state.players.forEach((p, i) => {
    const key = p.name.toLowerCase();
    if (!lb.players[key]) {
      lb.players[key] = { displayName: p.name, wins: 0, losses: 0, draws: 0, gamesPlayed: 0 };
    }
    const entry = lb.players[key];
    entry.displayName = p.name; // update casing
    entry.gamesPlayed++;
    if (isDraw) {
      entry.draws++;
    } else if (i === winnerIdx) {
      entry.wins++;
    } else {
      entry.losses++;
    }
  });

  saveLeaderboard(lb);
}

function getLeaderboardRanking() {
  const lb = loadLeaderboard();
  return Object.values(lb.players)
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const rateA = a.gamesPlayed ? a.wins / a.gamesPlayed : 0;
      const rateB = b.gamesPlayed ? b.wins / b.gamesPlayed : 0;
      return rateB - rateA;
    });
}

function renderLeaderboard() {
  const ranking = getLeaderboardRanking();
  if (ranking.length === 0) {
    els.lbTable.classList.add('hidden');
    els.lbEmpty.classList.remove('hidden');
    return;
  }
  els.lbEmpty.classList.add('hidden');
  els.lbTable.classList.remove('hidden');

  els.lbBody.innerHTML = '';
  ranking.forEach((p, i) => {
    const winPct = p.gamesPlayed ? Math.round((p.wins / p.gamesPlayed) * 100) : 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i + 1}</td><td>${p.displayName}</td><td>${p.wins}</td><td>${p.losses}</td><td>${p.draws}</td><td>${p.gamesPlayed}</td><td>${winPct}%</td>`;
    els.lbBody.appendChild(tr);
  });
}

els.leaderboardBtn.addEventListener('click', () => {
  renderLeaderboard();
  showScreen('leaderboard');
});

els.lbBackBtn.addEventListener('click', () => showScreen('start'));

els.lbClearBtn.addEventListener('click', () => {
  if (confirm('Clear all leaderboard data?')) {
    localStorage.removeItem(LB_KEY);
    renderLeaderboard();
  }
});

// ── Start Screen ────────────────────────────────
function validateNames() {
  const p1ok = els.p1Name.value.trim();
  const p2ok = els.p2Name.value.trim();
  const count = parseInt(els.playerCountSelect.value);
  const p3ok = count === 3 ? els.p3Name.value.trim() : true;
  els.startBtn.disabled = !(p1ok && p2ok && p3ok);
}

els.p1Name.addEventListener('input', validateNames);
els.p2Name.addEventListener('input', validateNames);
els.p3Name.addEventListener('input', validateNames);

els.playerCountSelect.addEventListener('change', () => {
  const count = parseInt(els.playerCountSelect.value);
  if (count === 3) {
    els.p3Wrap.classList.remove('hidden');
  } else {
    els.p3Wrap.classList.add('hidden');
  }
  validateNames();
});

els.setupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  state.playerCount = parseInt(els.playerCountSelect.value);
  state.players = [
    { name: els.p1Name.value.trim(), mark: '' },
    { name: els.p2Name.value.trim(), mark: '' },
  ];
  if (state.playerCount === 3) {
    state.players.push({ name: els.p3Name.value.trim(), mark: '' });
  }

  state.timerDuration = parseInt(els.timerSelect.value);
  state.category = els.categorySelect.value;
  state.difficulty = els.difficultySelect.value;
  state.categoryFellBack = false;

  state.boardSize = state.playerCount === 3 ? 4 : 3;
  state.winLength = state.playerCount === 3 ? 4 : 3;
  state.quizTotal = state.playerCount === 3 ? 6 : 5;

  state.questions = [];
  state.quizIndex = 0;
  state.quizScores = Array(state.playerCount).fill(0);
  state.board = Array(state.boardSize * state.boardSize).fill(null);
  state.gameOver = false;
  state.isSecondChance = false;

  WIN_LINES = generateWinLines(state.boardSize, state.winLength);

  els.startError.classList.add('hidden');
  showScreen('loading');
  els.loadError.classList.add('hidden');
  $('.loader-wrap').style.display = '';

  const fetchAmount = state.playerCount === 3 ? 25 : 20;
  try {
    const qs = await fetchQuestions(fetchAmount);
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
  const fetchAmount = state.playerCount === 3 ? 25 : 20;
  try {
    const qs = await fetchQuestions(fetchAmount);
    state.questions = qs;
    startQuiz();
  } catch (err) {
    showLoadError(err.message);
  }
});

// ── Pre-Game Quiz ───────────────────────────────
function startQuiz() {
  state.quizIndex = 0;
  state.quizScores = Array(state.playerCount).fill(0);
  showScreen('quiz');
  showQuizQuestion();
}

function quizCurrentPlayer() {
  return state.quizIndex % state.playerCount;
}

function updateQuizScoreDisplay() {
  els.quizScores.innerHTML = '';
  state.players.forEach((p, i) => {
    const span = document.createElement('span');
    span.textContent = `${p.name}: ${state.quizScores[i]}`;
    els.quizScores.appendChild(span);
  });
}

function showQuizQuestion() {
  const q = takeQuestion();
  if (!q) {
    showLoadError('Ran out of questions. Please retry.');
    showScreen('loading');
    return;
  }

  const pIdx = quizCurrentPlayer();
  els.quizProgress.textContent = `Question ${state.quizIndex + 1} / ${state.quizTotal}`;
  els.quizTurn.textContent = `${playerName(pIdx)}'s turn`;
  updateQuizScoreDisplay();
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
    highlightCorrectBtn(els.quizAnswers, q.correctIndex);
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

  updateQuizScoreDisplay();
  setTimeout(advanceQuiz, 1200);
}

function advanceQuiz() {
  state.quizIndex++;
  if (state.quizIndex < state.quizTotal) {
    showQuizQuestion();
  } else {
    determineFirstPlayer();
  }
}

// ── Determine First Player & Marks ──────────────
function determineFirstPlayer() {
  const maxScore = Math.max(...state.quizScores);
  const topPlayers = state.quizScores
    .map((s, i) => ({ score: s, idx: i }))
    .filter(p => p.score === maxScore);
  state.firstPlayer = topPlayers[Math.floor(Math.random() * topPlayers.length)].idx;

  // Randomly assign marks
  const marks = shuffleArray(state.playerCount === 3 ? MARKS_3P : MARKS_2P);
  state.players.forEach((p, i) => { p.mark = marks[i]; });

  state.currentPlayer = state.firstPlayer;

  els.revealText.textContent = `${playerName(state.firstPlayer)} goes first!`;
  if (state.playerCount === 3) {
    els.revealSub.textContent = state.players.map(p => `${p.name} = ${p.mark}`).join('  \u00B7  ');
  } else {
    els.revealSub.textContent = `Playing as ${state.players[state.firstPlayer].mark}`;
  }

  showScreen('reveal');
}

els.revealContinue.addEventListener('click', startGame);

// ── Main Game ───────────────────────────────────
function buildBoard() {
  const total = state.boardSize * state.boardSize;
  els.board.innerHTML = '';
  els.board.style.gridTemplateColumns = `repeat(${state.boardSize}, 1fr)`;
  els.board.className = state.boardSize === 4 ? 'board board-4' : 'board';

  for (let i = 0; i < total; i++) {
    const btn = document.createElement('button');
    btn.className = 'cell';
    btn.dataset.index = i;
    btn.addEventListener('click', () => handleCellClick(i));
    els.board.appendChild(btn);
  }
}

function handleCellClick(idx) {
  if (state.board[idx] || state.gameOver) return;
  state.selectedCell = idx;
  state.isSecondChance = false;
  showQuestionModal();
}

function startGame() {
  buildBoard();
  showScreen('game');
  renderBoard();
  buildGameHeader();
}

function buildGameHeader() {
  els.gameHeader.innerHTML = '';
  state.players.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'player-info';
    div.id = `game-p${i}-info`;
    div.innerHTML = `<span class="player-name">${p.name}</span><span class="player-mark ${markClass(p.mark)}">${p.mark}</span>`;
    els.gameHeader.appendChild(div);
  });

  const turnDiv = document.createElement('div');
  turnDiv.className = 'turn-indicator';
  turnDiv.id = 'turn-indicator';
  els.gameHeader.appendChild(turnDiv);

  updateTurnIndicator();
}

function updateTurnIndicator() {
  const el = $('#turn-indicator');
  if (el) el.textContent = `${playerName(state.currentPlayer)}'s turn`;

  state.players.forEach((_, i) => {
    const info = $(`#game-p${i}-info`);
    if (info) info.classList.toggle('active-turn', state.currentPlayer === i);
  });
}

function renderBoard() {
  const cells = els.board.querySelectorAll('.cell');
  cells.forEach((cell, i) => {
    cell.textContent = state.board[i] || '';
    cell.className = 'cell';
    if (state.board[i]) {
      cell.classList.add(markClass(state.board[i]));
      cell.disabled = true;
    } else {
      cell.disabled = state.gameOver;
    }
  });
}

// ── Question Modal ──────────────────────────────
function showQuestionModal() {
  const q = takeQuestion();
  if (!q) {
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
    highlightCorrectBtn(els.modalAnswers, q.correctIndex);
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
  const asker = nextPlayerIdx(state.currentPlayer);
  const cur = state.currentPlayer;
  els.scText.textContent = `${playerName(asker)}, give ${playerName(cur)} another chance?`;

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
    showQuestionModal();
  } else {
    state.currentPlayer = nextPlayerIdx(state.currentPlayer);
    updateTurnIndicator();
  }
}

// ── Place Mark & Win Detection ──────────────────
function placeMark(cellIdx) {
  const mark = state.players[state.currentPlayer].mark;
  state.board[cellIdx] = mark;
  renderBoard();

  const winLine = checkWin(mark);
  if (winLine) {
    highlightWin(winLine);
    state.gameOver = true;
    renderBoard();
    highlightWin(winLine);
    recordGameResult(state.currentPlayer);
    setTimeout(() => showEnd(`${playerName(state.currentPlayer)} wins!`), 1200);
    return;
  }

  if (state.board.every(c => c !== null)) {
    state.gameOver = true;
    recordGameResult(-1);
    setTimeout(() => showEnd("It's a draw!"), 800);
    return;
  }

  state.currentPlayer = nextPlayerIdx(state.currentPlayer);
  updateTurnIndicator();
}

function checkWin(mark) {
  for (const line of WIN_LINES) {
    if (line.every(i => state.board[i] === mark)) return line;
  }
  return null;
}

function highlightWin(line) {
  const cells = els.board.querySelectorAll('.cell');
  line.forEach(i => cells[i].classList.add('win-cell'));
}

// ── End Screen ──────────────────────────────────
function showEnd(msg) {
  els.endResult.textContent = msg;
  showScreen('end');
}

els.playAgainBtn.addEventListener('click', () => {
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

function highlightCorrectBtn(container, correctIndex) {
  const btns = container.querySelectorAll('.answer-btn');
  btns[correctIndex].classList.add('correct');
}

// ── Init ────────────────────────────────────────
loadCategories();
