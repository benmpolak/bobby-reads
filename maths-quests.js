/* Mission map, learning history and rewards. Uses the existing local progress save. */
const PLANETS=[{name:'Mint Moon',colour:'#85cdb1',symbol:'☾',story:'Deliver moon mail to Pip.'},{name:'Amber Dunes',colour:'#e7b24f',symbol:'◈',story:'Find the buried star crystals.'},{name:'Blue Lagoon',colour:'#80c8df',symbol:'≈',story:'Light the underwater station.'},{name:'Violet Rings',colour:'#bca4e8',symbol:'◎',story:'Repair the rings of the space station.'},{name:'Coral Comet',colour:'#eeab8e',symbol:'☄',story:'Help a comet find its way home.'},{name:'Star Garden',colour:'#b7ce7f',symbol:'✦',story:'Grow a garden of glowing stars.'}];
function factKey(q){return q.mode+':'+q.prompt;}
function rememberPractice(q){if(!progress.practice.some(x=>factKey(x)===factKey(q)))progress.practice.push(q);progress.practice=progress.practice.slice(-60);persist();}
function startPractice(){const deck=shuffle(progress.practice).slice(0,10);if(!deck.length)return showMaths();startMath(deck[0].mode,undefined,2,deck,'Fix-it flight');}
function startPlanet(){
 const modes=['add','doubles','groups','bonds','add','money','groups','doubles','subtract','add'];
 const deck=modes.map((mode,i)=>E.question(mode,mode==='subtract'?0:progress.records[mode]?.tier??progress.startTier,Math.random,i));
 startMath('add',undefined,2,deck,'Planet mission');
}
function currentPlanet(){return PLANETS[Math.floor(progress.mathGame.rounds/3)%PLANETS.length];}
function mathMissionHub(){
 const rounds=progress.mathGame.rounds,planet=currentPlanet(),leg=rounds%3;
 const hub=el(`<section class="mission-hub"><div class="mission-copy"><div class="eyebrow">Expedition ${Math.floor(rounds/18)+1} · Your next discovery</div><h2>${planet.name}</h2><p>${planet.story}</p><div class="mission-seals" aria-label="${leg} of 3 missions complete">${[0,1,2].map(i=>`<span class="${i<leg?'filled':''}">${i<leg?'✓':'★'}</span>`).join('')}<b>${3-leg} more maths ${3-leg===1?'mission':'missions'} to land</b></div></div><div class="planet-art" style="--planet:${planet.colour}" aria-hidden="true"><span>${planet.symbol}</span><i>✦</i></div></section>`);
 hub.querySelector('.mission-copy').append(button('Launch planet mission →',startPlanet));app.append(hub);
 const row=el('<div class="quest-actions"></div>');
 row.append(button(`<b>↻ Fix-it flight</b><span>${progress.practice.length?`${progress.practice.length} puzzles to practise again`:'No puzzles waiting. Ready for a new adventure.'}</span>`,startPractice,'quest-action'));
 row.firstElementChild.disabled=!progress.practice.length;
 row.append(button(`<b>✦ My discoveries</b><span>${Math.min(6,Math.floor(rounds/3))} planets · ${mathBadges().filter(b=>b.won).length} badges earned</span>`,showDiscoveries,'quest-action'));
 app.append(row);app.append(el('<div class="section-title"><h2>Pick your own mission</h2><span>Every maths round moves you closer.</span></div>'));
}
function missionFlight(card){
 let panel=card.querySelector('.flight-meter');if(!panel){panel=el('<div class="flight-meter" aria-live="polite"></div>');card.prepend(panel);}
 const solved=run.index+(run.answered?1:0),planet=currentPlanet();
 panel.innerHTML=`<div class="flight-label"><b>${run.label==='Fix-it flight'?'Repairing the rocket':planet.story}</b><span>${solved}/${run.length} fuel cells</span></div><div class="fuel-track" role="progressbar" aria-label="Mission fuel" aria-valuemin="0" aria-valuemax="${run.length}" aria-valuenow="${solved}"><span style="width:${100*solved/run.length}%"></span></div><small>${run.chain>=3?`★ ${run.chain} first-time answers in a row`:'Each solved puzzle adds fuel. Take your time.'}</small>`;
}
function mathBadges(){const g=progress.mathGame,complete=Array.from({length:12},(_,i)=>tableScore(i+1)).filter(n=>n===12).length;return [
 {name:'First launch',icon:'↑',won:g.rounds>=1,desc:'Finish a maths mission.'},
 {name:'Good comeback',icon:'↻',won:g.comebacks>=1,desc:'Solve a puzzle after a wrong answer.'},
 {name:'Triple spark',icon:'ϟ',won:g.bestChain>=3,desc:'Answer 3 in a row first time.'},
 {name:'Perfect ten',icon:'10',won:g.bestChain>=10,desc:'Answer 10 in a row first time.'},
 {name:'Number explorer',icon:'50',won:g.first>=50,desc:'Answer 50 puzzles without help.'},
 {name:'Century club',icon:'100',won:g.first>=100,desc:'Answer 100 puzzles without help.'},
 {name:'Table collector',icon:'×',won:complete>=1,desc:'Collect all 12 facts in one table.'},
 {name:'Space captain',icon:'✦',won:g.rounds>=18,desc:'Discover all six planets.'}
 ];}
