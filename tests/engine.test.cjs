const {test}=require('node:test');const assert=require('node:assert/strict');const E=require('../engine.js');
test('maths questions have correct answers and explanations across 24,000 samples',()=>{
for(const mode of Object.keys(E.modes))for(let tier=0;tier<4;tier++)for(let i=0;i<1000;i++){
const q=E.question(mode,tier,Math.random,i);assert.ok(Number.isInteger(q.answer)&&q.answer>=0);assert.ok(q.hint&&q.explain&&q.spoken);
if(mode==='doubles'||mode==='add')assert.equal(q.answer,q.a+q.b);
if(mode==='subtract')assert.equal(q.answer,q.a-q.b);
if(mode==='missing')assert.equal(q.answer,q.b);
if(mode==='groups')assert.equal(q.answer,q.visual.share?q.b:q.a*q.b);
if(mode==='patterns'){const s=q.visual.sequence;assert.equal(q.answer,s[3]+s[1]-s[0]);assert.equal(s[2]-s[1],s[1]-s[0]);}
}});
test('requested 48 plus 48 opening puzzle',()=>assert.equal(E.question('doubles',1).answer,96));
test('difficulty rises after three independent successes, falls after two assisted questions and stays in bounds',()=>{
let r={tier:1,run:0,help:0};for(let i=0;i<3;i++)r=E.adapt(r,true);assert.equal(r.tier,2);r=E.adapt(r,false);assert.equal(r.tier,2);r=E.adapt(r,false);assert.equal(r.tier,1);for(let i=0;i<30;i++)r=E.adapt(r,false);assert.equal(r.tier,0);for(let i=0;i<30;i++)r=E.adapt(r,true);assert.equal(r.tier,3);
});
