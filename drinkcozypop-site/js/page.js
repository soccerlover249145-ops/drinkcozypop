/* Cozypop coming-soon v47 (waitlist wired): sign-ups, checkout placeholders, quiz, founding counter, thank-you and share kit.
   Logic carried over from v46; reads CONFIG from index.html. The waitlist sends data only once CONFIG.KIT_FORM_ID and/or
   CONFIG.LAUNCHLIST_FORM_ID are filled in. With both blank it runs in demo mode and sends nothing. */
var WAITLIST='/waitlist/';
function isSet(v){return /^https:\/\//.test(String(v||''));}
var qs=new URLSearchParams(location.search);
function clean(v){return String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,30);}

/* ---------- waitlist setup (v47): which tools are switched on ---------- */
function cfgId(v,re){v=String(v||'').trim();return re.test(v)?v:'';}
var KIT_ID=cfgId(CONFIG.KIT_FORM_ID,/^\d{3,12}$/);
var LL_ID=cfgId(CONFIG.LAUNCHLIST_FORM_ID,/^frm_[A-Za-z0-9_-]{4,40}$/);
/* Demo mode never runs on the real site: there, blank IDs send people to /waitlist/ like v46 did, so nobody sees a fake "you're on the list". */
var ON_LIVE=/(^|\.)drinkcozypop\.com$/i.test(location.hostname);
var DEMO=!KIT_ID&&!LL_ID&&!ON_LIVE;
var REF_PARAM=/^[a-z][a-z0-9_]{0,15}$/i.test(String(CONFIG.REFERRAL_PARAM||''))?CONFIG.REFERRAL_PARAM:'ref';
/* Referral code from the link, case kept for LaunchList. Kept in this browser for 90 days so a friend who
   comes back later from the plain address still credits the person who shared. */
