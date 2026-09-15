const {JSDOM}=require('jsdom');const fs=require('fs');const assert=require('node:assert/strict');const vm=require('node:vm');
const root=require('node:path').join(__dirname,'../');
function boot(storage={},blocked=false){const dom=new JSDOM('<div id="app"></div>',{url:'https://benmpolak.github.io/bobby-reads/',runScripts:'outside-only'});const w=dom.window;w.scrollTo=()=>{};for(const [k,v]of Object.entries(storage))w.localStorage.setItem(k,v);if(blocked)Object.defineProperty(w,'localStorage',{get(){throw new Error('blocked')}});w.eval=code=>vm.runInContext(code,dom.getInternalVMContext());for(const file of ['legacy.js','engine.js','maths-quests.js','words.js','adventure.js'])w.eval(fs.readFileSync(root+file,'utf8'));return w;}
function click(w,text){const b=[...w.document.querySelectorAll('button')].find(b=>b.textContent===text||b.textContent.includes(text));assert.ok(b,`button ${text}`);b.click();}
function submit(w,value){w.document.querySelector('input').value=String(value);w.document.querySelector('form').dispatchEvent(new w.Event('submit',{cancelable:true}));}
function complete(w){const n=w.eval('run.length');for(let i=0;i<n;i++){submit(w,w.eval('run.q.answer'));click(w,i===n-1?'See results':'Next question');}}
const old={version:2,missions:7,mathSolved:30,startTier:1,auto:true,records:{subtract:{tier:0},add:{tier:3}},tableFacts:{'7:3':true}};
const w=boot({bobbyStars:'27',bobbyRead:'["kickit"]',bobbyLevel:'year1',bobbyAdventure:JSON.stringify(old)});
assert.equal(w.eval('stars'),27);assert.equal(w.eval('readBooks[0]'),'kickit');assert.equal(w.eval('progress.missions'),7);assert.equal(w.eval('tableScore(7)'),1);assert.equal(w.eval('progress.records.subtract'),undefined);assert.equal(w.eval('progress.records.add.tier'),1);
assert.doesNotMatch(w.document.body.textContent,/rocket|planet|space|crew|mission|Pip/i);assert.match(w.document.body.textContent,/Start 20 questions/);
// Addition stays mostly familiar, varies down and up, and never jumps to 500 + 500.
w.eval('progress.roundLength=30;startMath("add")');const tiers=[];for(let i=0;i<30;i++){tiers.push(w.eval('run.q.tier'));assert.ok(w.eval('run.q.answer<=200'));submit(w,w.eval('run.q.answer'));click(w,i===29?'See results':'Next question');}
assert.equal(tiers.filter(t=>t===0).length,6);assert.equal(tiers.filter(t=>t===2).length,3);assert.equal(w.eval('progress.mathGame.rounds'),1);assert.equal(w.eval('stars'),62);w.eval('finishRun()');assert.equal(w.eval('stars'),62);
// Subtraction is no longer capped by the old easy mode; explicit fixed level also works.
w.eval('progress.roundLength=10;startMath("subtract")');assert.ok(w.eval('run.q.a>20&&run.q.b>=10'));click(w,'Show a model');assert.ok(w.document.querySelector('.number-line'));assert.equal(w.eval('run.assisted'),true);complete(w);assert.ok(w.eval('progress.records.subtract.tier>=2'));
w.eval('progress.auto=false;progress.startTier=3;startMath("subtract")');for(let i=0;i<10;i++){assert.equal(w.eval('run.q.tier'),3);assert.ok(w.eval('run.q.a>=201'));submit(w,w.eval('run.q.answer'));click(w,i===9?'See results':'Next question');}
// Both mixed modes run to completion, with actual plus/minus/multiplication questions.
w.eval('progress.auto=true;progress.startTier=1;progress.records={};progress.roundLength=20;startMixed("all")');const types=[];for(let i=0;i<20;i++){types.push(w.eval('run.q.mode'));submit(w,w.eval('run.q.answer'));click(w,i===19?'See results':'Next question');}assert.equal(new Set(types).size,3);assert.equal(w.document.querySelectorAll('.round-review li').length,20);
w.eval('startMixed("sums")');assert.ok(w.eval('run.modePlan.every(m=>m==="add"||m==="subtract")'));complete(w);
// Wrong guesses persist, independent recall clears them, and duplicate submissions do not pay twice.
w.eval('startMath("groups",undefined,7)');const missed=w.eval('run.q');submit(w,999);submit(w,998);assert.match(w.document.querySelector('.help-area').textContent,/The answer:/);assert.ok(w.eval('progress.practice.some(x=>x.prompt===run.q.prompt)'));const before=w.eval('stars');submit(w,missed.answer);submit(w,missed.answer);assert.equal(w.eval('stars'),before+1);assert.equal(w.eval('run.helped'),1);click(w,'Finish here');assert.equal(w.eval('stars'),before+1);
const state=w.localStorage.getItem('bobbyAdventure');const recall=boot({bobbyAdventure:state});recall.eval('startPractice()');assert.ok(recall.eval('run.deck.some(q=>q.prompt==='+JSON.stringify(missed.prompt)+')'));complete(recall);assert.equal(recall.eval('progress.practice.length'),0);assert.equal(recall.eval('tableScore(7)>=1'),true);recall.close();
// Selected times tables include all facts; full mixed table set includes all tables.
w.eval('showTables()');click(w,'Trickier tables');assert.equal(w.eval('run.length'),24);assert.equal(w.eval('new Set(run.deck.map(q=>q.b)).size'),8);complete(w);click(w,'Another round');assert.equal(w.eval('run.table'),'hard');
w.eval('startMath("groups",undefined,5)');assert.equal(w.eval('run.length'),12);complete(w);assert.equal(w.eval('tableScore(5)'),12);
// Validate the whole word bank and every sentence option.
assert.equal(w.eval('WORDS.length'),80);assert.equal(w.eval('SENTENCES.length'),40);assert.equal(w.eval('new Set(WORDS.map(w=>w[0])).size'),80);assert.ok(w.eval('WORDS.every(([word,parts,clue])=>parts.join("")===word&&clue.length>5)'));assert.ok(w.eval('SENTENCES.every(([s,a,wrong])=>s.includes("___")&&new Set([a,...wrong]).size===3)'));
// Build 20 words through actual DOM tiles, including hints, retries, duplicate letters and Undo.
w.eval('progress.wordLength=20;startWords()');for(let i=0;i<20;i++){
 const parts=w.eval('run.words[run.index][1]');if(i===0){click(w,'Hint');}
 for(const part of parts){const tile=[...w.document.querySelectorAll('.tile')].find(b=>!b.disabled&&b.textContent===part);assert.ok(tile,`tile ${part}`);tile.click();}
 if(i===0){click(w,'Undo');const tile=[...w.document.querySelectorAll('.tile')].find(b=>!b.disabled&&b.textContent===parts.at(-1));tile.click();}
 click(w,'Check word');assert.equal(w.eval('run.answered'),true);click(w,i===19?'See results':'Next word');
}
assert.equal(w.eval('run.helped'),1);assert.equal(w.eval('run.independent'),19);assert.equal(w.document.querySelectorAll('.round-review li').length,20);
// Sentence feedback and scores record wrong answers, then allow a correct retry.
w.eval('progress.wordLength=10;startWords("sentence")');for(let i=0;i<10;i++){
 const [sentence,answer,wrong]=w.eval('run.words[run.index]');if(i===0)click(w,wrong[0]);click(w,answer);assert.equal(w.eval('run.answered'),true);click(w,i===9?'See results':'Next word');
}assert.equal(w.eval('run.helped'),1);assert.equal(w.eval('run.independent'),9);assert.ok(w.document.querySelector('.earlier-guesses'));
// An empty or partially completed round never grants a completion bonus.
w.eval('startMath("add")');const emptyStars=w.eval('stars'),rounds=w.eval('progress.missions');click(w,'Finish here');assert.equal(w.eval('stars'),emptyStars);assert.equal(w.eval('progress.missions'),rounds);click(w,'Another round');submit(w,w.eval('run.q.answer'));click(w,'Finish here');assert.equal(w.eval('stars'),emptyStars+1);assert.equal(w.eval('progress.missions'),rounds);
// Round-length controls, settings, original books, sounds and saved bookmarks.
w.eval('showMaths()');click(w,'30');assert.equal(w.eval('progress.roundLength'),30);click(w,'Addition & subtraction');assert.equal(w.eval('run.length'),30);
w.eval('showParents()');const difficulty=w.document.querySelector('#difficulty');difficulty.value='2';difficulty.dispatchEvent(new w.Event('change'));assert.equal(w.eval('progress.startTier'),2);
w.eval('showLibrary()');assert.ok(w.document.querySelector('nav'));w.eval('showBook(BOOKS[0],3)');assert.equal(w.eval('progress.bookmarks[BOOKS[0].id]'),3);w.eval('showBook(BOOKS[0],-1)');click(w,'Continue from page 4');assert.ok(w.document.querySelector('button.w'));w.eval('showFinish(BOOKS[0])');assert.equal(w.eval('progress.bookmarks[BOOKS[0].id]'),undefined);
for(const fn of ['showBlend','showTricky','showSounds','showHome','showMaths','showReading','showTables','showLab'])w.eval(fn+'()');
const saved={};for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i);saved[k]=w.localStorage.getItem(k);}const restored=boot(saved);assert.equal(restored.eval('stars'),w.eval('stars'));assert.equal(restored.eval('progress.missions'),w.eval('progress.missions'));assert.equal(restored.eval('progress.roundLength'),30);restored.close();w.close();
for(const state of [{bobbyRead:'not json',bobbyStars:'oops',bobbyAdventure:'not json'},{bobbyRead:'{}',bobbyAdventure:'null'}]){const bad=boot(state);assert.match(bad.document.body.textContent,/Ready, Bobby/);bad.close();}const blocked=boot({},true);blocked.eval('startMath("add")');complete(blocked);blocked.eval('startWords()');click(blocked,'Hear the word');blocked.close();
console.log('Integration passed: varied addition, harder subtraction, balanced mixed rounds, 12/24-question tables, word and sentence tests, retries, partial rounds, duplicate rewards, migration, settings, books, reload and unavailable storage/audio.');
