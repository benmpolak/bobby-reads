/* Bobby Reads: direct maths and word practice. All progress stays on this device. */
const E=BobbyEngine;
const defaults={version:3,missions:0,mathSolved:0,wordsBuilt:0,storyWins:0,records:{},auto:true,startTier:1,bookmarks:{},sound:true,roundLength:20,wordLength:10};
const oldProgress=stored('bobbyAdventure',{});
let progress={...defaults,...oldProgress};
for(const key of ['records','bookmarks','tableFacts','wordFacts'])if(!progress[key]||typeof progress[key]!=='object'||Array.isArray(progress[key]))progress[key]={};
if(!Array.isArray(progress.practice))progress.practice=[];
progress.mathGame={rounds:0,first:0,comebacks:0,bestChain:0,...progress.mathGame};
if(![10,20,30].includes(progress.roundLength))progress.roundLength=20;
if(![10,20].includes(progress.wordLength))progress.wordLength=10;
if(![0,1,2,3].includes(progress.startTier))progress.startTier=1;
// The previous subtraction mode recorded success on tiny sums. Start fresh for its new range.
// Old automatic addition levels could jump too quickly; ease back into the varied practice.
if((oldProgress?.version||0)<3){
 delete progress.records.subtract;
 if(progress.auto&&progress.records.add)progress.records.add={tier:Math.min(1,progress.records.add.tier||0),run:0,help:0};
 progress.version=3;
}
let run=null,screen='home';
function persist(){try{localStorage.setItem('bobbyAdventure',JSON.stringify(progress));}catch{}}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function listen(text){if(progress.sound)say(text);}
function button(text,fn,cls='primary dark'){const b=el(`<button type="button" class="${cls}">${text}</button>`);b.onclick=fn;return b;}
function fresh(where){screen=where;if('speechSynthesis'in window)speechSynthesis.cancel();app.innerHTML='';window.scrollTo(0,0);app.append(header(where));}
function header(where){const bar=el(`<header class="mast"><button class="brand" aria-label="Bobby Reads home"><span class="brandmark">b.</span><span>Bobby Reads<small>MATHS & WORDS</small></span></button><nav class="navlinks" aria-label="Main navigation"></nav><div class="balance" aria-label="${stars} stars">★ ${stars}</div></header>`);bar.querySelector('.brand').onclick=showHome;[['Maths','maths',showMaths],['Words','reading',showReading],['Books','books',showLibrary]].forEach(([label,id,fn])=>bar.querySelector('nav').append(button(label,fn,where===id?'active':'')));return bar;}
function footer(){const f=el('<footer class="quietfoot"><span>No rush. Have a go.</span></footer>');f.append(button('For grown-ups',showParents,''));app.append(f);}
function intro(title,text){app.append(el(`<section class="subhead"><h1>${title}</h1><p>${text}</p></section>`));}
function showHome(){
 fresh('home');intro('Ready, Bobby?','Pick a test. See what you know.');
 const grid=el('<div class="home-grid"></div>');
 const maths=el(`<section class="home-card maths-card"><span class="subject">01 / MATHS</span><div class="big-symbol" aria-hidden="true">+ − ×</div><h2>Mix it up.</h2><p>Addition, subtraction and times tables.<br>Some quick ones. Some to think about.</p><div class="home-actions"></div></section>`);
 maths.querySelector('.home-actions').append(button(`Start ${progress.roundLength} questions →`,()=>startMixed('all')),button('Choose my maths',showMaths,'text-button'));grid.append(maths);
 const words=el('<section class="home-card words-card"><span class="subject">02 / WORDS</span><div class="big-symbol" aria-hidden="true">Aa</div><h2>Know your words?</h2><p>Build a word from its spelling tiles.<br>Read the clue, then work it out.</p><div class="home-actions"></div></section>');
 words.querySelector('.home-actions').append(button(`Start ${progress.wordLength} words →`,()=>startWords('build')),button('Choose my word test',showReading,'text-button'));grid.append(words);app.append(grid);
 const quick=el('<div class="quick-practice"></div>');quick.append(button('Just addition & subtraction →',()=>startMixed('sums'),'secondary'),button('Times tables →',showTables,'secondary'));if(progress.practice.length)quick.append(button(`Try my tricky sums (${progress.practice.length}) →`,startPractice,'secondary'));app.append(quick);footer();
}
function roundSettings(words=false){
 const key=words?'wordLength':'roundLength',options=words?[10,20]:[10,20,30];
 const row=el(`<div class="round-settings" role="group" aria-label="Questions per round"><b>Questions</b><div class="segments"></div></div>`);
 for(const n of options){const b=button(String(n),()=>{progress[key]=n;persist();row.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));},'');b.setAttribute('aria-pressed',String(progress[key]===n));row.querySelector('.segments').append(b);}app.append(row);
}
function showMaths(){
 fresh('maths');intro('Let’s do maths.','Easier sums, trickier sums, and plenty of variety.');roundSettings();
 const grid=el('<div class="modegrid"></div>');
 for(const [title,desc,symbol,colour,fn] of [
 ['Addition & subtraction','A proper mix of plus and minus.','+ −','mint',()=>startMixed('sums')],
 ['Mix everything','Addition, subtraction and tables.','+ − ×','orange',()=>startMixed('all')],
 ['Times tables','All 12 tables. Pick one or mix them up.','×','purple',showTables],
 ...['subtract','add','doubles','missing','bonds','patterns','money'].map(id=>{const m=E.modes[id];return[m.name,m.description,m.symbol,m.colour,()=>startMath(id)];})
 ])grid.append(button(`<span class="symbol">${symbol}</span><h2>${title}</h2><p>${desc}</p><small>Let’s go →</small>`,fn,'mode '+colour));
 app.append(grid);const tools=el('<div class="tools"></div>');if(progress.practice.length)tools.append(button(`Practise my tricky sums (${progress.practice.length})`,startPractice,'secondary'));tools.append(button('Make my own sum',showLab,'secondary'));app.append(tools);footer();
}
function showTables(){
 fresh('maths');intro('Times tables.','Practise every fact up to ×12. Mix tables, or choose just one.');
 const grid=el('<div class="modegrid table-mixes"></div>');
 for(const [name,desc,table,colour]of[['Mix all tables','24 questions across tables 1 to 12.','all','mint'],['Trickier tables','24 questions: 3, 4, 6, 7, 8, 9, 11 & 12.','hard','purple'],['Mix 2, 5 & 10','24 questions to get you going.','mixed','orange']])grid.append(button(`<h2>${name}</h2><p>${desc}</p><small>Start →</small>`,()=>startMath('groups',undefined,table),'mode '+colour));app.append(grid);
 app.append(el('<div class="section-title"><h2>Pick a table</h2><span>All 12 facts, shuffled every time.</span></div>'));
 const picker=el('<div class="table-grid"></div>');for(let n=1;n<=12;n++)picker.append(button(`<b>×${n}</b><span>${tableScore(n)}/12 known</span>`,()=>startMath('groups',undefined,n),'table-button'));app.append(picker);tablePassport();footer();
}
function showReading(){
 fresh('reading');intro('Words, please.','Read, build and choose. A fresh mix every round.');roundSettings(true);
 const grid=el('<div class="modegrid word-modes"></div>');
 for(const [name,desc,symbol,colour,fn]of[['Build the word','Read the clue. Put the spelling tiles in order.','Aa','purple',()=>startWords('build')],['Finish the sentence','Read carefully. Choose the word that fits.','…','mint',()=>startWords('sentence')]])grid.append(button(`<span class="symbol">${symbol}</span><h2>${name}</h2><p>${desc}</p><small>Start test →</small>`,fn,'mode '+colour));app.append(grid);
 const row=el('<div class="tools"></div>');[['Sound it out',showBlend],['Tricky word cards',showTricky],['Sound cards',showSounds],['My books',showLibrary]].forEach(([n,f])=>row.append(button(n,f,'secondary')));app.append(row);footer();
}
function playHeader(title){
 const solved=run.index+(run.answered?1:0);
 app.append(el(`<div class="playhead"><div><b>${title}</b><span class="question-count">Question ${run.index+1} of ${run.length}</span></div><button class="secondary finish-early" type="button">Finish here</button></div>`));app.querySelector('.finish-early').onclick=()=>finishRun(true);
 app.append(el(`<div class="round-track" role="progressbar" aria-label="Questions completed" aria-valuemin="0" aria-valuemax="${run.length}" aria-valuenow="${solved}"><span style="width:${100*solved/run.length}%"></span></div>`));
}
function startMath(mode,forcedTier,table='all',deck=null,label=''){
 run={type:'math',mode,index:0,length:progress.roundLength,independent:0,helped:0,finished:false,forcedTier,questions:[],results:[],chain:0,bestChain:0,table,label,modeCounts:{}};
 if(deck)run.deck=deck;else if(mode==='groups')run.deck=E.tableRound(table);
 if(run.deck)run.length=run.deck.length;
 if(mode==='mixed')run.modePlan=E.mixedModes(table,run.length);
 nextMath();
}
function startMixed(kind='all'){startMath('mixed',undefined,kind,null,kind==='sums'?'Addition & subtraction':'Mixed maths');}
function questionTier(mode){
 const base=run.forcedTier??progress.startTier;
 if(!progress.auto||run.forcedTier!==undefined)return base;
 const record=progress.records[mode];
 const current=Math.min(mode==='add'?Math.min(2,base):3,record?.tier??base);
 // Mostly familiar work, with easier consolidation and an occasional stretch.
 const offsets=[0,0,-1,0,0,-1,0,1,0,0];
 const offset=offsets[(run.modeCounts[mode]||0)%offsets.length];
 const ceiling=mode==='add'?Math.min(2,base+1):3;
 return Math.max(0,Math.min(ceiling,current+offset));
}
function nextMath(){
 if(run.index===run.length)return finishRun();
 fresh('maths');const mode=run.modePlan?.[run.index]||run.mode;const tier=questionTier(mode);
 let q=run.deck?.[run.index]||E.question(mode,tier,Math.random,run.modeCounts[mode]||0);
 if(!run.deck)for(let retry=0;retry<30&&run.questions.some(old=>old.prompt===q.prompt);retry++)q=E.question(mode,tier,Math.random,(run.modeCounts[mode]||0)+retry);
 run.modeCounts[mode]=(run.modeCounts[mode]||0)+1;run.questions.push(q);run.q=q;run.assisted=false;run.tries=0;run.wrong=[];run.answered=false;
 playHeader(run.label||(run.mode==='groups'?(run.table==='all'?'All times tables':run.table==='hard'?'Trickier tables':run.table==='mixed'?'Mixed 2, 5 & 10':`${run.table} times table`):E.modes[mode].name));
 const card=el(`<section class="playcard"><div class="eyebrow">${E.modes[q.mode].name}</div><div class="question ${q.mode==='patterns'?'sequence':''}">${q.prompt}</div><div class="question-result" aria-live="polite"></div><form class="answerbox"><label class="sr-only" for="answer">Your answer</label><input id="answer" inputmode="numeric" pattern="[0-9]*" autocomplete="off" maxlength="5" placeholder="?" aria-label="Your answer"><button class="primary dark" type="submit">Check →</button></form><div class="keypad" aria-label="Number keypad"></div><div class="tools"></div><div class="response" aria-live="polite"></div><div class="help-area"></div></section>`);app.append(card);
 const input=card.querySelector('input');card.querySelector('form').onsubmit=e=>{e.preventDefault();checkMath(card);};for(const key of ['1','2','3','4','5','6','7','8','9','Clear','0','⌫'])card.querySelector('.keypad').append(button(key,()=>{if(run.answered)return;input.value=key==='Clear'?'':key==='⌫'?input.value.slice(0,-1):(input.value+key).slice(0,5);},''));
 const t=card.querySelector('.tools');t.append(button('Hear it',()=>listen(q.spoken),'text-button'),button('Hint',()=>showMathHelp(card,false),'text-button'),button('Show a model',()=>showMathHelp(card,true),'text-button'));input.oninput=()=>{input.value=input.value.replace(/[^0-9]/g,'').slice(0,5);};
}
function answerEquation(q,value){return ['missing','patterns','bonds'].includes(q.mode)?q.prompt.replace('?',String(value)):`${q.prompt} = ${value}${q.mode==='money'?'p':''}`;}
function markAnswer(card,correct,equation){const status=card.querySelector('.question-result');status.className='question-result '+(correct?'correct':'incorrect');status.textContent=`${correct?'✓ Correct':'✗ Not quite'}: ${equation}`;const input=card.querySelector('input');if(input)input.setAttribute('aria-invalid',String(!correct));}
function checkMath(card){
 if(run.answered||run.finished)return;const input=card.querySelector('input'),response=card.querySelector('.response');
 if(!/^\d+$/.test(input.value)){response.innerHTML='<p class="feedbackbox try">Put a number in the box first.</p>';return;}
 const value=Number(input.value),q=run.q;
 if(value!==q.answer){run.assisted=true;run.tries++;run.chain=0;run.wrong.push(value);rememberPractice(q);markAnswer(card,false,answerEquation(q,value));response.innerHTML=`<div class="feedbackbox incorrect">${q.hint}</div>`;response.append(button('Show me the answer',()=>revealMath(card),'secondary'));if(run.tries>=2)revealMath(card);input.value='';return;}
 run.answered=true;card.classList.add('is-solved');markAnswer(card,true,answerEquation(q,value));card.querySelectorAll('input,button').forEach(b=>b.disabled=true);
 const independent=!run.assisted;
 if(independent){run.independent++;run.chain++;progress.mathGame.first++;progress.mathGame.bestChain=Math.max(progress.mathGame.bestChain,run.chain);progress.practice=progress.practice.filter(x=>factKey(x)!==factKey(q));}
 else{run.helped++;run.chain=0;if(run.tries)progress.mathGame.comebacks++;rememberPractice(q);}
 run.bestChain=Math.max(run.bestChain,run.chain);run.results.push({q,assisted:!independent,wrong:[...run.wrong]});
 if(q.mode==='groups'&&independent)progress.tableFacts[`${q.b}:${q.a}`]=true;
 progress.mathSolved++;
 // Adapt using the underlying level, not the occasional easier/stretch question.
 if(progress.auto&&run.forcedTier===undefined&&q.mode!=='groups'&&!run.deck){const r=progress.records[q.mode]||{tier:progress.startTier,run:0,help:0};progress.records[q.mode]=E.adapt(r,independent);if(q.mode==='add')progress.records[q.mode].tier=Math.min(2,progress.records[q.mode].tier);}
 persist();addStar(1);updateRoundProgress();
 response.innerHTML=`<div class="feedbackbox correct">${q.explain}</div>`;
 response.append(button(run.index===run.length-1?'See results →':'Next question →',()=>{run.index++;nextMath();}));
}
function updateRoundProgress(){const bar=app.querySelector('.round-track');if(bar){const n=run.index+1;bar.setAttribute('aria-valuenow',n);bar.firstElementChild.style.width=`${100*n/run.length}%`;}}
function revealMath(card){if(run.answered)return;run.assisted=true;rememberPractice(run.q);card.querySelector('.help-area').innerHTML=`<div class="helpbox"><b>The answer: ${answerEquation(run.q,run.q.answer)}</b><br>${run.q.explain}<br>Put ${run.q.answer} in the box. You can practise this one again later.</div>`;}
function showMathHelp(card,model){if(run.answered)return;run.assisted=true;rememberPractice(run.q);card.querySelector('.help-area').innerHTML=`<div class="helpbox">${run.q.hint}${model?modelHTML(run.q):''}</div>`;}
function numberBlocks(n){if(n===null)return '<span class="slot">?</span>';return `<div><b>${n}</b><div class="blockgroup">${'<span class="hundred">100</span>'.repeat(Math.floor(n/100))}${'<span class="ten" aria-hidden="true"></span>'.repeat(Math.floor(n%100/10))}${'<span class="one" aria-hidden="true"></span>'.repeat(n%10)}</div></div>`;}
function modelHTML(q){
 if(q.visual.kind==='sequence')return `<p>${q.visual.sequence[0]} → ${q.visual.sequence[1]}<br>What changed?</p>`;
 if(q.mode==='subtract'){const tens=Math.floor(q.b/10)*10,ones=q.b%10;return `<div class="number-line"><b>${q.a}</b>${tens?`<span>− ${tens} →</span><b>${q.a-tens}</b>`:''}<span>− ${ones} →</span><b>?</b></div><p>Take away the tens, then the ones.</p>`;}
 if(q.visual.kind==='groups')return `<div class="blocks" aria-label="${q.a} groups of ${q.b}">${Array.from({length:q.a},()=>`<span class="number-group">${'<i class="groupdot"></i>'.repeat(q.b)}</span>`).join('')}</div>`;
 return `<div class="blocks" aria-label="Numbers shown in hundreds, tens and ones">${numberBlocks(q.a)}<strong>+</strong>${numberBlocks(q.visual.b)}</div><small>A square is 100. A green rod is 10. A gold dot is 1.</small>`;
}
function finishRun(early=false){
 if(run.finished)return;run.finished=true;
 const completed=run.results.length,full=completed===run.length;
 if(full){progress.missions++;if(run.type==='math')progress.mathGame.rounds++;addStar(5);}persist();fresh(run.type==='math'?'maths':'reading');
 const result=el(`<section class="result"><div class="eyebrow">${full?'Round complete':'Practice saved'}</div><h1>${full?'Nice work, Bobby.':'Good practice, Bobby.'}</h1><p>${completed} ${run.type==='math'?'questions':'words'} answered${full?' · 5 bonus stars':''}.</p><div class="round-score"><div><b>${run.independent}</b>First time</div><div><b>${run.helped}</b>With a little help</div></div><div class="tools"></div></section>`);
 const type=run.type,mode=run.mode,table=run.table;
 result.querySelector('.tools').append(button('Another round →',()=>type==='words'?startWords(mode):mode==='mixed'?startMixed(table):run.label==='Tricky sums'?startPractice():startMath(mode,undefined,table)),button(type==='math'?'Choose my maths':'Choose my word test',type==='math'?showMaths:showReading,'secondary'));app.append(result);
 if(type==='math')mathRoundReview(result);else wordRoundReview(result);
}
function startWords(mode='build'){
 const pool=mode==='sentence'?SENTENCES:(level==='reception'?WORDS.slice(0,WORD_SETS.familiar.length):WORDS);
 // Favour unseen and previously missed words, while still shuffling each round.
 const shuffled=shuffle(pool),key=entry=>mode+':'+entry[0];
 shuffled.sort((a,b)=>(progress.wordFacts[key(a)]===true?1:0)-(progress.wordFacts[key(b)]===true?1:0));
 run={type:'words',mode,index:0,length:Math.min(progress.wordLength,pool.length),words:shuffled.slice(0,progress.wordLength),finished:false,independent:0,helped:0,results:[]};wordPuzzle();
}
function wordPuzzle(){
 if(run.index===run.length)return finishRun();fresh('reading');run.answered=false;run.assisted=false;run.wrong=[];playHeader(run.mode==='sentence'?'Finish the sentence':'Build the word');
 if(run.mode==='sentence')return sentencePuzzle();
 const [word,parts,clue]=run.words[run.index];let chosen=[];
 const extras=shuffle(['ai','ee','oa','ar','oi','ou','sh','ch','th','ng','a','e','i','o','u'].filter(p=>!parts.includes(p))).slice(0,2);
 const tiles=shuffle([...parts,...extras].map((p,id)=>({p,id})));
 const card=el(`<section class="playcard word-card"><div class="eyebrow">Read the clue</div><h2>${esc(clue)}</h2><p class="instruction">Build the word. Two tiles are spare.</p><div class="wordslots" aria-label="Your word"></div><div class="tiles"></div><div class="answerrow"></div><div class="tools"></div><div class="response" aria-live="polite"></div></section>`);app.append(card);
 function draw(){card.querySelector('.wordslots').innerHTML=parts.map((_,i)=>`<span class="slot">${chosen[i]?.p||'·'}</span>`).join('');const area=card.querySelector('.tiles');area.innerHTML='';tiles.forEach(t=>{const b=button(t.p,()=>{if(run.answered||chosen.length>=parts.length)return;chosen.push(t);draw();},'tile');b.disabled=run.answered||chosen.some(x=>x.id===t.id);area.append(b);});}
 card.querySelector('.tools').append(button('Hear the word',()=>listen(word),'text-button'),button('Hint',()=>{run.assisted=true;card.querySelector('.response').innerHTML=`<p class="helpbox">It starts with <b>${parts[0]}</b> and uses ${parts.length} tiles.</p>`;},'text-button'));
 card.querySelector('.answerrow').append(button('Undo',()=>{if(!run.answered){chosen.pop();draw();}},'secondary'),button('Check word →',()=>{
 if(run.answered)return;const guess=chosen.map(x=>x.p).join('');if(chosen.length<parts.length){card.querySelector('.response').innerHTML='<p class="feedbackbox try">Fill each space first.</p>';return;}
 if(guess!==word){run.assisted=true;run.wrong.push(guess);card.querySelector('.response').innerHTML='<p class="feedbackbox incorrect">Not quite. Undo a tile and try again.</p>';if(run.wrong.length>=2)card.querySelector('.response').append(button('Show the word',()=>{run.assisted=true;card.querySelector('.response').innerHTML=`<p class="helpbox">${parts.join(' · ')}<br>Have another go at building <b>${word}</b>.</p>`;},'secondary'));return;}
 recordWord(word,clue);draw();card.querySelectorAll('button').forEach(b=>b.disabled=true);wordNext(card,`✓ ${word}`);
 }));draw();
}
function sentencePuzzle(){
 const [sentence,answer,wrong]=run.words[run.index];const card=el(`<section class="playcard word-card"><div class="eyebrow">Choose the missing word</div><h2 class="sentence">${esc(sentence).replace('___','<span class="blank">?</span>')}</h2><div class="choices"></div><div class="tools"></div><div class="response" aria-live="polite"></div></section>`);app.append(card);
 card.querySelector('.tools').append(button('Hear the sentence',()=>listen(sentence.replace('___','blank')),'text-button'));
 for(const choice of shuffle([answer,...wrong])){const b=button(choice,()=>{if(run.answered)return;if(choice!==answer){run.assisted=true;run.wrong.push(choice);b.classList.add('incorrect');b.disabled=true;card.querySelector('.response').innerHTML='<p class="feedbackbox incorrect">Read it again. Which word makes sense?</p>';return;}recordWord(answer,sentence);card.querySelectorAll('button').forEach(x=>x.disabled=true);b.classList.add('selected');wordNext(card,`✓ ${sentence.replace('___',answer)}`);},'choice');card.querySelector('.choices').append(b);}
}
function recordWord(word,clue){
 run.answered=true;run[run.assisted?'helped':'independent']++;run.results.push({word,clue,assisted:run.assisted,wrong:[...run.wrong]});progress.wordsBuilt++;progress.wordFacts[run.mode+':'+run.words[run.index][0]]=!run.assisted;persist();addStar();updateRoundProgress();
}
function wordNext(card,text){card.classList.add('is-solved');const response=card.querySelector('.response');response.innerHTML=`<p class="feedbackbox correct">${esc(text)}</p>`;response.append(button(run.index===run.length-1?'See results →':'Next word →',()=>{run.index++;wordPuzzle();}));}
function wordRoundReview(result){if(!run.results.length)return;const review=el('<section class="round-review"><h2>Your words</h2><ol></ol></section>');run.results.forEach(r=>review.querySelector('ol').append(el(`<li><div class="review-answer ${r.assisted?'helped':'correct'}"><b>${r.assisted?'↻':'✓'} ${esc(r.word)}</b><span>${r.assisted?'With help':'First time'}</span></div>${r.wrong.length?`<p class="earlier-guesses incorrect">Earlier guesses: ${r.wrong.map(esc).join(', ')}</p>`:''}</li>`)));result.append(review);}
function showLab(){fresh('maths');intro('Make your own sum.','Try an answer out loud, then check it.');const card=el('<section class="playcard"><form class="answerbox"><label class="sr-only" for="first">First number</label><input id="first" type="number" min="0" max="999" value="48"><label class="sr-only" for="operation">Operation</label><select id="operation"><option value="+">+</option><option value="-">−</option><option value="*">×</option></select><label class="sr-only" for="second">Second number</label><input id="second" type="number" min="0" max="999" value="48"><button class="primary dark" type="submit">Check →</button></form><div class="response" aria-live="polite"></div></section>');app.append(card);card.querySelector('form').onsubmit=e=>{e.preventDefault();const a=Number(card.querySelector('#first').value),b=Number(card.querySelector('#second').value),op=card.querySelector('select').value;if(![a,b].every(n=>Number.isInteger(n)&&n>=0&&n<=999))return;const answer=op==='+'?a+b:op==='-'?a-b:a*b;card.querySelector('.response').innerHTML=`<div class="question">${a} ${op==='*'?'×':op==='-'?'−':'+'} ${b} = ${answer}</div>`;};}
function showParents(){
 fresh('parents');const box=el(`<section class="settings"><h1>For grown-ups</h1><p>Direct maths and word practice. Existing stars, book progress and table facts stay saved.</p><div class="stats"><div class="stat"><b>${progress.mathSolved}</b><span>Sums solved</span></div><div class="stat"><b>${progress.wordsBuilt}</b><span>Words answered</span></div><div class="stat"><b>${progress.missions}</b><span>Rounds completed</span></div></div><label for="difficulty">Maths starting level</label><select id="difficulty">${E.levels.map((l,i)=>`<option value="${i}" ${progress.startTier===i?'selected':''}>${l} · ${['small numbers','mostly two-digit sums','numbers into the hundreds','up to 1,000'][i]}</option>`).join('')}</select><label for="adaptive">Vary the difficulty</label><select id="adaptive"><option value="yes" ${progress.auto?'selected':''}>Yes, mix easier and trickier questions</option><option value="no" ${!progress.auto?'selected':''}>No, keep my chosen level</option></select><p>Most questions practise the current level. Easier questions are mixed in, with an occasional stretch. Other skills move up after five first-time answers, and two helped answers ease them down. Addition stays mostly at its starting level, with easier sums and occasional stretches up to 200. Choose “Big numbers” with a fixed level for larger addition. Subtraction now includes taking away tens and hundreds. No negative answers in tests.</p><label for="readingLevel">Word building</label><select id="readingLevel"><option value="reception" ${level==='reception'?'selected':''}>Familiar words · 30 words</option><option value="year1" ${level==='year1'?'selected':''}>Full word mix · 80 words</option></select><p>Two word tests: spelling tiles and missing words in sentences. Results distinguish first-time answers from retries and hints. Words needing practice are prioritised in future rounds.</p><h2>Saved on this device</h2><p>Each answer saves immediately. “Finish here” stops a round whenever he wants. Completed rounds earn five bonus stars. No timers, lives, missions or unlocks. Progress stays in this browser. It does not sync between devices. If storage is blocked, it lasts until the page closes.</p><p>Whole-word audio uses the device’s voice. It does not assess spoken reading or teach isolated phoneme pronunciation. Original books and sound cards remain in Books.</p></section>`);app.append(box);
 box.querySelector('#difficulty').onchange=e=>{progress.startTier=Number(e.target.value);progress.records={};persist();};box.querySelector('#adaptive').onchange=e=>{progress.auto=e.target.value==='yes';persist();};box.querySelector('#readingLevel').onchange=e=>{level=e.target.value;save();};
}
const originalBook=showBook;
showBook=function(book,page){if(page===-1&&progress.bookmarks[book.id]>0){originalBook(book,-1);app.append(button(`Continue from page ${progress.bookmarks[book.id]+1} →`,()=>showBook(book,progress.bookmarks[book.id])));return;}if(page>=0){progress.bookmarks[book.id]=page;persist();}originalBook(book,page);};
const originalFinish=showFinish;
showFinish=function(book){delete progress.bookmarks[book.id];persist();originalFinish(book);};
persist();showHome();
