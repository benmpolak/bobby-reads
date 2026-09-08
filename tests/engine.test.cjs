const {test}=require('node:test');const assert=require('node:assert/strict');const E=require('../engine.js');
test('maths questions have correct answers and explanations across 32,000 samples',()=>{
for(const mode of Object.keys(E.modes))for(let tier=0;tier<4;tier++)for(let i=0;i<1000;i++){
const q=E.question(mode,tier,Math.random,i);assert.ok(Number.isInteger(q.answer)&&q.answer>=0);assert.ok(q.hint&&q.explain&&q.spoken);
if(mode==='doubles'||mode==='add')assert.equal(q.answer,q.a+q.b);
if(mode==='subtract')assert.equal(q.answer,q.a-q.b);
if(mode==='missing')assert.equal(q.answer,q.b);
if(mode==='groups')assert.equal(q.answer,q.a*q.b);
if(mode==='patterns'){const s=q.visual.sequence;assert.equal(q.answer,s[3]+s[1]-s[0]);assert.equal(s[2]-s[1],s[1]-s[0]);}
}});
test('requested 48 plus 48 opening puzzle',()=>assert.equal(E.question('doubles',1).answer,96));
test('difficulty rises after three independent successes, falls after two assisted questions and stays in bounds',()=>{
let r={tier:1,run:0,help:0};for(let i=0;i<3;i++)r=E.adapt(r,true);assert.equal(r.tier,2);r=E.adapt(r,false);assert.equal(r.tier,2);r=E.adapt(r,false);assert.equal(r.tier,1);for(let i=0;i<30;i++)r=E.adapt(r,false);assert.equal(r.tier,0);for(let i=0;i<30;i++)r=E.adapt(r,true);assert.equal(r.tier,3);
});

test('times-table rounds cover every selectable table without division or repeated questions',()=>{
 for(const table of [...Array.from({length:12},(_,i)=>i+1),'mixed','all'])for(let i=0;i<20;i++){
  const deck=E.tableRound(table);assert.equal(deck.length,10);if(table==='all')assert.equal(new Set(deck.map(q=>q.b)).size,10);assert.equal(new Set(deck.map(q=>q.prompt)).size,10);
  for(const q of deck){assert.equal(q.answer,q.a*q.b);assert.ok(q.a>=1&&q.a<=12);if(table==='mixed')assert.ok([2,5,10].includes(q.b));else if(table==='all')assert.ok(q.b>=1&&q.b<=12);else assert.equal(q.b,table);assert.doesNotMatch(q.prompt+q.spoken,/÷|divide|share/i);}
 }
 for(const table of [0,13,'oops'])assert.throws(()=>E.tableRound(table));
});
test('subtraction always stays within ten and removes only one to three',()=>{
 for(let tier=0;tier<4;tier++)for(let i=0;i<500;i++){
  const q=E.question('subtract',tier);assert.ok(q.a<=10&&q.a>=2);assert.ok(q.b>=1&&q.b<=3&&q.b<=q.a);assert.equal(q.answer,q.a-q.b);assert.equal(q.visual.kind,'takeaway');
 }
});
test('number bonds and money questions preserve totals and units at every level',()=>{
 for(let tier=0;tier<4;tier++)for(let i=0;i<1000;i++){
  const b=E.question('bonds',tier);assert.equal(b.a+b.answer,[10,20,100,100][tier]);assert.equal(b.visual.b,null);assert.ok(b.answer>0);
  const m=E.question('money',tier);assert.equal(m.answer,m.a+m.b);assert.match(m.prompt,/^\d+p \+ \d+p$/);assert.match(m.explain,new RegExp('= '+m.answer+'p'));assert.ok(m.answer<=198);
 }
});
