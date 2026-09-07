const {JSDOM}=require('jsdom');const fs=require('fs');const assert=require('node:assert/strict');
const vm=require('node:vm');
const root=require('node:path').join(__dirname,'../');
function boot(storage={},blocked=false){const dom=new JSDOM('<div id="app"></div>',{url:'https://benmpolak.github.io/bobby-reads/',runScripts:'outside-only'});const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:true});for(const [k,v]of Object.entries(storage))w.localStorage.setItem(k,v);if(blocked)Object.defineProperty(w,'localStorage',{get(){throw new Error('blocked')}});w.eval=code=>vm.runInContext(code,dom.getInternalVMContext());for(const file of ['legacy.js','engine.js','adventure.js'])w.eval(fs.readFileSync(root+file,'utf8'));return w;}
function click(w,text){const b=[...w.document.querySelectorAll('button')].find(b=>b.textContent===text||b.textContent.includes(text));assert.ok(b,`button ${text}`);b.click();}
let w=boot({bobbyStars:'27',bobbyRead:'["kickit"]',bobbyLevel:'reception'});assert.match(w.document.body.textContent,/27/);assert.equal(w.eval('level'),'reception');assert.equal(w.eval('readBooks[0]'),'kickit');
click(w,'Let’s solve it');assert.equal(w.eval('run.q.answer'),96);
let input=w.document.querySelector('input');input.value='3';w.document.querySelector('form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(w.eval('stars'),27);assert.equal(w.eval('run.assisted'),true);
click(w,'Show a model');assert.ok(w.document.querySelector('.ten'));input.value='96';w.document.querySelector('form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(w.eval('stars'),28);w.document.querySelector('form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(w.eval('stars'),28);
for(let i=1;i<5;i++){click(w,'Next puzzle');w.document.querySelector('input').value=w.eval('run.q.answer');w.document.querySelector('form').dispatchEvent(new w.Event('submit',{cancelable:true}));}click(w,'Finish mission');assert.equal(w.eval('progress.missions'),1);assert.equal(w.eval('stars'),37);w.eval('finishRun()');assert.equal(w.eval('stars'),37);
// Wrong and correct answers have symbols, labels and distinct classes beside the question.
const quiz=boot({bobbyAdventure:JSON.stringify({startTier:3,auto:true,records:{subtract:{tier:3}}})});
quiz.eval('startMath("add")');assert.equal(quiz.eval('run.length'),10);
let field=quiz.document.querySelector('input');field.value='99999';quiz.document.querySelector('form').dispatchEvent(new quiz.Event('submit',{cancelable:true}));
assert.match(quiz.document.querySelector('.question-result.incorrect').textContent,/✗ Not quite/);assert.equal(field.getAttribute('aria-invalid'),'true');assert.ok(quiz.document.querySelector('.step.incorrect'));
const before=quiz.eval('stars');
for(let i=0;i<10;i++){
 quiz.document.querySelector('input').value=quiz.eval('run.q.answer');quiz.document.querySelector('form').dispatchEvent(new quiz.Event('submit',{cancelable:true}));
 assert.match(quiz.document.querySelector('.question-result.correct').textContent,/✓ Correct/);assert.equal(quiz.document.querySelector('input').getAttribute('aria-invalid'),'false');
 click(quiz,i===9?'Finish mission':'Next puzzle');
}
assert.equal(quiz.eval('stars'),before+15);assert.equal(quiz.eval('progress.missions'),1);click(quiz,'More additions');assert.equal(quiz.eval('run.index'),0);assert.equal(quiz.eval('run.length'),10);
// An old high subtraction score and high global level cannot make the new subtraction hard.
quiz.eval('startMath("subtract")');for(let i=0;i<5;i++){
 assert.equal(quiz.eval('run.q.tier'),0);assert.ok(quiz.eval('run.q.a<=10 && run.q.b<=3'));
 const count=quiz.eval('run.q.b');for(let j=0;j<count;j++)quiz.document.querySelector('.moon-rock:not(:disabled)').click();
 assert.equal(quiz.document.querySelectorAll('.moon-rock.removed').length,count);
 const leftover=quiz.document.querySelector('.moon-rock:not(:disabled)');if(leftover)leftover.click();assert.equal(quiz.document.querySelectorAll('.moon-rock.removed').length,count);
 quiz.document.querySelector('input').value=quiz.eval('run.q.answer');quiz.document.querySelector('form').dispatchEvent(new quiz.Event('submit',{cancelable:true}));click(quiz,i===4?'Finish mission':'Next puzzle');
}
quiz.eval('showTables()');click(quiz,'5 times table');for(let i=0;i<10;i++){
 assert.equal(quiz.eval('run.q.b'),5);assert.doesNotMatch(quiz.eval('run.q.prompt'),/÷/);quiz.document.querySelector('input').value=quiz.eval('run.q.answer');quiz.document.querySelector('form').dispatchEvent(new quiz.Event('submit',{cancelable:true}));click(quiz,i===9?'Finish mission':'Next puzzle');
}click(quiz,'More times tables');assert.equal(quiz.eval('run.q.b'),5);
quiz.eval('showTables()');click(quiz,'Surprise me!');assert.equal(quiz.eval('run.table'),'all');assert.equal(quiz.eval('new Set(run.deck.map(q=>q.b)).size'),10);assert.match(quiz.document.body.textContent,/Surprise times tables/);
quiz.eval('startMath("missing")');const q=quiz.eval('run.q');assert.equal(quiz.eval('answerEquation(run.q,run.q.answer)'),q.prompt.replace('?',String(q.answer)));
quiz.close();
// Library navigation, word audio keyboard semantics, book completion and resume.
w.eval('showLibrary()');assert.ok(w.document.querySelector('nav'));w.eval('showBook(BOOKS[0],3)');assert.equal(w.eval('progress.bookmarks[BOOKS[0].id]'),3);w.eval('showBook(BOOKS[0],-1)');assert.match(w.document.body.textContent,/Continue from page 4/);click(w,'Continue from page');assert.ok(w.document.querySelector('button.w'));w.eval('showFinish(BOOKS[0])');assert.equal(w.eval('progress.bookmarks[BOOKS[0].id]'),undefined);
// Solve word missions by arranging actual DOM tiles; retries do not give stars.
w.eval('startWords()');for(let i=0;i<5;i++){click(w,'Check word');const parts=w.eval('run.words[run.index][1]');for(const part of parts){const tile=[...w.document.querySelectorAll('.tile')].find(b=>!b.disabled&&b.textContent===part);assert.ok(tile);tile.click();}click(w,'Check word');click(w,'Next →');}assert.equal(w.eval('progress.wordsBuilt'),5);assert.equal(w.eval('progress.missions'),2);
// Each story route can be played all the way through and marks every answer.
for(let s=0;s<3;s++)for(let r=0;r<2;r++){w.eval(`chooseRoute(STORIES[${s}])`);w.document.querySelectorAll('.choice')[r].click();for(let i=0;i<5;i++){const correct=w.eval('storyScene(run.story,run.index,run.route).correct');w.document.querySelectorAll('.choice')[(correct+1)%3].click();w.document.querySelectorAll('.choice')[correct].click();click(w,i===4?'Finish the story':'Next clue');}}assert.equal(w.eval('progress.storyWins'),6);
// Parent controls and arithmetic sandbox.
w.eval('showParents()');const difficulty=w.document.querySelector('#difficulty');difficulty.value='3';difficulty.dispatchEvent(new w.Event('change'));assert.equal(w.eval('progress.startTier'),3);w.eval('showLab()');w.document.querySelector('form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.match(w.document.querySelector('.response').textContent,/96/);
// Every original screen still runs without speech synthesis.
for(const fn of ['showBlend','showTricky','showSounds','showAlien','showHome','showMaths','showReading','showCrew','showStories'])w.eval(fn+'()');
const saved={};for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i);saved[k]=w.localStorage.getItem(k);}const restored=boot(saved);assert.equal(restored.eval('progress.missions'),8);assert.equal(restored.eval('stars'),w.eval('stars'));
for(const state of [{bobbyRead:'not json',bobbyStars:'oops',bobbyAdventure:'not json'},{bobbyRead:'{}',bobbyAdventure:'null'}]){const bad=boot(state);assert.match(bad.document.body.textContent,/Let’s go/);bad.close();}const blocked=boot({},true);blocked.eval('startMath("add")');assert.ok(blocked.document.querySelector('input'));blocked.close();w.close();restored.close();console.log('Integration passed: ten-question addition and times tables, easy subtraction and counter limits, red/green answer marking, migration, five-question missions, duplicate rewards, hints, words, all story routes, books, settings, reload and unavailable storage/audio.');
