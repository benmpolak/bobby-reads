# Bobby’s Big Adventure

The next version of Bobby Reads. A static family reading and maths app hosted on the existing GitHub Pages site.

## Play

- Eight maths games: number bonds, pocket money, doubles, addition, gentle subtraction, missing numbers, sequences and dedicated times tables. Addition and times tables have ten questions per round, with a replay button; other missions have five. Choose any table from 1 to 12, mix 2s, 5s and 10s, or play a Surprise round of ten questions drawn from ten different tables. No division.
- Four difficulty levels for addition, doubles, missing numbers and patterns. These games adapt independently after three unaided correct answers or two questions needing help. Parents can select a fixed level. Subtraction always stays within ten, removing one to three with interactive rocks, regardless of old scores or parent settings. Times tables stay on the selected table.
- Number models, scaffolded hints, touch keypad and a make-your-own-sum lab. Answers receive green ticks or red crosses and explicit text, including the attempted equation.
- Twenty words to build with grapheme tiles and three five-question story mysteries, each with two opening choices. Story questions cover retrieval, inference, vocabulary and reasoning. Each route changes the opening and two clue scenes before rejoining the ending.
- Original books and phonics games retained, including existing stars and read-book history. Bookmarks added.
- Short missions, stars and six crew unlocks. No timers, lost lives, daily streak demands, account or tracking.

Stretch stories are not represented as scheme-matched decodable books. Device speech reads words and sentences; it does not assess spoken answers or supply isolated phoneme teaching. Adult guidance and primary educational references are in the grown-up area.

## Run and check

The served app has no runtime dependencies or build step. Serve this directory with `npm start` or any static server. For the development checks use Node 22.13+ and `npm ci`, then `npm test`.

Tests cover arithmetic invariants across 32,000 questions, adaptation limits, legacy data migration, full missions, retries and duplicate reward protection, word tiles, every story opening, book position, settings, reload, and unavailable browser storage/audio. Browser visual/device testing is separate from these programmatic checks.

## Files

- `index.html`: entry point and retained reader styles.
- `legacy.js`: existing books, phonics data and reader/game functions.
- `engine.js`: pure maths generation and adaptation, also used by tests.
- `adventure.js`, `adventure.css`: new adventure experience.
- `assets/space-companion.png`: original generated artwork.

Progress is local to the browser under `bobbyAdventure`. Existing `bobbyStars`, `bobbyRead` and `bobbyLevel` keys are preserved. There is no cross-device sync. No service worker is installed; a first visit requires internet access.

GitHub Pages serves the root of `main` at https://benmpolak.github.io/bobby-reads/.

## Maths expeditions

Mixed ten-question planet missions, six planet landings (one every three completed maths rounds) and eight achievement badges. A visible fuel bar fills with each solved puzzle. No time limits or lost lives.

Every round keeps a question-by-question log: green for independent answers, amber for assisted answers, red for previous guesses. Mistakes and helped questions enter a persistent Fix-it queue (up to 60); answering one independently clears it. Each table has a 12-fact passport, collected through independent answers. Two wrong attempts show a worked answer, with an earlier reveal button available. Existing stars and reading progress are preserved; the new expedition counters start with this update.

`maths-quests.js` contains the mission and collection UI. Tests cover retries across reloads, mixed-mode adaptation, unique passport facts, planet and badge unlocks, and reward idempotency.