var RAWREF=(function(){
  var v=String(qs.get(REF_PARAM)||'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,40), K='cozypop_ref';
  try{
    if(v) localStorage.setItem(K,JSON.stringify({c:v,t:Date.now()}));
    else{var s=JSON.parse(localStorage.getItem(K)||'null'); if(s&&s.c&&Date.now()-s.t<90*864e5) v=String(s.c).replace(/[^A-Za-z0-9_-]/g,'').slice(0,40);}
  }catch(e){}
  return v;
})();
var REF=clean(RAWREF), SRC=String(qs.get('src')||'').toLowerCase()==='pin'?'pin':'';
function waitlistURL(){var p=[];if(REF)p.push('ref='+REF);if(SRC)p.push('src='+SRC);return WAITLIST+(p.length?'?'+p.join('&'):'');}
document.querySelectorAll('.f-ref').forEach(function(i){i.value=REF});
document.querySelectorAll('.f-src').forEach(function(i){i.value=SRC});
var EMAIL_RE=/^[^@\s]+@[^@\s]+\.[^@\s]+$/;
var STILL=matchMedia('(prefers-reduced-motion:reduce)').matches;
var FLAVORS={
  cherry:{name:'Tart Cherry Amaretto'},caramel:{name:'Salted Caramel Cream'},honey:{name:'Honey Vanilla Rooibos'},pear:{name:'Spiced Pear'}
};
function curFlavor(){return document.body.dataset.f||'cherry';}

/* ---------- flavor photos follow the page flavor ---------- */
function swapFlavorImages(k){
  document.querySelectorAll('img.fsw[data-src-t]').forEach(function(im){
    var src=im.getAttribute('data-src-t').replace('{f}',k);
    if(im.getAttribute('src')===src) return;
    if(im.closest('.rv,.fd-fig,.story')&&!STILL){im.style.transition='opacity .35s';im.style.opacity='0';
      var n=new Image();n.onload=n.onerror=function(){im.src=src;im.style.opacity='1'};n.src=src;}
    else im.src=src;
  });
}
document.addEventListener('cozy:flavor',function(e){swapFlavorImages(e.detail)});
swapFlavorImages(curFlavor());

/* ---------- jump to the bottom sign-up ---------- */
function toJoin(e){
  var j=document.getElementById('join'), i=document.getElementById('email-bottom');
  if(e) e.preventDefault();
  j.scrollIntoView({behavior:STILL?'auto':'smooth'});
  if(i) setTimeout(function(){i.focus({preventScroll:true})},STILL?0:650);
}
document.querySelectorAll('[data-join]').forEach(function(a){a.addEventListener('click',toJoin)});
document.querySelectorAll('[data-open]').forEach(function(a){a.addEventListener('click',function(){var d=document.getElementById(a.getAttribute('data-open'));if(d)d.open=true;})});

/* ---------- checkout buttons: real link when set, otherwise the waitlist ---------- */
document.querySelectorAll('a[data-link]').forEach(function(a){
  var v=CONFIG[a.getAttribute('data-link')];
  a.href=isSet(v)?v:waitlistURL();
});
(function(){
  var open=CONFIG.PREORDERS_OPEN===true;
  document.querySelectorAll('a.po-btn[data-po]').forEach(function(a){
    var v=CONFIG[a.getAttribute('data-po')];
    if(open&&isSet(v)){a.href=v;a.textContent=a.getAttribute('data-label');}
    else{a.href='#join';a.addEventListener('click',toJoin);}
  });
  if(open){document.getElementById('po-state').classList.add('open');document.getElementById('po-state-t').textContent='Pre-orders are open. First run, first to ship.';}
  var n=CONFIG.PREORDERS_COUNT;
  if(typeof n==='number'&&n>0&&Math.floor(n)===n){
    document.getElementById('po-count-n').textContent=n.toLocaleString('en-US');
    document.getElementById('po-count-t').textContent=(n===1?'box':'boxes')+' pre-ordered so far';
    document.getElementById('po-count').hidden=false;
  }
})();

/* ---------- share helpers ---------- */
function shareURL(){return isSet(CONFIG.SHARE_URL)?CONFIG.SHARE_URL:(location.origin&&location.origin!=='null'?location.origin+location.pathname:'https://drinkcozypop.com');}
function copyText(t,st,ok){
  function done(){if(st)st.textContent=ok||'Copied.';}
  function fallback(){var a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.position='absolute';a.style.left='-9999px';document.body.appendChild(a);a.select();try{document.execCommand('copy');done();}catch(e){if(st)st.textContent='Copy this: '+t;}a.remove();}
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).then(done,fallback);}else fallback();
}
function shareIt(text,st){
  var url=shareURL();
  if(navigator.share){navigator.share({title:'Cozypop',text:text,url:url}).catch(function(){});return;}
  copyText(text+' '+url,st,'Link copied. Paste it anywhere.');
}

