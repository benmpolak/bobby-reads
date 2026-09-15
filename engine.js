/* Pure question generation and progression; shared with the test runner. */
(function(root){
const levels=['Warm up','Tricky','Hard','Big numbers'];
const modes={bonds:{name:'Number bonds',symbol:'100',description:'Find the missing number to make 10, 20 or 100.',colour:'yellow'},money:{name:'Pocket money',symbol:'p',description:'Add two prices. Work out the total.',colour:'orange'},doubles:{name:'Double trouble',symbol:'×2',description:'48 + 48? Let’s find out.',colour:'orange'},add:{name:'Addition',symbol:'+',description:'Add bigger numbers and cross the tens.',colour:'mint'},subtract:{name:'Subtraction',symbol:'−',description:'Take away tens and hundreds. Try a harder one.',colour:'purple'},missing:{name:'Secret numbers',symbol:'?',description:'Crack the missing number.',colour:'yellow'},patterns:{name:'Number patterns',symbol:'…',description:'Find the rule. Keep it going.',colour:'purple'},groups:{name:'Times tables',symbol:'×',description:'Pick a table and practise multiplying.',colour:'mint'}};
function integer(a,b,rng){return a+Math.floor(rng()*(b-a+1));}
function question(mode,tier=1,rng=Math.random,index=0){
 tier=Math.max(0,Math.min(3,tier)); const rand=(a,b)=>integer(a,b,rng); let a,b,answer,prompt,hint,explain,visual,spoken;
 const max=[10,50,100,500][tier];
 if(mode==='bonds'){
 const target=[10,20,100,100][tier];a=rand(1,target-1);b=target-a;answer=b;prompt=`${a} + ? = ${target}`;
 hint=`Start at ${a}. Count up to ${target}.`;explain=`${a} + ${b} = ${target}. The two parts make a whole.`;visual={kind:'parts',a,b:null};
 }else if(mode==='money'){
 a=rand(1,[9,30,50,99][tier]);b=rand(1,[9,30,50,99][tier]);answer=a+b;prompt=`${a}p + ${b}p`;
 hint=`Add the pennies. Try adding ${b} to ${a} in small steps.`;explain=`${a}p + ${b}p = ${answer}p. That is the total price.`;visual={kind:'parts',a,b};spoken=`A pencil costs ${a} pence. A notebook costs ${b} pence. How many pence altogether?`;
 }else if(mode==='doubles'){
 a=tier===1&&index===0?48:rand(tier?11:2,max); b=a; answer=a+b;prompt=`${a} + ${a}`;
 const unit=tier===3?100:10, big=Math.floor(a/unit)*unit,small=a%unit;
 hint=big?`Split ${a} into ${big} and ${small}. Double each part, then put them together.`:`Make two equal groups of ${a}. Count them together.`;
 explain=big?`${big} + ${big} = ${big*2}. ${small} + ${small} = ${small*2}. Together: ${answer}.`:`Two groups of ${a} make ${answer}.`;
 visual={kind:'parts',a,b};
 } else if(mode==='subtract'){
 a=rand([5,21,51,201][tier],[20,100,200,1000][tier]);
 b=rand(tier?10:1,a);
 // Every other stretch question crosses a ten, where such a subtraction exists.
 if(tier&&index%2===0){const candidates=Array.from({length:a-9},(_,i)=>i+10).filter(n=>n%10>a%10);if(candidates.length)b=candidates[rand(0,candidates.length-1)];}
 answer=a-b;prompt=`${a} − ${b}`;
 const tens=Math.floor(b/10)*10,ones=b%10;
 hint=tens?`Split ${b} into ${tens} and ${ones}. Take away ${tens}, then ${ones}.`:`Start at ${a} and count back ${b}.`;
 explain=tens?`${a} − ${tens} = ${a-tens}. Then ${a-tens} − ${ones} = ${answer}.`:`${a} take away ${b} leaves ${answer}.`;
 visual={kind:'subtract',a,b};
 } else if(mode==='add'||mode==='missing'){
 a=rand(tier?10:2,max); b=rand(1,max);
 if(mode==='missing'){answer=b;prompt=`${a} + ? = ${a+b}`;hint=`Start at ${a}. How much more gets you to ${a+b}?`;explain=`${a+b} − ${a} = ${b}, so the secret number is ${b}.`;}
 else {answer=a+b;prompt=`${a} + ${b}`;hint=`Split ${b} into ${Math.floor(b/10)*10} and ${b%10}. Add each part to ${a}.`;explain=`${a} + ${Math.floor(b/10)*10} = ${a+Math.floor(b/10)*10}. Add ${b%10} to get ${answer}.`;}
 visual={kind:'parts',a,b:mode==='missing'?null:b};
 }else if(mode==='patterns'){
 const step=[rand(1,3),[2,5,10][rand(0,2)],rand(3,12),rand(12,50)][tier]; a=rand(0,max);const down=tier>1&&rng()>.5;if(down)a+=4*step;
 const sign=down?-1:1;const sequence=Array.from({length:4},(_,i)=>a+i*step*sign);answer=a+4*step*sign;prompt=sequence.join(' , ')+' , ?';
 hint=`Compare the first two numbers. Is the pattern going up or down? By how much?`;explain=`${down?'Subtract':'Add'} ${step} each time. The next number is ${answer}.`;visual={kind:'sequence',sequence};
 }else if(mode==='groups'){
 a=rand(1,12); b=rand(1,12);answer=a*b;prompt=`${a} × ${b}`;
 spoken=`${a} times ${b}. What is the answer?`;
 hint=`Count in ${b}s, ${a} times.`;explain=`${a} groups of ${b} make ${answer}.`;visual={kind:'groups',a,b};
 }else throw new Error('Unknown maths mode');
 return {mode,tier,a,b,answer,prompt,hint,explain,visual,spoken:spoken||prompt.replace('−','minus').replace('+','plus').replace('?','what number').replace('=','equals')};
}
function shuffled(list,rng){const out=[...list];for(let i=out.length-1;i>0;i--){const j=integer(0,i,rng);[out[i],out[j]]=[out[j],out[i]];}return out;}
function tableQuestion(a,b){return {mode:'groups',tier:0,a,b,answer:a*b,prompt:`${a} × ${b}`,spoken:`${a} times ${b}. What is the answer?`,hint:`Count in ${b}s, ${a} times.`,explain:`${a} groups of ${b} make ${a*b}.`,visual:{kind:'groups',a,b}};}
function tableRound(table='all',rng=Math.random,length){
 const tables=table==='all'?Array.from({length:12},(_,i)=>i+1):table==='mixed'?[2,5,10]:table==='hard'?[3,4,6,7,8,9,11,12]:[Number(table)];
 if(tables.some(n=>!Number.isInteger(n)||n<1||n>12))throw new Error('Choose a table from 1 to 12');
 const count=length??(tables.length===1?12:24);
 const pools=new Map(tables.map(b=>[b,shuffled(Array.from({length:12},(_,i)=>i+1),rng)]));
 const deck=[];
 // Balanced passes include every selected table before any gets another question.
 while(deck.length<count)for(const b of shuffled(tables,rng)){
  if(deck.length===count)break;
  if(!pools.get(b).length)pools.set(b,shuffled(Array.from({length:12},(_,i)=>i+1),rng));
  deck.push(tableQuestion(pools.get(b).pop(),b));
 }
 return deck;
}
function mixedModes(kind='all',length=20,rng=Math.random){
 const modes=kind==='sums'?['add','subtract']:['add','subtract','groups'];
 const deck=[];
 while(deck.length<length)deck.push(...shuffled(modes,rng));
 return deck.slice(0,length);
}
function adapt(record,independent){const r={tier:1,run:0,help:0,...record}; if(independent){r.run++;r.help=0;if(r.run>=5){r.tier=Math.min(3,r.tier+1);r.run=0;}}else{r.run=0;r.help++;if(r.help>=2){r.tier=Math.max(0,r.tier-1);r.help=0;}}return r;}
const api={levels,modes,question,adapt,tableRound,mixedModes};if(typeof module!=='undefined')module.exports=api;else root.BobbyEngine=api;
})(typeof window!=='undefined'?window:globalThis);
