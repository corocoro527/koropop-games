/* KOROPOP Original Two Hearts Play Cards — entertainment only */
(function(){
'use strict';
const questions=[
 {title:'どっちが先に「会いたい」って言いそう？',hint:'言葉にするタイミングは人それぞれ。どんな言い方ならうれしい？',metric:d=>(['SD','AD'].includes(d.sub)?3:1)+(d.base[0]==='E'?1:0)},
 {title:'どっちがちょっぴり嫉妬しやすそう？',hint:'嫉妬がある＝愛情が深い、ではありません。不安になった時どう安心したい？',metric:d=>(['AD','AW'].includes(d.sub)?3:1)+(d.base[2]==='F'?1:0)},
 {title:'デートの予定、どっちが考えそう？',hint:'リード役が毎回同じとは限らない。次は一緒に予定を立ててみる？',metric:d=>(['SD','AD'].includes(d.sub)?2:0)+(d.base[3]==='J'?2:0)},
 {title:'喧嘩したあと先に声をかけるのは？',hint:'すぐ話したい人も少し考えたい人もいる。次に話す時間を決めると安心。',metric:d=>(['SD','AD'].includes(d.sub)?2:0)+(d.base[0]==='E'?1:0)},
 {title:'どっちがサプライズを仕掛けそう？',hint:'サプライズが得意でなくても、相手を気にかける気持ちは同じ。',metric:d=>(d.base[0]==='E'?2:0)+(d.base[3]==='P'?2:0)},
 {title:'好きな気持ちを言う前に悩みそうなのは？',hint:'口数より相手への気持ちを大切に。恥ずかしい気持ちも二人の会話になる。',metric:d=>(['SW','AW'].includes(d.sub)?2:0)+(d.base[0]==='I'?1:0)}
];
const options=[['me','自分'],['you','相手'],['both','ふたりとも'],['neither','どちらでもない']];
let first=null,second=null,answers={},labels={};
function pickGuess(q){
 const a=q.metric(first),b=q.metric(second);
 return Math.abs(a-b)<1?'ふたりとも':a>b?'自分':'相手';
}
function mark(id,value){
 const oldCount=Object.keys(answers).length;
 answers[id]=value;
 if(typeof gtag==='function'){gtag('event','love64_duo_answer',{question_number:id+1});if(oldCount===questions.length-1&&Object.keys(answers).length===questions.length)gtag('event','love64_duo_complete');}
 const section=document.querySelector('[data-love64-duo-id="'+id+'"]');
 if(!section)return;
 for(const button of section.querySelectorAll('button[data-pick]'))button.setAttribute('aria-pressed',String(button.dataset.pick===value));
 const note=section.querySelector('.love64-duo-note'),q=questions[id];
 note.hidden=false;
 note.textContent='あなたの予想：'+(options.find(v=>v[0]===value)?.[1]||'')+'　／　タイプからの遊び予想：'+pickGuess(q)+'。\n'+q.hint;
 const count=Object.keys(answers).length;
 document.getElementById('love64-duo-progress').textContent=count+' / '+questions.length+'問に回答しました。'+(count===6?' 全問クリア！恋人と答え合わせしてみてね。':'');
}
function render(a,b){
 if(!a||!b)return;
 first=a;second=b;answers={};
 labels={me:a.base+'-'+a.greek,you:b.base+'-'+b.greek};
 const target=document.getElementById('love64-duo-list');
 if(!target)return;
 target.replaceChildren();
 questions.forEach((q,i)=>{
  const sect=document.createElement('section');sect.className='love64-duo-q';sect.dataset.love64DuoId=String(i);
  const heading=document.createElement('h3');heading.textContent=String(i+1)+'. '+q.title;sect.appendChild(heading);
  const row=document.createElement('div');row.className='love64-duo-choices';
  for(const [value,label] of options){
   const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.pick=value;button.setAttribute('aria-pressed','false');
   button.addEventListener('click',()=>mark(i,value));row.appendChild(button);
  }
  sect.appendChild(row);
  const note=document.createElement('p');note.className='love64-duo-note';note.hidden=true;note.style.whiteSpace='pre-line';sect.appendChild(note);
  target.appendChild(sect);
 });
 const progress=document.getElementById('love64-duo-progress');
 if(progress)progress.textContent='0 / '+questions.length+'問に回答しました。二人で予想しあってね。';
 const status=document.getElementById('love64-duo-status');if(status)status.textContent='';
}
function copyText(){
 const head='恋タイプ64｜ふたりの「どっちが〇〇？」\n'+labels.me+' × '+labels.you+'\n';
 return head+questions.map((q,i)=>q.title+'\n→ '+(options.find(o=>o[0]===answers[i])?.[1]||'まだ未回答')).join('\n')+'\n\n'+location.href;
}
document.addEventListener('DOMContentLoaded',()=>{
 const reset=document.getElementById('love64-duo-reset');if(reset)reset.addEventListener('click',()=>{if(first&&second)render(first,second)});
 const cp=document.getElementById('love64-duo-copy');if(cp)cp.addEventListener('click',async()=>{
 const msg=document.getElementById('love64-duo-status');
 if(!first){if(msg)msg.textContent='まずタイプを選んで相性を表示してください。';return;}
 try{await navigator.clipboard.writeText(copyText());if(msg)msg.textContent='ふたりの回答をコピーしました。'}
 catch(e){if(msg)msg.textContent='コピーできませんでした。ブラウザの共有機能をご利用ください。'}
 });
});
window.Love64Duo={render,questionsCount:questions.length};
})();