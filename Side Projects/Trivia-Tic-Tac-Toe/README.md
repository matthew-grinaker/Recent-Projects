# Trivia Tic-Tac-Toe

A mobile-friendly tic-tac-toe game with a trivia twist. Players must correctly answer trivia questions to claim squares on the board.

## How It Works

1. **Setup** — Two players enter their names, choose a question timer, trivia category, and difficulty.
2. **Pre-Game Quiz** — Players alternate answering 5 trivia questions. The player with more correct answers goes first; ties are broken randomly. X and O are randomly assigned.
3. **The Game** — Players tap an empty cell, then answer a trivia question to claim it. Wrong answers or timeouts give the opponent a chance to grant a "second chance" with a new question. Standard tic-tac-toe win conditions apply.

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

## Dependencies

This game relies on the Open Trivia DB API for questions. An internet connection is required to play.
