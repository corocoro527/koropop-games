/* Love64 TWO HEARTS: six-question, original interactive relationship conversation game */
(function(){
'use strict';
const questions=[
 {title:'どっちが先に「会いたい」って言いそう？',hint:'言ってほしいタイミングや言葉、二人で話してみよう。',metric:d=>(['SD','AD'].includes(d.sub)?3:1)+(d.base[0]==='E'?1:0)},
 {title:'どっちがちょっぴり嫉妬しやすそう？',hint:'嫉妬と愛情の強さは別。気になったときの安心の仕方を共有してみよう。',metric:d=>(['AD','AW'].includes(d.sub)?3:1)+(d.base[2]==='F'?1:0)},
 {title:'デートの予定、どっちが考えそう？',hint:'次の休日は、いつもと逆の人が行き先を決めてみる？',metric:d=>(['SD','AD'].includes(d.sub)?2:0)+(d.base[3]==='J'?2:0)},
 {title:'喧嘩したあと先に声をかけるのは？',hint:'すぐ話す派と一度考える派。どれくらい待ってほしいか聞いてみよう。',metric:d=>(['SD','AD'].includes(d.sub)?2:0)+(d.base[0]==='E'?1:0)},
 {title:'どっちがサプライズを仕掛けそう？',hint:'得意不得意はあっても、どんな気遣いがうれしいかは話せる。',metric:d=>(d.base[0]==='E'?2:0)+(d.base[3]==='P'?2:0)},
 {title:'好きな気持ちを言う前に悩みそうなのは？',hint:'照れくさい時はどう伝える？ 言いやすい言葉を考えてみよう。',metric:d=>(['SW','AW'].includes(d.sub)?2:0)+(d.base[0]==='I'?1:0)}
];
const choices=[['me','自分'],['you','相手'],['both','ふたりとも'],['neither','どちらでもない']];
let first=null,second=null,answers={},labels={},revealed=false;
const id=x=>document.getElementById(x);
function label(v){return choices.find(x=>x[0]===v)?.[1]||'未回答'}
function guess(q){const a=q.metric(first),b=q.metric(second);return Math.abs(a-b)<1?'both':a>b?'me':'you'}
function tallies(){const v={me:0,you:0,both:0,neither:0};Object.values(answers).forEach(x=>{if(x in v)v[x]++});return v}
function resultData(){
 const v=tallies(),n=Object.keys(answers).length;
 const matched=questions.filter((q,i)=>answers[i]===guess(q)).length;
 let title='役割交代が得意なバランスコンビ';
 let subtitle='場面ごとに主役が入れ替わる、自由なふたり。';
 let tip='次のデートでは「何を決めたいか」を一つずつ言ってみよう。';
 if(v.both>=3){title='似た者同士のシンクロコンビ';subtitle='なんだかんだ、ふたりで同じ方向を見がち。';tip='やりたいことがかぶったら、日程を決めるところまで一緒に！';}
 else if(v.neither>=3){title='マイペースを楽しむコンビ';subtitle='無理にどちらかが引っ張らなくても心地いいふたり。';tip='迷ったときは「今日はこっち！」と交互に決めるのも楽しい。';}
 else if(v.me>=3){title='あなたが前に出るリードコンビ';subtitle='この6問では、あなたが一歩先に動く場面が多め。';tip='今度は相手に「どこ行きたい？」って聞いてみて。';}
 else if(v.you>=3){title='相手が一歩先に動くコンビ';subtitle='この6問では、相手が行動を起こす場面が多め。';tip='次はあなたから「会おう！」って誘うのもあり。';}
 else if(v.both>=2){title='気持ちを共有する仲良しコンビ';subtitle='一緒に動く場面が多くて、共通点も見つかりそう。';tip='同じ答えだった質問を、相手にも聞いてみよう。';}
 else if(v.neither>=2){title='お互いのペースを守るコンビ';subtitle='急がず、それぞれの時間を大切にできそう。';tip='たまには二人で新しいことを決めてみて。';}
 const surprise=questions.map((q,i)=>({i,mismatch:answers[i]!==guess(q)})).find(x=>x.mismatch);
 return {v,n,matched,title,subtitle,tip,surprise};
}
function clearResult(){
 revealed=false;
 const card=id('love64-duo-result');
 if(card){card.hidden=true}
 const msg=id('love64-duo-status');if(msg)msg.textContent='';
}
function showResult(scroll){
 if(Object.keys(answers).length!==questions.length){
  const progress=id('love64-duo-status');if(progress)progress.textContent='残り'+(questions.length-Object.keys(answers).length)+'問です。全6問に答えると結果が見られます。';
  return false;
 }
 const d=resultData(),card=id('love64-duo-result');if(!card)return false;
 id('love64-duo-result-title').textContent=d.title;
 id('love64-duo-result-subtitle').textContent=d.subtitle;
 id('love64-duo-result-tip').textContent=d.tip;
 const counts=id('love64-duo-counts');counts.replaceChildren();
 const statItems=[['me','あなた'],['you','相手'],['both','ふたりとも'],['neither','どちらでもない']];
 statItems.forEach(([key,name])=>{
  const item=document.createElement('div');item.className='love64-duo-count';
  const num=document.createElement('strong');num.textContent=d.v[key]+'問';
  const title=document.createElement('span');title.textContent=name;
  const bar=document.createElement('i');bar.style.width=(d.v[key]/6*100)+'%';
  item.append(title,num,bar);counts.appendChild(item);
 });
 const match=id('love64-duo-match');
 match.textContent='タイプからの遊び予想と '+d.matched+' / 6 問一致！';
 const surprise=id('love64-duo-surprise');
 if(d.surprise){
  const n=d.surprise.i,q=questions[n];
  surprise.textContent='👀 ここが意外！「'+q.title+'」\nあなたの答え：'+label(answers[n])+' ／ タイプの遊び予想：'+label(guess(q))+'。\n'+q.hint;
 }else{
  surprise.textContent='👀 全6問がタイプの遊び予想と一致！ でも本当のふたりは、タイプだけでは決められない。いちばん共感した質問を話してみよう。';
 }
 const listing=id('love64-duo-recap');listing.replaceChildren();
 questions.forEach((q,i)=>{
  const li=document.createElement('li');
  const name=document.createElement('span');name.textContent=q.title;
  const answer=document.createElement('strong');answer.textContent=label(answers[i]);
  li.append(name,answer);listing.appendChild(li);
 });
 card.hidden=false;revealed=true;
 const status=id('love64-duo-status');if(status)status.textContent='';
 if(scroll&&card.scrollIntoView){
  requestAnimationFrame(()=>card.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
 }
 if(typeof gtag==='function')gtag('event','love64_duo_result_view',{result_type:d.title,playful_matches:d.matched});
 return true;
}
function mark(index,value){
 const previouslyFull=Object.keys(answers).length===questions.length;
 answers[index]=value;
 const question=document.querySelector('[data-love64-duo-id="'+index+'"]');
 if(question){
  for(const btn of question.querySelectorAll('button[data-pick]'))btn.setAttribute('aria-pressed',String(btn.dataset.pick===value));
  const note=question.querySelector('.love64-duo-note');
  if(note){note.hidden=false;note.textContent='回答：'+label(value)+'　（後から変更できます）'}
 }
 const n=Object.keys(answers).length;
 const progress=id('love64-duo-progress');
 if(progress)progress.textContent=n+' / '+questions.length+'問に回答しました。'+(n===questions.length?' 完了！結果を発表します。':' 残り'+(questions.length-n)+'問で結果発表！');
 if(typeof gtag==='function')gtag('event','love64_duo_answer',{question_number:index+1});
 if(n===questions.length){
  if(!previouslyFull&&typeof gtag==='function')gtag('event','love64_duo_complete');
  showResult(!previouslyFull);
 }else clearResult();
}
function render(a,b){
 if(!a||!b)return;
 first=a;second=b;answers={};revealed=false;
 labels={me:a.base+'-'+a.greek,you:b.base+'-'+b.greek};
 const list=id('love64-duo-list');if(!list)return;
 list.replaceChildren();
 for(const [i,q] of questions.entries()){
  const section=document.createElement('section');section.className='love64-duo-q';section.dataset.love64DuoId=String(i);
  const heading=document.createElement('h3');heading.textContent=(i+1)+'. '+q.title;section.appendChild(heading);
  const buttons=document.createElement('div');buttons.className='love64-duo-choices';
  for(const [val,txt] of choices){
   const button=document.createElement('button');button.type='button';button.textContent=txt;button.dataset.pick=val;button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>mark(i,val));buttons.appendChild(button);
  }
  section.appendChild(buttons);
  const feedback=document.createElement('p');feedback.className='love64-duo-note';feedback.hidden=true;section.appendChild(feedback);
  list.appendChild(section);
 }
 const progress=id('love64-duo-progress');if(progress)progress.textContent='0 / 6問。全部答えると、ふたりの結果が出ます。';
 clearResult();
}
function resultText(){
 const d=resultData();
 return '恋タイプ64｜ふたりの6問ゲーム\n'+labels.me+' × '+labels.you+'\n'+d.title+'\n'+d.subtitle+'\n'+questions.map((q,i)=>(i+1)+'. '+q.title+'\n→ '+label(answers[i])).join('\n')+'\nタイプ予想と'+d.matched+'/6問一致\n'+d.tip+'\n※タイプによる予想は娯楽です。\n\n'+location.href;
}
async function shareResult(){
 if(!showResult(false))return;
 const feedback=id('love64-duo-status'),text=resultText();
 try{if(navigator.share){await navigator.share({title:'恋タイプ64｜ふたりの結果',text,url:location.href});if(feedback)feedback.textContent='共有しました。';if(typeof gtag==='function')gtag('event','love64_duo_share');return;}}
 catch(e){if(e?.name==='AbortError')return}
 try{await navigator.clipboard.writeText(text);if(feedback)feedback.textContent='ゲーム結果をコピーしました。';if(typeof gtag==='function')gtag('event','love64_duo_copy_result');}
 catch(e){if(feedback)feedback.textContent='共有できませんでした。ブラウザの共有メニューをご利用ください。'}
}
document.addEventListener('DOMContentLoaded',()=>{
 id('love64-duo-reset')?.addEventListener('click',()=>{if(first&&second)render(first,second)});
 id('love64-duo-copy')?.addEventListener('click',shareResult);
 id('love64-duo-share-result')?.addEventListener('click',shareResult);
 id('love64-duo-show-result')?.addEventListener('click',()=>showResult(true));
});
window.Love64Duo={render,questionsCount:questions.length,showResult};
})();