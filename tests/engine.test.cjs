const {test}=require('node:test');const assert=require('node:assert/strict');const E=require('../engine.js');
function rng(seed=42){return()=>{seed=(1664525*seed+1013904223)>>>0;return seed/2**32;};}
test('32,000 generated questions have valid arithmetic and useful explanations',()=>{
 const random=rng();for(const mode of Object.keys(E.modes))for(let tier=0;tier<4;tier++)for(let i=0;i<1000;i++){
 const q=E.question(mode,tier,random,i);assert.ok(Number.isInteger(q.answer)&&q.answer>=0);assert.ok(q.hint&&q.explain&&q.spoken);
 if(['doubles','add','money'].includes(mode))assert.equal(q.answer,q.a+q.b);
 if(mode==='subtract'){assert.equal(q.answer,q.a-q.b);assert.ok(q.a<=[20,100,200,1000][tier]);assert.ok(q.b>=(tier?10:1));}
 if(mode==='missing')assert.equal(q.answer,q.b);
 if(mode==='groups'){assert.equal(q.answer,q.a*q.b);assert.ok(q.b>=1&&q.b<=12);}
 if(mode==='bonds')assert.equal(q.a+q.answer,[10,20,100,100][tier]);
 if(mode==='patterns'){const s=q.visual.sequence;assert.equal(q.answer,s[3]+s[1]-s[0]);assert.equal(s[2]-s[1],s[1]-s[0]);}
 }
});
test('harder subtraction includes crossing tens and three-digit numbers, without negative answers',()=>{
 const random=rng(12);for(let tier=1;tier<=3;tier++){const deck=Array.from({length:100},(_,i)=>E.question('subtract',tier,random,i));assert.ok(deck.filter(q=>q.b%10>q.a%10).length>=40);assert.ok(deck.every(q=>q.b>=10));if(tier===3)assert.ok(deck.every(q=>q.a>=201));}
});
test('difficulty moves gradually after five independent answers and eases after two helped questions',()=>{
 let r={tier:1,run:0,help:0};for(let i=0;i<4;i++)r=E.adapt(r,true);assert.equal(r.tier,1);r=E.adapt(r,true);assert.equal(r.tier,2);r=E.adapt(r,false);assert.equal(r.tier,2);r=E.adapt(r,false);assert.equal(r.tier,1);for(let i=0;i<50;i++)r=E.adapt(r,true);assert.equal(r.tier,3);for(let i=0;i<50;i++)r=E.adapt(r,false);assert.equal(r.tier,0);
});
test('individual tables contain all 12 facts and mixed rounds cover every selected table evenly',()=>{
 const random=rng(123);for(const table of [...Array.from({length:12},(_,i)=>i+1),'mixed','hard','all'])for(let i=0;i<20;i++){
 const deck=E.tableRound(table,random);const isSingle=typeof table==='number';assert.equal(deck.length,isSingle?12:24);assert.equal(new Set(deck.map(q=>q.prompt)).size,deck.length);
 const selected=isSingle?[table]:table==='all'?Array.from({length:12},(_,i)=>i+1):table==='hard'?[3,4,6,7,8,9,11,12]:[2,5,10];
 assert.deepEqual([...new Set(deck.map(q=>q.b))].sort((a,b)=>a-b),selected);for(const n of selected)assert.equal(deck.filter(q=>q.b===n).length,deck.length/selected.length);
 for(const q of deck){assert.equal(q.answer,q.a*q.b);assert.ok(q.a>=1&&q.a<=12);assert.doesNotMatch(q.prompt+q.spoken,/÷|divide|share/i);}
 }
 for(const table of [0,13,'oops'])assert.throws(()=>E.tableRound(table));
});
test('mixed maths always balances addition, subtraction and tables, at every round length',()=>{
 for(const kind of ['all','sums'])for(const length of [10,20,30])for(let i=0;i<100;i++){
 const deck=E.mixedModes(kind,length,rng(i));assert.equal(deck.length,length);const counts=['add','subtract',...(kind==='all'?['groups']:[])].map(m=>deck.filter(x=>x===m).length);assert.ok(Math.max(...counts)-Math.min(...counts)<=1);if(kind==='sums')assert.ok(!deck.includes('groups'));
 }
});
