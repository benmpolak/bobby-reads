# Bobby Reads

Direct maths and word tests, hosted at https://benmpolak.github.io/bobby-reads/.

## Practice

- Start mixed maths or word building directly from the home screen. No space story, missions, crew or unlock screens.
- Maths rounds: 10, 20 or 30 questions, default 20. Mix addition and subtraction, mix in multiplication, or practise an individual skill.
- Addition mixes mostly familiar two-digit work with easier questions and occasional stretches. Automatic addition is capped at sums up to 200. Fixed Big numbers mode goes up to 1,000.
- Subtraction ranges from numbers within 20 to subtracting tens and hundreds from numbers up to 1,000. Regular questions cross a ten. Answers stay non-negative. Hints split the subtraction into tens and ones.
- Each individual times table covers all 12 facts in a shuffled order. Mixed rounds have 24 questions, balanced across all 12 tables, the trickier tables, or 2, 5 and 10.
- Other maths: doubles, missing numbers, number bonds, patterns and money.
- Word building: 80 words, with clues, spelling tiles, two spare tiles and optional whole-word audio. A familiar-word setting uses 30 words. Sentence tests have 40 questions with three choices. Choose 10 or 20 per round. Unseen and missed words are prioritised.
- Results show first-time answers, helped answers and previous guesses. Maths mistakes are saved for another try. Known multiplication facts fill in the table progress.
- Every solved question earns a star. A complete round earns five more. Finish here stops whenever Bobby wants, retaining answer progress without a completion bonus. No timers or lost lives.
- Original books, phonics cards and reading progress remain available.

## Difficulty and saves

Skills adapt after five first-time answers or two helped answers. Question selection mixes familiar work, consolidation and an occasional stretch. Addition keeps its baseline at or below the starting level so it does not race into large numbers. Grown-ups can choose a fixed level.

Progress is local to the browser under `bobbyAdventure`. Existing `bobbyStars`, `bobbyRead` and `bobbyLevel` keys are preserved. The version 3 migration resets only the obsolete tiny-subtraction level and softens an old automatic addition score. Book history, stars, completed rounds, practice questions and known facts remain.

No accounts, analytics or cross-device sync. If browser storage is blocked, progress lasts for that visit. Audio reads whole words and sentences using the device voice; it does not assess spoken reading or teach isolated phonemes. The first visit requires internet access; no service worker is installed.

## Run and check

Static files, with no build step or runtime dependencies:

```sh
npm ci
npm test
npm start
```

Requires Node 22.13+ for the development tests. Local preview runs on port 8137.

Tests cover 32,000 generated questions, harder subtraction, balanced mixed modes and tables, varied addition, word/sentence content and interactions, saved retries, early finishing, reward guards, migrations, settings, books, reload and unavailable storage/audio. Responsive browser checks are separate.

GitHub Pages publishes the root of `main`.

## Files

- `index.html`: entry point and original reader styles.
- `legacy.js`: original books, phonics data and reader functions.
- `engine.js`: maths generation and progression.
- `words.js`: word and sentence question banks.
- `adventure.js`, `adventure.css`: practice screens.
- `maths-quests.js`: retained filename for saved practice, table progress and results.
