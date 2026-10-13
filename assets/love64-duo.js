/* Love64 two-player conversation game: each person answers privately; no predictive compatibility score. */
(function(){
'use strict';
const questions=[
 {title:'先に「会いたい」と言うのは？',talk:'実際に最近「会おう」と誘ったのはどっち？'},
 {title:'デートの行き先を決めるのは？',talk:'次のデートはどっちが決めたい？'},
 {title:'LINEで先に連絡するのは？',talk:'連絡の頻度は今のままでちょうどいい？'},
 {title:'気まずくなったあと、先に声をかけるのは？',talk:'言い合いになったら、すぐ話したい？ 少し時間がほしい？'},
 {title:'相手のちょっとした変化に気づくのは？',talk:'最近、相手のことで気づいた小さな変化は？'},
 {title:'「好き」「ありがとう」を先に言うのは？',talk:'どんな言葉や行動がいちばんうれしい？'}
];
const choices=[['me','自分'],['you','相手'],['both','ふたりとも'],['neither','どちらでもない']];
let first=null,second=null,phase='intro',index=0,picks=[[],[]];
const $=id=>document.getElementById(id);
const text=(tag,content,cls)=>{const el=document.createElement(tag);el.textContent=content;if(cls)el.className=cls;return el};
const playerLabel=p=>p===0?'あなた':'お相手';
const humanChoice=code=>({'me':'あなた','you':'お相手','both':'ふたりとも','neither':'どちらでもない'})[code]||'未回答';
function normalize(raw,player){if(raw==='both'||raw==='neither')return raw;if(player===1)return raw==='me'?'you':'me';return raw;}
function emit(name,params){if(typeof gtag==='function')gtag('event',name,params||{})}
function setProgress(str){const p=$('love64-duo-progress');if(p)p.textContent=str;}
function clearList(){const el=$('love64-duo-list');if(el)el.replaceChildren();return el}
function button(label,fn,cls=''){const b=text('button',label,cls);b.type='button';b.addEventListener('click',fn);return b}
function moveToResults(){
 const r=$('love64-duo-result');if(!r)return;
 if(r.scrollIntoView)requestAnimationFrame(()=>r.scrollIntoView({behavior:window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
}
function renderIntro(){
 phase='intro';index=0;const root=clearList();if(!root)return;
 root.append(text('h3','ふたりで答えると、違いが見える','love64-duo-step-title'));
 root.append(text('p','まずあなたが6問答える → スマホを相手に渡す → 相手も6問答える。最後にふたりの回答を比較するで。','love64-duo-help'));
 root.append(text('p','※相手の回答中は、あなたの回答は見えません。タイプだけで相性を決めるゲームではありません。','love64-duo-fineprint'));
 root.append(button('自分の6問を始める →',()=>{phase='p1';index=0;renderQuestion()},'love64-duo-main-button'));
 setProgress('ふたりで約2分。二人とも回答すると結果が見られます。');
 const result=$('love64-duo-result');if(result)result.hidden=true;
}
function renderQuestion(){
 const player=phase==='p1'?0:1;const q=questions[index];const root=clearList();if(!root)return;
 const percent=Math.round((index/6)*100);
 root.append(text('p',player===0?'STEP 1/2　あなたの番':'STEP 2/2　お相手の番','love64-duo-step'));
 const bar=document.createElement('div');bar.className='love64-duo-meter';
 const fill=document.createElement('div');fill.className='love64-duo-meter-fill';fill.style.width=percent+'%';bar.append(fill);root.append(bar);
 root.append(text('h3',(index+1)+'/6　'+q.title,'love64-duo-step-title'));
 root.append(text('p','自分の目線で、近いと思うものを選んでね。','love64-duo-help'));
 const grid=document.createElement('div');grid.className='love64-duo-choices';
 for(const [value,label] of choices){const b=button(label,()=>{picks[player][index]=value;renderQuestion()},'love64-duo-option');b.setAttribute('aria-pressed',String(picks[player][index]===value));grid.append(b);}
 root.append(grid);
 const nav=document.createElement('div');nav.className='love64-duo-nav';
 if(index>0)nav.append(button('← 前の質問',()=>{index--;renderQuestion()},'love64-duo-back'));
 const next=button(index===5?(player===0?'回答を終える →':'答え合わせする 🎉'):'次の質問 →',()=>{
  if(!picks[player][index])return;
  if(index<5){index++;renderQuestion();return;}
  if(player===0){phase='handoff';renderHandoff();emit('love64_duo_player1_complete')}
  else {phase='result';renderResult();emit('love64_duo_complete')}
 },'love64-duo-main-button');
 next.disabled=!picks[player][index];nav.append(next);root.append(nav);
 setProgress(playerLabel(player)+'の回答：'+(index+1)+' / 6問');
}
function renderHandoff(){
 const root=clearList();if(!root)return;
 root.append(text('div','✅ あなたの6問が終わりました','love64-duo-step-title'));
 root.append(text('p','ここからはお相手の番。あなたの回答は隠しているので、そのままスマホを渡してください。','love64-duo-help'));
 root.append(text('p','相手も6問選んだら、ふたりの「一致」「違い」をまとめて発表します。','love64-duo-fineprint'));
 root.append(button('お相手の回答を始める →',()=>{phase='p2';index=0;renderQuestion()},'love64-duo-main-button'));
 setProgress('1人目完了。次は2人目の回答です。');
}
function analyze(){
 const rows=questions.map((q,i)=>{
  const a=normalize(picks[0][i],0),b=normalize(picks[1][i],1);
  return {q,a,b,match:a===b};
 });
 const matches=rows.filter(r=>r.match).length;const gaps=rows.length-matches;
 let title='意外な発見が多いふたり';
 let lead='思っていた役割に違いがありそう。違いを知るのも面白い。';
 if(matches===6){title='予想がぴったりなふたり';lead='6問ぜんぶ同じ予想！どんな場面を思い浮かべたかも聞いてみて。'}
 else if(matches>=4){title='似ているところが多いふたり';lead='だいたい同じように二人を見ているみたい。違った質問だけ掘り下げてみよう。'}
 else if(matches>=2){title='同じところも違うところもあるふたり';lead='話してみると「そう思ってたんだ！」が見つかりそう。'}
 return {rows,matches,gaps,title,lead};
}
function renderResult(){
 const root=clearList();if(root)root.replaceChildren();
 const result=$('love64-duo-result');if(!result)return;
 const out=analyze();
 $('love64-duo-result-title').textContent=out.title;
 $('love64-duo-result-subtitle').textContent=out.lead;
 $('love64-duo-match').textContent='予想が一致 '+out.matches+'/6問　／　違った '+out.gaps+'問';
 const counts=$('love64-duo-counts');counts.replaceChildren();
 for(const [number,word] of [[out.matches,'同じ予想'],[out.gaps,'違う予想']]){
  const card=document.createElement('div');card.className='love64-duo-count';
  card.append(text('span',word),text('strong',number+'問'));counts.append(card);
 }
 const firstGap=out.rows.find(r=>!r.match);
 $('love64-duo-surprise').textContent=firstGap?
 '👀 ここが意外！「'+firstGap.q.title+'」\nあなた：'+humanChoice(firstGap.a)+'　／　お相手：'+humanChoice(firstGap.b)+'\n'+firstGap.q.talk:
 '🎉 全6問で同じ予想！どんな場面を思い浮かべたか、ひとつずつ聞いてみよう。';
 const recap=$('love64-duo-recap');recap.replaceChildren();
 for(const [i,row] of out.rows.entries()){
  const item=document.createElement('li');item.className='love64-duo-recap-item';
  item.append(text('strong',(i+1)+'. '+row.q.title));
  const choicesRow=document.createElement('div');choicesRow.className='love64-duo-recap-answers';
  choicesRow.append(text('span','あなた：'+humanChoice(row.a)));
  choicesRow.append(text('span','お相手：'+humanChoice(row.b)));
  choicesRow.append(text('em',row.match?'一致！':'ここが違う','love64-duo-recap-badge '+(row.match?'matched':'unmatched')));
  item.append(choicesRow);
  if(!row.match)item.append(text('p','話してみよう：'+row.q.talk,'love64-duo-recap-hint'));
  recap.append(item);
 }
 $('love64-duo-result-tip').textContent=firstGap?firstGap.q.talk:'次は「一番意外だった答え」をお互いに聞いてみよう。';
 result.hidden=false;
 setProgress('2人とも回答完了。違いを見つけて話してみよう！');
 emit('love64_duo_result_view',{answer_agreements:out.matches});
 moveToResults();
}
function resultText(){
 const v=analyze();
 return '恋タイプ64｜ふたりの答え合わせ\n'+first.base+'-'+first.greek+' × '+second.base+'-'+second.greek+
 '\n'+v.title+'\n予想が一致 '+v.matches+'/6問\n'+v.rows.map((r,i)=>(i+1)+'. '+r.q.title+'\nあなた：'+humanChoice(r.a)+' ／ 相手：'+humanChoice(r.b)+(r.match?'（一致）':'（違い）')).join('\n')+
 '\n※性格や相性の優劣を判定するものではありません。\n'+location.href;
}
async function share(){
 if(phase!=='result'){const status=$('love64-duo-status');if(status)status.textContent='ふたりの回答が終わるとシェアできます。';return;}
 const status=$('love64-duo-status');
 const message=resultText();
 try{if(navigator.share){await navigator.share({title:'恋タイプ64｜ふたりの答え合わせ',text:message,url:location.href});status.textContent='共有しました。';emit('love64_duo_share');return}}
 catch(err){if(err&&err.name==='AbortError')return}
 try{await navigator.clipboard.writeText(message);status.textContent='結果をコピーしました。';emit('love64_duo_copy_result')}
 catch(err){status.textContent='コピーできませんでした。ブラウザの共有機能をお使いください。'}
}
function reset(){picks=[[],[]];phase='intro';index=0;renderIntro()}
function render(a,b){first=a;second=b;reset();}
document.addEventListener('DOMContentLoaded',()=>{
 $('love64-duo-reset')?.addEventListener('click',reset);
 $('love64-duo-share-result')?.addEventListener('click',share);
});
window.Love64Duo={render,questionsCount:questions.length};
})();