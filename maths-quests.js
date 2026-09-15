/* Saved practice and results, retaining the existing local progress keys. */
function factKey(q){return q.mode+':'+q.prompt;}
function rememberPractice(q){if(!progress.practice.some(x=>factKey(x)===factKey(q)))progress.practice.push(q);progress.practice=progress.practice.slice(-60);persist();}
function startPractice(){const deck=shuffle(progress.practice).slice(0,progress.roundLength);if(!deck.length)return showMaths();startMath(deck[0].mode,undefined,'all',deck,'Tricky sums');}
function tableScore(n){return Array.from({length:12},(_,i)=>progress.tableFacts[`${n}:${i+1}`]?1:0).reduce((a,b)=>a+b,0);}
function tablePassport(){
 const details=el('<details class="table-progress"><summary>See my times-table progress</summary><p>A fact fills in when you answer it first time, without a hint.</p><div class="passport-grid"></div></details>');
 for(let n=1;n<=12;n++)details.querySelector('.passport-grid').append(el(`<article class="passport"><b>${n} times table <span>${tableScore(n)}/12</span></b><div class="fact-lights">${Array.from({length:12},(_,i)=>`<span class="${progress.tableFacts[`${n}:${i+1}`]?'lit':''}" title="${i+1} × ${n} = ${(i+1)*n}">${i+1}</span>`).join('')}</div></article>`));app.append(details);
}
function mathRoundReview(result){
 if(!run.results.length)return;
 const review=el('<section class="round-review"><h2>Your answers</h2><p>Green: first time. Amber: worked out with help.</p><ol></ol></section>');
 run.results.forEach(r=>review.querySelector('ol').append(el(`<li><div class="review-answer ${r.assisted?'helped':'correct'}"><b>${r.assisted?'↻':'✓'} ${answerEquation(r.q,r.q.answer)}</b><span>${r.assisted?'With help':'First time'}</span></div>${r.wrong.length?`<div class="earlier-guesses incorrect">Earlier guesses: ${r.wrong.join(', ')}</div>`:''}<details><summary>How to work it out</summary><p>${r.q.explain}</p></details></li>`)));
 if(run.results.some(r=>r.assisted))review.append(button('Try my tricky sums again →',startPractice));result.append(review);
}