function tableScore(n){return Array.from({length:12},(_,i)=>progress.tableFacts[`${n}:${i+1}`]?1:0).reduce((a,b)=>a+b,0);}
function tablePassport(){
 app.append(el('<div class="section-title"><h2>My table passport</h2></div><p class="hint">Light up a fact by answering it without a hint or retry. A full table has 12 different facts.</p>'));
 const grid=el('<div class="passport-grid"></div>');
 for(let n=1;n<=12;n++){
 const cell=el(`<article class="passport"><b>${n} times table <span>${tableScore(n)}/12</span></b><div class="fact-lights">${Array.from({length:12},(_,i)=>`<span class="${progress.tableFacts[`${n}:${i+1}`]?'lit':''}" title="${i+1} × ${n} = ${(i+1)*n}" aria-label="${i+1} times ${n}: ${progress.tableFacts[`${n}:${i+1}`]?'collected':'to practise'}">${i+1}</span>`).join('')}</div></article>`);
 cell.append(button('Practise ×'+n,()=>startMath('groups',undefined,n),'secondary'));grid.append(cell);
 }app.append(grid);
}
function showDiscoveries(){fresh('maths');intro('My discoveries','Planets you have visited. Badges you have earned.');showMathCollection();app.append(button('Back to maths',showMaths,'secondary'));}
function showMathCollection(){
 app.append(el('<div class="section-title"><h2>Planet collection</h2><span>One landing every three maths missions</span></div>'));
 const trail=el('<div class="planet-collection"></div>');PLANETS.forEach((p,i)=>{const won=progress.mathGame.rounds>=(i+1)*3;trail.append(el(`<article class="planet-reward ${won?'earned':''}"><div style="--planet:${p.colour}">${p.symbol}</div><h3>${p.name}</h3><p>${won?'✓ Discovered':`${(i+1)*3-progress.mathGame.rounds} more missions`}</p></article>`));});app.append(trail);
 app.append(el('<div class="section-title"><h2>My maths badges</h2></div>'));const badges=el('<div class="badge-grid"></div>');mathBadges().forEach(b=>badges.append(el(`<article class="math-badge ${b.won?'earned':''}"><span>${b.icon}</span><div><h3>${b.name}</h3><p>${b.won?'✓ Earned · ':''}${b.desc}</p></div></article>`)));app.append(badges);
}
function mathRoundReview(result){
 const rounds=progress.mathGame.rounds,landed=rounds%3===0?PLANETS[(Math.floor(rounds/3)-1)%6]:null;
 const score=el(`<div class="round-score"><div><b>${run.independent}</b>First time</div><div><b>${run.helped}</b>Worked out with help</div><div><b>${run.bestChain}</b>Best chain</div></div>`);result.querySelector('.tools').before(score);
 const newBadges=mathBadges().filter(b=>b.won&&!run.badgesBefore.includes(b.name));
 if(newBadges.length)score.after(el(`<div class="new-badges" aria-live="polite"><b>New badges!</b> ${newBadges.map(b=>`<span>${b.icon} ${b.name}</span>`).join('')}</div>`));
 if(landed)score.after(el(`<div class="landing-banner"><span style="--planet:${landed.colour}">${landed.symbol}</span><div><b>You landed on ${landed.name}!</b><p>Your next planet is waiting.</p></div></div>`));
 const review=el('<section class="round-review"><h2>Your mission log</h2><p>Green ticks: first time. Amber arrows: worked out with help. Red crosses show your earlier guesses.</p><ol></ol></section>');
 run.results.forEach(r=>review.querySelector('ol').append(el(`<li><div class="review-answer ${r.assisted?'helped':'correct'}"><b>${r.assisted?'↻':'✓'} ${answerEquation(r.q,r.q.answer)}</b><span>${r.assisted?'Solved with help':'First time'}</span></div>${r.wrong.length?`<div class="earlier-guesses incorrect">✗ Your ${r.wrong.length===1?'guess':'guesses'}: ${r.wrong.join(', ')}${r.q.mode==='money'?'p':''}</div>`:''}<details><summary>How to work it out</summary><p>${r.q.explain}</p></details></li>`)));
 if(run.results.some(r=>r.assisted))review.append(button('Try my tricky ones again →',startPractice,'primary dark'));
 review.append(button('See my discoveries',showDiscoveries,'secondary'));result.append(review);
}