/* ---------- thank-you: member card, wallpapers, share kit (always lands in #join) ---------- */
var TEXTS=[
  'Found a little evening treat that isn’t out yet: Cozypop. Light, fizzy, two flavors to start, and Tart Cherry Amaretto is calling me. I joined the list, you’d like it:',
  'Group chat, new evening treat alert. Cozypop: light and fizzy, and Salted Caramel Cream is on my list. Not out yet, the list is here:',
  'For the next time we survive a big week: Cozypop, a little fizzy evening treat, coming 2027. The list:'
];
function memberNo(){
  if(CONFIG.CARD_FROM_LINK!==true) return 0;
  var v=String(qs.get('n')||''); if(!/^\d{1,6}$/.test(v)) return 0;
  var n=parseInt(v,10); return n>=1?n:0;
}
function fcardHTML(n){
  var k=curFlavor(), head, num, of;
  if(n){var founding=n<=1000;head=founding?'Founding member':'Member';num='<span>#</span>'+n.toLocaleString('en-US');of=founding?'of the first 1,000':'on the Cozypop list';}
  else{head='Your member card';num='<span>#</span><span class="fc-dots"><i></i><i></i><i></i><i></i></span>';of='Your number arrives by email';}
  return '<div class="fcard" role="img" aria-label="'+(n?'Your Cozypop card, '+head+' number '+n:'Your Cozypop member card. The number arrives by email after you confirm.')+'">'+
    '<img class="fc-can fsw" data-src-t="img/can-{f}.webp" src="img/can-'+k+'.webp" alt="">'+
    '<div class="fc-copy"><span class="logo-mark"></span></div>'+
    '<div class="fc-copy"><span class="fc-kick">'+head+'</span><span class="fc-num">'+num+'</span><span class="fc-of">'+of+'</span></div></div>';
}
function wallsHTML(){
  var Wl=[['cherry','Tart Cherry Amaretto','Cherry'],['caramel','Salted Caramel Cream','Caramel'],['honey','Honey Vanilla Rooibos','Honey'],['pear','Spiced Pear','Pear']];
  return '<span class="lab">A little thank-you.</span><span>Four phone wallpapers. Tap one to save it.</span><ul class="wp-row">'+
    Wl.map(function(w){return '<li><a href="img/growth/wallpaper-'+w[0]+'.jpg" download="cozypop-wallpaper-'+w[0]+'.jpg"><img src="img/growth/wallpaper-'+w[0]+'-thumb.jpg" width="360" height="779" alt="'+w[1]+' phone wallpaper" loading="lazy">'+w[2]+'</a></li>';}).join('')+'</ul>';
}
/* Referral ladder, same steps as the page and referral-and-waitlist-rules.md */
var LADDER=[[1,'a double vote'],[3,'the first wave'],[5,'an Everyday Cozy Cap on us'],[10,'the Sticker Pop, Plus One edition'],[25,'a 4-pack on us'],[50,'a taste night']];
function esc(t){return String(t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function myLink(code){var b=String(CONFIG.SHARE_URL||'https://drinkcozypop.com').replace(/\/+$/,'');return b+'/?'+REF_PARAM+'='+encodeURIComponent(code);}
function countLine(n){
  var next=null; for(var i=0;i<LADDER.length;i++){if(n<LADDER[i][0]){next=LADDER[i];break;}}
  var t=(n===1?'friend has':'friends have')+' joined through your link.';
  return next?t+' '+(next[0]-n)+' more for '+next[1]+'.':t+' You’ve reached every step. Thank you.';
}
function refHTML(r){
  var n=Math.max(0,Math.floor(+r.count||0));
  return '<span class="lab">Your link.</span><span>Each friend who joins through it and confirms their email moves you up 50 spots.</span>'+
    '<div class="rl-box"><label class="sr" for="rl-url">Your personal share link</label><input id="rl-url" class="rl-url" type="text" readonly value="'+esc(myLink(r.code))+'"></div>'+
    '<div class="rl-count"><b class="rl-n">'+n.toLocaleString('en-US')+'</b><span>'+countLine(n)+'</span></div>'+
    '<span class="rl-hint">Come back and enter your email again any time to see your count.'+(r.demo?'':' Friends count once they confirm.')+'</span>'+
    (r.demo?'<span class="rl-demo">Demo mode: nothing was sent. This is a sample link for the preview.</span>':'');
}
function kitHTML(r){
  var head=r&&r.code?refHTML(r)+'<span class="lab">Tell the group chat.</span>'
    :'<span class="lab">Tell the group chat.</span><span>'+(r&&r.locked?'Your own link is on its way by email.':'Your own link comes by email when referrals open.')+' Until then, send a friend the list.</span>';
  return head+
    '<div class="sk-row"><button type="button" class="pill hot sk-share">Share</button><button type="button" class="pill sk-copy">Copy link</button><a class="pill sk-sms" href="#">Text a friend</a></div>'+
    '<span class="sk-status" role="status"></span>'+
    '<div class="sk-pic"><img src="img/growth/share.jpg" width="1080" height="1080" alt="The Cozypop share picture: four cans on cherry red" loading="lazy"><div><b>A picture for the chat</b><a href="img/growth/share.jpg" download="cozypop-share.jpg">Save the picture</a><a class="sk-mail" href="#">Email a friend</a></div></div>';
}
function wireKit(p,r){
  var url=r&&r.code?myLink(r.code):shareURL(), st=p.querySelector('.sk-status'), msg=TEXTS[1];
  var box=p.querySelector('.rl-url'); if(box) box.addEventListener('focus',function(){box.select();});
  p.querySelector('.sk-share').addEventListener('click',function(){
    if(navigator.share&&navigator.canShare&&window.fetch&&window.File){
      fetch('img/growth/share.jpg').then(function(r){return r.blob()}).then(function(bl){
        var f=new File([bl],'cozypop.jpg',{type:'image/jpeg'}), d={files:[f],text:msg+' '+url};
        if(navigator.canShare(d)) return navigator.share(d);
        return navigator.share({title:'Cozypop',text:msg,url:url});
      }).catch(function(){});
      return;
    }
    shareIt(msg,st);
  });
  p.querySelector('.sk-copy').addEventListener('click',function(){copyText(url,st,'Link copied.')});
  p.querySelector('.sk-sms').href='sms:?&body='+encodeURIComponent(msg+' '+url);
  p.querySelector('.sk-mail').href='mailto:?subject='+encodeURIComponent('Save yourself a can of Cozypop')+'&body='+encodeURIComponent(msg+'\n'+url);
}
function thanksHead(r){
  return r&&r.dup?'<b>You’re already on the list.</b><span>Good news: your place is saved. Here’s your link and how many friends have joined so far.</span>'
    :'<b>You’re on the list.</b><span>Your welcome email is on its way. If it asks you to confirm, tap the button to keep your place.</span>';
}
function fullThanks(r){
  var fb=document.getElementById('signup-bottom'); if(!fb) return document.getElementById('thanks');
  var p=document.createElement('div'); p.className='done-card ty'; p.setAttribute('role','status'); p.tabIndex=-1; p.id='thanks';
  p.innerHTML=thanksHead(r)+fcardHTML(memberNo())+
    '<span>Your Member No. arrives by email the morning after you confirm. It never changes. Numbers 0001 to 1000 are founding members.</span>'+wallsHTML()+kitHTML(r);
  var err=fb.nextElementSibling; if(err&&err.classList.contains('form-err')) err.remove();
  var note=document.querySelector('#join .note'); if(note) note.remove();
  fb.replaceWith(p); wireKit(p,r);
  document.getElementById('join').classList.add('is-thanks');
  return p;
}
function showDone(f,r){
  if(f.id==='signup-bottom'){ var p=fullThanks(r); if(p) p.focus({preventScroll:true}); return; }
  var s=document.createElement('div'); s.className='done-card'; s.setAttribute('role','status'); s.tabIndex=-1;
  s.innerHTML=(r&&r.dup?'<b>You’re already on the list.</b><span>Your place is saved. Your link and count are <a href="#thanks">waiting below</a>.</span>'
    :'<b>You’re on the list.</b><span>Your welcome email is on its way. Your member card'+(r&&r.code?' and your own link are':' is')+' <a href="#thanks">waiting below</a>.</span>');
  var err=f.nextElementSibling; if(err&&err.classList.contains('form-err')) err.remove();
  f.replaceWith(s); fullThanks(r); s.focus({preventScroll:true});
}

/* ---------- waitlist sign-ups (v47): LaunchList for the share link and count, Kit for the list and emails ----------
   Order: 1) LaunchList (if set) answers with this person's referral code and count. 201 = new, 200 = already on the list.
          2) Kit (if set) gets the email plus the code in fields[referral_code], so Kit emails can print the link.
   Errors keep the form and say what to do. Demo mode (both IDs blank) sends nothing and shows a sample link.
   Demo test addresses: already@... shows the "already on the list" state, oops@... shows the error state. */
var MSG_NET='We couldn’t reach the list just now. Please try again in a moment.';
function demoCapture(email){
  return new Promise(function(ok,no){setTimeout(function(){
    var local=email.split('@')[0].toLowerCase();
    if(local==='oops') return no({msg:MSG_NET});
    var h=0; for(var i=0;i<email.length;i++) h=(h*31+email.charCodeAt(i))>>>0;
    ok({code:'DEMO'+h.toString(36).toUpperCase().slice(0,4),count:local==='already'?3:0,dup:local==='already',demo:true});
  },450);});
}
function llCapture(email,f){
  var body={email:email,_channel:'site'};
  if(RAWREF) body.ref=RAWREF;
  if(SRC) body.signup_src=SRC;
  var m=f.querySelector('.f-match'); if(m&&m.value) body.flavor_match=m.value;
  return fetch('https://embed.getlaunchlist.com/f/'+encodeURIComponent(LL_ID)+'/submit',{
    method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify(body)
  }).then(function(res){
    return res.json().catch(function(){return {};}).then(function(j){
      if(res.status===429) throw {msg:'Lots of people are joining right now. Please try again in a minute.'};
      if(res.status>=500||res.status===0) throw {msg:MSG_NET};
      if(!res.ok) throw {msg:'That email didn’t go through. Check it for typos and try again.'};
      var c=j.contact||(j.data&&j.data.contact)||{};
      var dup=typeof j.created==='boolean'?!j.created:res.status===200;
      return {code:String(c.referral_code||'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,40),count:+c.referral_count||0,dup:dup,locked:j.locked===true};
    });
  },function(e){ if(e&&e.msg) throw e; throw {msg:MSG_NET}; });
}
function kitPost(f,code){
  var data=new FormData(f); if(code) data.set('fields[referral_code]',code);
  return fetch('https://app.kit.com/forms/'+KIT_ID+'/subscriptions',{method:'POST',body:data,mode:'no-cors'});
}
document.querySelectorAll('form.signup.kit').forEach(function(f){
  var err=f.nextElementSibling&&f.nextElementSibling.classList.contains('form-err')?f.nextElementSibling:null;
  var busy=false;
  if(KIT_ID) f.action='https://app.kit.com/forms/'+KIT_ID+'/subscriptions';
  f.addEventListener('submit',function(e){
    e.preventDefault(); if(busy) return;
    var input=f.querySelector('input[type=email]'), email=input.value.trim(), b=f.querySelector('button'), label=b.textContent;
    if(err) err.textContent='';
    if(!EMAIL_RE.test(email)){ if(err) err.textContent='Enter an email like you@email.com'; input.focus(); return; }
    if(!DEMO&&!KIT_ID&&!LL_ID){ location.href=waitlistURL(); return; }
    if(!window.fetch||!window.Promise){ if(KIT_ID) f.submit(); else location.href=waitlistURL(); return; }
    busy=true; b.disabled=true; b.setAttribute('aria-busy','true'); b.textContent='Joining…';
    function fail(x){ busy=false; b.disabled=false; b.removeAttribute('aria-busy'); b.textContent=label; if(err) err.textContent=(x&&x.msg)||MSG_NET; input.focus(); }
    var step=DEMO?demoCapture(email):(LL_ID?llCapture(email,f):Promise.resolve({}));
    step.then(function(r){
      if(DEMO) return r;
      if(!KIT_ID) return r;
      /* Kit answers opaquely (no-cors). A network failure here is the only error we can see. */
      return kitPost(f,r.code).then(function(){return r;},function(){ if(LL_ID&&r.code) return r; throw {msg:MSG_NET}; });
    }).then(function(r){ showDone(f,r); },fail);
  });
});
/* With LaunchList on, people get their link the moment they join: update the one ladder line that says otherwise. */
if(LL_ID){ document.querySelectorAll('.ladder-card .tiny').forEach(function(t){ t.textContent=t.textContent.replace('Share links go out once our referral tool is live.','You get your link the moment you join.'); }); }

/* ---------- host and creator forms: post when set, otherwise the waitlist ---------- */
document.querySelectorAll('form.mini').forEach(function(f){
  var url=CONFIG[f.getAttribute('data-link')], st=f.parentNode.querySelector('.status');
  if(isSet(url)) f.action=url;
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(!isSet(url)){ location.href=waitlistURL(); return; }
    var input=f.querySelector('input[type=email]');
    if(!EMAIL_RE.test(input.value.trim())){ st.textContent='Enter an email like you@email.com'; input.focus(); return; }
    var b=f.querySelector('button'); b.disabled=true;
    fetch(f.action,{method:'POST',body:new FormData(f),mode:'no-cors'})
      .then(function(){st.textContent="Thanks, we'll be in touch."; f.reset(); b.disabled=false;})
      .catch(function(){b.disabled=false; f.submit();});
  });
});

/* ---------- ask your store: with an email, the Kit waitlist form; without, STORE_COUNT_URL. Nothing sent until set. ---------- */
(function(){
  var f=document.getElementById('store-form'); if(!f) return;
  var st=f.querySelector('.sa-status'), kit=CONFIG.STORE_FORM_URL, count=CONFIG.STORE_COUNT_URL;
  f.addEventListener('submit',function(e){
    e.preventDefault(); st.textContent='';
    var store=f.querySelector('#sa-store'), city=f.querySelector('#sa-city'), em=f.querySelector('#sa-email');
    var sv=store.value.trim(), cv=city.value.trim(), ev=em.value.trim();
    if(!sv){st.textContent='Tell us the store or café.'; store.focus(); return;}
    if(!cv){st.textContent='Tell us the city.'; city.focus(); return;}
    if(ev&&!EMAIL_RE.test(ev)){st.textContent='Check the email, or leave it blank.'; em.focus(); return;}
    var url=ev?(isSet(kit)?kit:''):(isSet(count)?count:''), b=f.querySelector('button');
    function done(){st.textContent='Thank you. '+sv+' in '+cv+' is on our list.'+(ev?' We’ll write if they say yes.':''); f.reset();}
    if(!url||!window.fetch){done(); return;}
    var data=new FormData(f); if(!ev) data.delete('email_address');
    b.disabled=true;
    fetch(url,{method:'POST',body:data,mode:'no-cors'}).then(done).catch(function(){st.textContent='That did not go through. Please try again in a moment.';}).then(function(){b.disabled=false;});
  });
})();

/* ---------- referral tool: loads only once a real embed link is set ---------- */
(function(){var slot=document.getElementById('referral-slot'), v=CONFIG.REFERRAL_EMBED; if(!slot||!isSet(v)) return;
  var s=document.createElement('script'); s.src=v; s.async=true; slot.appendChild(s);})();

/* ---------- little extras: cap style buttons and Wave Set colors swap the photo ---------- */
(function(){
  function wire(card,group,tagId,names,setColor){
    if(!card) return;
    var btns=[].slice.call(card.querySelectorAll(group+' button')), imgs=[].slice.call(card.querySelectorAll('.x-img')), tag=document.getElementById(tagId);
    btns.forEach(function(b){b.addEventListener('click',function(){
      var k=b.dataset.k;
      btns.forEach(function(o){o.setAttribute('aria-pressed',o===b?'true':'false')});
      imgs.forEach(function(i){i.classList.toggle('on',i.dataset.k===k)});
      if(tag) tag.textContent=names[k];
      if(setColor) card.dataset.c=k;
    })});
  }
  wire(document.getElementById('x-cap'),'.x-opts','x-cap-tag',{everyday:'Everyday Cap',sticker:'Sticker Pop Cap'},false);
  wire(document.getElementById('x-wave'),'.x-sw','x-wave-tag',{cherry:'Cherry',orange:'Orange',blue:'Blue',green:'Green'},true);
})();

/* ---------- next-flavor vote: nothing is saved here, so say so ---------- */
(function(){
  var choices=document.querySelectorAll('.choice'), vs=document.getElementById('vote-status');
  choices.forEach(function(c){c.addEventListener('click',function(){
    choices.forEach(function(o){o.setAttribute('aria-pressed','false')});
    c.setAttribute('aria-pressed','true');
    vs.textContent='You picked '+c.querySelector('b').textContent+'. The real vote goes to the list by email, so join to make it count.';
  });});
})();

/* ---------- tabs (people) ---------- */
(function(){
  var tabs=[].slice.call(document.querySelectorAll('.tabs [role=tab]'));
  function sel(t,focus){tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on?'true':'false');x.tabIndex=on?0:-1;document.getElementById(x.getAttribute('aria-controls')).hidden=!on});if(focus)t.focus()}
  tabs.forEach(function(t,i){t.addEventListener('click',function(){sel(t)});t.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();sel(tabs[(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length],true)}})});
})();

