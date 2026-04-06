# Trivia Tic-Tac-Toe

A mobile-friendly tic-tac-toe game with a trivia twist. Players must correctly answer trivia questions to claim squares on the board. Supports 2 or 3 players.

## How It Works

1. **Setup** — Choose 2 or 3 players, enter names, pick a question timer, trivia category, and difficulty.
2. **Pre-Game Quiz** — Players alternate answering trivia questions (5 for 2-player, 6 for 3-player). The player with the most correct answers goes first; ties are broken randomly. Marks (X, O, and triangle for 3-player) are randomly assigned.
3. **The Game** — Players tap an empty cell, then answer a trivia question to claim it. Wrong answers or timeouts give the next player a chance to grant a "second chance" with a new question.
4. **Board Sizes** — 2 players use a 3x3 board (3 in a row to win). 3 players use a 4x4 board (4 in a row to win).

## Features

- **Leaderboard** — Persistent player stats (wins, losses, draws) stored in localStorage. Player names are normalized to lowercase so "Matt" and "matt" are treated as the same player.
- **3-Player Mode** — Play with 3 people on an expanded 4x4 board with a third mark.
- **Category Fallback** — If the selected trivia category doesn't have enough questions, the game automatically falls back to mixed categories instead of failing.

## How to Run

Just open `index.html` in any modern browser:

```
open index.html
```

If you run into CORS issues when fetching trivia questions, serve the files locally:

```
cd Trivia-Tic-Tac-Toe
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

## Tech Stack

- HTML, CSS, vanilla JavaScript — no frameworks, no build step
- [Open Trivia Database](https://opentdb.com/) for trivia questions
- localStorage for leaderboard persistence

## Dependencies

This game relies on the Open Trivia DB API for questions. An internet connection is required to play.
