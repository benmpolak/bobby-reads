/* Pure question generation and progression; shared with the test runner. */
(function(root){
const levels=['Warm up','Explorer','Challenger','Cosmic'];
const modes={doubles:{name:'Double trouble',symbol:'×2',description:'48 + 48? Let’s find out.',colour:'orange'},add:{name:'Rocket sums',symbol:'+',description:'Fuel up with addition.',colour:'mint'},subtract:{name:'Moon takeaways',symbol:'−',description:'What is left on the moon?',colour:'purple'},missing:{name:'Secret numbers',symbol:'?',description:'Crack the missing number.',colour:'yellow'},patterns:{name:'Pattern planet',symbol:'…',description:'Find the rule. Keep it going.',colour:'purple'},groups:{name:'Alien teams',symbol:'×',description:'Equal groups and fair shares.',colour:'mint'}};
function integer(a,b,rng){return a+Math.floor(rng()*(b-a+1));}
function question(mode,tier=1,rng=Math.random,index=0){
 tier=Math.max(0,Math.min(3,tier)); const rand=(a,b)=>integer(a,b,rng); let a,b,answer,prompt,hint,explain,visual,spoken;
 const max=[10,50,100,500][tier];
 if(mode==='doubles'){
 a=tier===1&&index===0?48:rand(tier?11:2,max); b=a; answer=a+b;prompt=`${a} + ${a}`;
 const unit=tier===3?100:10, big=Math.floor(a/unit)*unit,small=a%unit;
 hint=big?`Split ${a} into ${big} and ${small}. Double each part, then put them together.`:`Make two equal groups of ${a}. Count them together.`;
 explain=big?`${big} + ${big} = ${big*2}. ${small} + ${small} = ${small*2}. Together: ${answer}.`:`Two groups of ${a} make ${answer}.`;
 visual={kind:'parts',a,b};
 } else if(mode==='add'||mode==='subtract'||mode==='missing'){
 a=rand(tier?10:2,max); b=rand(1,max); if(mode==='subtract'&&b>a)[a,b]=[b,a];
 if(mode==='subtract'){answer=a-b;prompt=`${a} − ${b}`;hint=`Take away ${Math.floor(b/10)*10} first, then take away ${b%10}.`;explain=`${a} − ${b} = ${answer}. Check it: ${answer} + ${b} = ${a}.`;}
 else if(mode==='missing'){answer=b;prompt=`${a} + ? = ${a+b}`;hint=`Start at ${a}. How much more gets you to ${a+b}?`;explain=`${a+b} − ${a} = ${b}, so the secret number is ${b}.`;}
 else {answer=a+b;prompt=`${a} + ${b}`;hint=`Split ${b} into ${Math.floor(b/10)*10} and ${b%10}. Add each part to ${a}.`;explain=`${a} + ${Math.floor(b/10)*10} = ${a+Math.floor(b/10)*10}. Add ${b%10} to get ${answer}.`;}
 visual={kind:'parts',a,b:mode==='missing'?null:b};
 }else if(mode==='patterns'){
 const step=[rand(1,3),[2,5,10][rand(0,2)],rand(3,12),rand(12,50)][tier]; a=rand(0,max);const down=tier>1&&rng()>.5;if(down)a+=4*step;
 const sign=down?-1:1;const sequence=Array.from({length:4},(_,i)=>a+i*step*sign);answer=a+4*step*sign;prompt=sequence.join(' , ')+' , ?';
 hint=`Compare the first two numbers. Is the pattern going up or down? By how much?`;explain=`${down?'Subtract':'Add'} ${step} each time. The next number is ${answer}.`;visual={kind:'sequence',sequence};
 }else if(mode==='groups'){
 a=rand(2,[3,5,9,12][tier]); b=rand(2,[5,10,12,20][tier]);const share=rng()>.5;
 answer=share?b:a*b;prompt=share?`${a*b} ÷ ${a}`:`${a} × ${b}`;spoken=share?`${a*b} moon rocks shared equally between ${a} aliens. How many each?`:`${a} aliens have ${b} moon rocks each. How many rocks altogether?`;
 hint=share?`Share ${a*b} rocks into ${a} equal groups. You can count in ${a}s.`:`Count in ${b}s, ${a} times.`;explain=`${a} equal groups of ${b} make ${a*b}. ${share?`Each alien gets ${b}.`:''}`;visual={kind:'groups',a,b,share};
 }else throw new Error('Unknown maths mode');
 return {mode,tier,a,b,answer,prompt,hint,explain,visual,spoken:spoken||prompt.replace('−','minus').replace('+','plus').replace('?','what number').replace('=','equals')};
}
function adapt(record,independent){const r={tier:1,run:0,help:0,...record}; if(independent){r.run++;r.help=0;if(r.run>=3){r.tier=Math.min(3,r.tier+1);r.run=0;}}else{r.run=0;r.help++;if(r.help>=2){r.tier=Math.max(0,r.tier-1);r.help=0;}}return r;}
const api={levels,modes,question,adapt};if(typeof module!=='undefined')module.exports=api;else root.BobbyEngine=api;
})(typeof window!=='undefined'?window:globalThis);