/* ---------- quiz: five questions, scored here only. Most points wins; a tie goes to question 1. ---------- */
var PERSONAS={
  cherry:{title:'The Main Character',body:'Bright, a little bold, always first to say “we did it.” Tart cherry up front, a soft almond finish, all fizz.',moment:'Your moment: the final whistle, the last bow, the group chat lighting up.'},
  caramel:{title:'The Couch Captain',body:'The best seat, the softest blanket, the good stuff. Buttery caramel and a pinch of salt.',moment:'Your moment: shoes off after a long shift, feet up, you earned this.'},
  honey:{title:'The Golden Hour',body:'Warm, thoughtful, quietly proud of yourself. Golden honey, soft vanilla, rooibos and a gentle sparkle.',moment:'Your moment: the page is turned and the evening is all yours. Coming after launch.'},
  pear:{title:'The Seasonal Romantic',body:'You decorate for every season and mean it. Crisp pear, cinnamon, a hint of star anise.',moment:'Your moment: the last box unpacked on moving day, candles lit in the new place. Coming after launch.'}
};
(function(){
  var box=document.getElementById('mq'), stage=document.getElementById('m-stage'); if(!box||!stage) return;
  var card=document.getElementById('match-card'), back=document.getElementById('mq-back'), ORDER=['cherry','caramel','honey','pear'];
  var sets=[].slice.call(box.querySelectorAll('.mq')), dots=[].slice.call(box.querySelectorAll('.mq-dots i')), picks=[], cur=0, st=stage.querySelector('.m-status');
  function show(i){cur=i;sets.forEach(function(s,j){s.classList.toggle('on',j===i)});dots.forEach(function(d,j){d.classList.toggle('on',j<=i)});back.classList.toggle('on',i>0);}
  function result(best,scroll){
    if(!best){
      var n={cherry:0,caramel:0,honey:0,pear:0};picks.forEach(function(k){n[k]++});
      best=ORDER.reduce(function(a,b){return n[b]>n[a]?b:a},ORDER[0]);
      var top=ORDER.filter(function(k){return n[k]===n[best]}); if(top.length>1&&top.indexOf(picks[0])>=0) best=picks[0];
    }
    var P=PERSONAS[best], img=document.getElementById('m-img');
    stage.className='m-stage is-done m-'+best; card.classList.add('fin');
    img.src='img/growth/quiz-'+best+'.jpg'; img.alt='Your result card: '+P.title+', '+FLAVORS[best].name;
    document.getElementById('m-name').textContent=P.title; document.getElementById('m-flav').textContent=FLAVORS[best].name;
    document.getElementById('m-line').textContent=P.body; document.getElementById('m-moment').textContent=P.moment;
    var c=document.getElementById('m-card'); c.href='img/growth/quiz-'+best+'.jpg'; c.setAttribute('download','cozypop-'+best+'.jpg');
    document.querySelectorAll('.f-match').forEach(function(i){i.value=best});
    st.textContent=''; stage.dataset.match=best;
    if(window.cozySetFlavor) window.cozySetFlavor(best,true);
    if(scroll!==false) setTimeout(function(){card.scrollIntoView({block:'start',behavior:STILL?'auto':'smooth'})},30);
  }
  sets.forEach(function(s,i){s.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){
    picks[i]=b.dataset.f;
    if(i<sets.length-1){show(i+1);var nb=sets[i+1].querySelector('button');if(nb)nb.focus({preventScroll:true});}
    else result();
  })})});
  back.addEventListener('click',function(){if(cur>0){show(cur-1);sets[cur].querySelector('button').focus({preventScroll:true});}});
  document.getElementById('m-again').addEventListener('click',function(){picks=[];stage.className='m-stage';card.classList.remove('fin');delete stage.dataset.match;document.querySelectorAll('.f-match').forEach(function(i){i.value=''});show(0);card.scrollIntoView({block:'start',behavior:STILL?'auto':'smooth'});sets[0].querySelector('button').focus({preventScroll:true});});
  document.getElementById('m-share').addEventListener('click',function(){var k=stage.dataset.match||'cherry';shareIt('I’m '+PERSONAS[k].title+' ('+FLAVORS[k].name+'). Which Cozypop are you?',st);});
  document.getElementById('m-save').addEventListener('click',toJoin);
  function fromHash(){var m=location.hash.match(/^#result-(cherry|caramel|honey|pear)$/);
    if(m){ result(m[1],false); setTimeout(function(){card.scrollIntoView();},0); }}
  addEventListener('hashchange',fromHash); fromHash();
})();

