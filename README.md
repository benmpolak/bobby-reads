# Bobby’s Big Adventure

The next version of Bobby Reads. A static family reading and maths app hosted on the existing GitHub Pages site.

## Play

- Six five-question maths missions: doubles, addition, subtraction, missing numbers, sequences and equal groups/sharing.
- Four difficulty levels. Each game adapts independently after three unaided correct answers or two questions needing help. Parents can select a fixed level.
- Number models, scaffolded hints, touch keypad and a make-your-own-sum lab.
- Twenty words to build with grapheme tiles and three five-question story mysteries, each with two opening choices. Story questions cover retrieval, inference, vocabulary and reasoning. Each route changes the opening and two clue scenes before rejoining the ending.
- Original books and phonics games retained, including existing stars and read-book history. Bookmarks added.
- Five-puzzle missions, stars and six crew unlocks. No timers, lost lives, daily streak demands, account or tracking.

Stretch stories are not represented as scheme-matched decodable books. Device speech reads words and sentences; it does not assess spoken answers or supply isolated phoneme teaching. Adult guidance and primary educational references are in the grown-up area.

## Run and check

The served app has no runtime dependencies or build step. Serve this directory with `npm start` or any static server. For the development checks use Node 22.13+ and `npm ci`, then `npm test`.

Tests cover arithmetic invariants across 24,000 questions, adaptation limits, legacy data migration, full missions, retries and duplicate reward protection, word tiles, every story opening, book position, settings, reload, and unavailable browser storage/audio. Browser visual/device testing is separate from these programmatic checks.

## Files

- `index.html`: entry point and retained reader styles.
- `legacy.js`: existing books, phonics data and reader/game functions.
- `engine.js`: pure maths generation and adaptation, also used by tests.
- `adventure.js`, `adventure.css`: new adventure experience.
- `assets/space-companion.png`: original generated artwork.

Progress is local to the browser under `bobbyAdventure`. Existing `bobbyStars`, `bobbyRead` and `bobbyLevel` keys are preserved. There is no cross-device sync. No service worker is installed; a first visit requires internet access.

GitHub Pages serves the root of `main` at https://benmpolak.github.io/bobby-reads/.