/* ---------- founding counter: CONFIG.FOUNDING_SPOTS_TAKEN. Hidden while null. No countdowns. ---------- */
(function(){
  var TOTAL=1000, el=document.getElementById('cp-founding-counter'); if(!el) return;
  function fmt(n){return n.toLocaleString('en-US');}
  function render(taken){
    if(typeof taken!=='number'||!isFinite(taken)||taken<0||Math.floor(taken)!==taken){el.hidden=true;return false;}
    var used=Math.min(taken,TOTAL), left=TOTAL-used, line=el.querySelector('.cp-fc-line'), note=el.querySelector('.cp-fc-note'), track=el.querySelector('.cp-fc-track'), fill=track.querySelector('span');
    if(left===0){line.innerHTML='All <b>'+fmt(TOTAL)+'</b> founding spots are taken. Thank you.';note.textContent='You can still join the list. Everyone gets a Member No., in the order they join.';}
    else{line.innerHTML='<b>'+fmt(left)+'</b> of '+fmt(TOTAL)+' founding '+(left===1?'spot':'spots')+' left';note.textContent='A real count of confirmed sign-ups.';}
    track.setAttribute('aria-valuenow',String(used)); track.setAttribute('aria-valuetext',fmt(used)+' of '+fmt(TOTAL)+' founding spots taken');
    el.hidden=false; requestAnimationFrame(function(){fill.style.width=(used/TOTAL*100)+'%';}); return true;
  }
  var inline=CONFIG.FOUNDING_SPOTS_TAKEN; render(inline);
  if(isSet(CONFIG.FOUNDING_COUNT_URL)&&window.fetch){
    fetch(CONFIG.FOUNDING_COUNT_URL,{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){
      if(!j) return; var n=j.founding_spots_taken;
      if(typeof n==='number'&&(inline===null||inline===undefined||n>=inline)) render(n);
    }).catch(function(){});
  }
})();
(function(){
  var done=Array.isArray(CONFIG.UNLOCKED)?CONFIG.UNLOCKED.map(Number):[];
  document.querySelectorAll('.fu-list li').forEach(function(li){
    if(done.indexOf(+li.dataset.at)>=0){li.classList.add('done');var t=document.createElement('span');t.className='fu-done';t.textContent='Unlocked';li.appendChild(t);}
  });
})();

/* ---------- reveal on scroll ---------- */
(function(){
  var els=document.querySelectorAll('.rv');
  if(!('IntersectionObserver' in window)||STILL){document.documentElement.classList.add('no-io');return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});
  els.forEach(function(el){io.observe(el)});
})();

/* ---------- swipe rows: progress dots ---------- */
[['fl-row','fl-dots'],['tiers','tier-dots']].forEach(function(pair){
  var row=document.getElementById(pair[0]), dots=document.getElementById(pair[1]); if(!row||!dots) return;
  var items=[].slice.call(row.children), raf=0;
  function upd(){raf=0;var max=row.scrollWidth-row.clientWidth,at=0;
    if(max>4){if(row.scrollLeft>=max-4)at=items.length-1;else{var mid=row.getBoundingClientRect().left+row.clientWidth/2,best=1e9;
      items.forEach(function(it,k){var r=it.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-mid);if(d<best){best=d;at=k}})}}
    [].forEach.call(dots.children,function(d,k){d.classList.toggle('on',k===at)});}
  row.addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(upd)},{passive:true});
});

/* ---------- phone join bar: after the hero, hidden near the bottom sign-up ---------- */
(function(){
  var bar=document.getElementById('bar'), hero=document.getElementById('top'), join=document.getElementById('join'); if(!bar) return;
  function upd(){
    var past=hero.getBoundingClientRect().bottom<innerHeight*.5, jr=join.getBoundingClientRect(), near=jr.top<innerHeight;
    var on=past&&!near&&!join.classList.contains('is-thanks');
    bar.classList.toggle('on',on); bar.setAttribute('aria-hidden',on?'false':'true'); bar.querySelector('a').tabIndex=on?0:-1;
  }
  addEventListener('scroll',upd,{passive:true}); addEventListener('resize',upd); upd();
})();

if(qs.get('thanks')==='1'){var tp=fullThanks(); if(tp) setTimeout(function(){tp.scrollIntoView({block:'start'});},0);}
