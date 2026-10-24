/* Cozypop coming-soon v46 hero: the landing's photoreal WebGL can (photo + full 360 v8 sleeve),
   standing in the label's wave with the sign-up on the band. Scrolling turns the can one full circle,
   pushes in, shows two short beats, then the wave rises over everything and hands off to the page.
   Flavor dots change the can and the whole page color. Renderer copied from website/shop-landing-oct17/js/landing.js. */
(function(){
  var F={
    cherry:{name:'Tart Cherry Amaretto',theme:'#F9AEDF'},
    caramel:{name:'Salted Caramel Cream',theme:'#DDC7F7'}
  };
  var KEYS=Object.keys(F);
  var $=function(id){return document.getElementById(id)};
  var body=document.body,stage=$('stage'),track=$('top'),can=$('can'),cv=$('cv'),band=$('band'),glow=$('glow'),nav=$('nav'),copy=$('hero-copy');
  var beats=[].slice.call(document.querySelectorAll('.beat'));
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var meta=document.querySelector('meta[name="theme-color"]');
  var cur='cherry';
  try{var saved=sessionStorage.getItem('cp-flavor');if(F[saved])cur=saved}catch(e){}

  /* ---------- the can: photo + 360 sleeve, drawn in WebGL ---------- */
  var CAN={cherry:{W:627,YT:33,YB:1448},caramel:{W:614,YT:33,YB:1448},honey:{W:621,YT:33,YB:1447},pear:{W:621,YT:37,YB:1447}};
  var CH=1500,KT=-.16,KB=.14,TW=1904,PAD=2;
  var gl=null,c2=null,prg=null,U={};
  try{gl=cv.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false})||cv.getContext('experimental-webgl')}catch(e){gl=null}
  if(gl&&!initGL())gl=null;
  if(!gl)c2=cv.getContext('2d');
  function initGL(){
    var vs='attribute vec2 p;varying vec2 vUv;void main(){vUv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
    var fs=['precision highp float;varying vec2 vUv;',
      'uniform sampler2D uBase,uBaseH,uWrap,uWrapH,uLight;uniform vec2 uSize;uniform vec4 uP;uniform float uPhi,uLod,uWt;uniform vec2 uTW;',
      'void main(){',
      ' vec4 b=mix(texture2D(uBase,vUv),texture2D(uBaseH,vUv),uLod);',
      ' vec2 px=vUv*uSize;float y=px.y;',
      ' float ry=(floor(clamp(y,0.,uSize.y-1.))+.5)/1500.;',
      ' vec3 r0=texture2D(uLight,vec2(ry,.125)).rgb,r1=texture2D(uLight,vec2(ry,.375)).rgb;',
      ' float cx=(r0.r*65280.+r0.g*255.)/64.,r=(r1.r*65280.+r1.g*255.)/64.;',
      ' float rx=(floor(clamp(px.x,0.,uSize.x-1.))+.5)/1500.;',
      ' vec3 g=texture2D(uLight,vec2(rx,.625)).rgb*1.5;float o=texture2D(uLight,vec2(rx,.875)).r-.2;',
      ' float th=asin(clamp((px.x-cx)/max(r,1.),-1.,1.));',
      ' float k=uP.z+(uP.w-uP.z)*(y-uP.x)/(uP.y-uP.x);',
      ' float v=(y-k*r*(cos(th)-1.)-uP.x)/(uP.y-uP.x);',
      ' float m=step(.5,b.a)*clamp(min(v,1.-v)*(uP.y-uP.x),0.,1.);',
      ' float u=fract((th-uPhi)/6.2831853+.5);u=(u*uTW.x+uTW.y)/(uTW.x+2.*uTW.y);',
      ' vec2 tc=vec2(u,clamp(v,0.,1.));',
      ' vec3 t=mix(texture2D(uWrap,tc).rgb,texture2D(uWrapH,tc).rgb,uLod);',
      ' vec3 c=mix(b.rgb,clamp(t*g+o,0.,1.),m);',
      ' gl_FragColor=vec4(c*b.a,b.a)*uWt;}'].join('\n');
    function sh(t,src){var x=gl.createShader(t);gl.shaderSource(x,src);gl.compileShader(x);return gl.getShaderParameter(x,gl.COMPILE_STATUS)?x:null}
    var v=sh(gl.VERTEX_SHADER,vs),f=sh(gl.FRAGMENT_SHADER,fs);if(!v||!f)return false;
    prg=gl.createProgram();gl.attachShader(prg,v);gl.attachShader(prg,f);gl.linkProgram(prg);
    if(!gl.getProgramParameter(prg,gl.LINK_STATUS))return false;
    gl.useProgram(prg);
    var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    var loc=gl.getAttribLocation(prg,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    ['uBase','uBaseH','uWrap','uWrapH','uLight','uSize','uP','uPhi','uLod','uWt','uTW'].forEach(function(n){U[n]=gl.getUniformLocation(prg,n)});
    gl.uniform1i(U.uBase,0);gl.uniform1i(U.uBaseH,1);gl.uniform1i(U.uWrap,2);gl.uniform1i(U.uWrapH,3);gl.uniform1i(U.uLight,4);
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
    return true;
  }
  function half(im){var c=document.createElement('canvas');c.width=Math.ceil(im.naturalWidth/2);c.height=Math.ceil(im.naturalHeight/2);
    var x=c.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(im,0,0,c.width,c.height);return c}
  function tex(src,nearest){var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.NONE);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);
    var f=nearest?gl.NEAREST:gl.LINEAR;
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,f);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,f);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t}
  var cans={};
  function loadCan(k){
    if(cans[k])return cans[k];
    var c={ready:false,n:0,im:{}};cans[k]=c;
    var need=gl?['base','wrap','light']:['base'];
    need.forEach(function(n){var im=new Image();im.decoding='async';
      im.onload=function(){c.n++;if(c.n===need.length)finish(c)};
      im.src=n==='base'?'img/can-'+k+'.webp':'img/can/'+k+'-'+n+(n==='light'?'.png':'.webp');c.im[n]=im});
    return c;
  }
  function finish(c){
    if(gl){c.t={base:tex(c.im.base),baseH:tex(half(c.im.base)),wrap:tex(c.im.wrap),wrapH:tex(half(c.im.wrap)),light:tex(c.im.light,true)}}
    c.ready=true;
  }
  function drawOne(k,phi,wt,lod){
    var c=cans[k];if(!c||!c.ready)return false;var g=CAN[k];
    var bind=[c.t.base,c.t.baseH,c.t.wrap,c.t.wrapH,c.t.light];
    for(var i=0;i<5;i++){gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,bind[i])}
    gl.uniform2f(U.uSize,g.W,CH);gl.uniform4f(U.uP,g.YT,g.YB,KT,KB);gl.uniform1f(U.uPhi,phi);gl.uniform1f(U.uLod,lod);
    gl.uniform1f(U.uWt,wt);gl.uniform2f(U.uTW,TW,PAD);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return true;
  }
  var fromK=null,toK=null,mixT=1;
  function drawCan(phi,cw,ch){
    var pw=Math.round(cw*dpr),ph=Math.round(ch*dpr);
    if(cv.width!==pw||cv.height!==ph){cv.width=pw;cv.height=ph}
    if(gl){
      gl.viewport(0,0,pw,ph);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      var lod=clamp((CH/ph-1.25)/.75,0,1);
      if(fromK&&toK){if(!(cans[toK]&&cans[toK].ready))drawOne(fromK,phi,1,lod);else{if(mixT<1)drawOne(fromK,phi,1-mixT,lod);drawOne(toK,phi,mixT,lod)}}
      else drawOne(cur,phi,1,lod);
    } else {
      var c=cans[cur];c2.clearRect(0,0,pw,ph);if(c&&c.ready)c2.drawImage(c.im.base,0,0,pw,ph);
    }
  }


  /* ---------- the label's wave, for every wave on the page ---------- */
  (function(){
    var d='M0,90 L0,46',w=1000;
    for(var x=0;x<=2000;x+=10){var t=2*Math.PI*x/w;
      var y=46+16*Math.sin(t+.4)+9*Math.sin(2*t+1.3)+4*Math.sin(3*t+2.1)+1.6*Math.sin(5*t+1.1);
      d+=' L'+x+','+y.toFixed(2)}
    d+=' L2000,90 Z';
    [].forEach.call(document.querySelectorAll('path.wv'),function(p){p.setAttribute('d',d)});
  })();

  /* ---------- stickers from the label, placed around the can (units of can height) ---------- */
  var STK=[[-.43,-.3,.21,-14],[.43,-.36,.17,12],[-.47,.2,.17,10],[.45,.12,.2,-8]];
  var stks=[0,1,2,3].map(function(i){var d=document.createElement('div');d.className='stk';
    d.style.cssText='--t:'+(6+i*1.3)+'s;--ad:'+(-i*1.7)+'s';d.innerHTML='<img alt="">';$('stks').appendChild(d);return d});

  function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
  function sm(a,b,v){var t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)}
  function lerp(a,b,t){return a+(b-a)*t}
  function lin(p,k){if(p<=k[0][0])return k[0][1];for(var i=1;i<k.length;i++){if(p<=k[i][0]){var a=k[i-1],b=k[i];return lerp(a[1],b[1],(p-a[0])/(b[0]-a[0]))}}return k[k.length-1][1]}
  function kf(p,k){if(p<=k[0][0])return k[0][1];for(var i=1;i<k.length;i++){if(p<=k[i][0]){var a=k[i-1],b=k[i];return lerp(a[1],b[1],sm(a[0],b[0],p))}}return k[k.length-1][1]}
  var BEATS=[[.24,.5],[.5,.78]];
  function beatAlpha(i,p){var a=BEATS[i][0],b=BEATS[i][1];return Math.min(sm(a,a+.05,p),1-sm(b-.05,b,p))}

  /* ---------- sizes ---------- */
  var W,H,desk,navB,dpr=1,hc=0,beatH=0;
  function measure(){
    W=stage.clientWidth;H=stage.clientHeight;desk=W>=900;navB=nav.getBoundingClientRect().bottom;
    dpr=Math.min(window.devicePixelRatio||1,2);hc=copy.offsetHeight;beatH=beats[0].offsetHeight;sizeFizz();
    if(reduce)track.style.height=H+'px';
  }

  /* ---------- bubbles ---------- */
  var fz=$('fizz'),fx=fz.getContext('2d'),dots=[];
  function sizeFizz(){
    fz.width=Math.round(W*dpr);fz.height=Math.round(H*dpr);
    var n=Math.round(W*H/(desk?14000:10000));dots=[];
    for(var i=0;i<n;i++)dots.push({x:Math.random()*W,y:Math.random()*H,r:1+Math.random()*2.6,v:8+Math.random()*18,a:.25+Math.random()*.45,ph:Math.random()*6.28,d:.3+Math.random()*.7});
  }
  function drawFizz(dt,time,p){
    fx.setTransform(dpr,0,0,dpr,0,0);fx.clearRect(0,0,W,H);fx.strokeStyle='rgba(255,255,255,.9)';fx.lineWidth=1;
    for(var i=0;i<dots.length;i++){var d=dots[i];
      if(!reduce){d.y-=d.v*dt;if(d.y<-10){d.y=H+10;d.x=Math.random()*W}}
      var y=d.y-((p*H*1.1*d.d)%H),x=d.x+Math.sin(time*.7+d.ph)*5*d.d;y=((y%H)+H)%H;
      fx.globalAlpha=d.a;fx.beginPath();fx.arc(x,y,d.r,0,6.283);fx.stroke();
    }
    fx.globalAlpha=1;
  }

  /* ---------- the camera ---------- */
  var target=0,prog=0,last=performance.now(),t0=last,spin=0,offscreen=false;
  function readScroll(){var r=track.getBoundingClientRect(),len=track.offsetHeight-H;target=reduce?0:clamp(-r.top/Math.max(1,len),0,1);offscreen=r.bottom<-50}
  function typing(){var a=document.activeElement;return a&&copy.contains(a)&&a.tagName==='INPUT'}
  function frame(now){
    var dt=Math.min(.05,(now-last)/1000);last=now;
    if(offscreen&&!spin){requestAnimationFrame(frame);return}
    if(!typing())prog+=(target-prog)*(1-Math.exp(-dt*(reduce?30:6.5)));
    var p=prog,time=(now-t0)/1000,bob=reduce?0:Math.sin(time*1.1),sway=reduce?0:Math.sin(time*.6);
    var asp=CAN[cur].W/CH,cw,h,cx,cy,by,copyY,bandP,hP,h0,cy0,cx0,rot0;
    if(desk){
      by=H*.84;h0=Math.min(H*.76,(by+H*.06-navB-24));cy0=by+H*.06-h0/2;cx0=W*.68;rot0=-12;
      copyY=navB+(by-navB-hc)/2;
      bandP=H*.72;hP=Math.min(H*.64,bandP+H*.08-navB-20);
    } else {
      copyY=H-hc-Math.max(20,H*.03);
      by=copyY-74;
      h0=Math.min(by+56-navB-16,W*1.18);cy0=by+56-h0/2;cx0=W*.5;rot0=-9;
      bandP=H*.7;hP=Math.min(bandP+H*.07-navB-14,W*1.3);
    }
    var cyP=bandP+(desk?H*.08:H*.07)-hP/2;
    h=kf(p,[[0,h0],[.26,hP],[.78,hP*1.03],[1,hP*1.18]]);
    cy=kf(p,[[0,cy0],[.26,cyP],[.78,cyP],[1,cyP-H*.08]]);
    cx=kf(p,[[0,cx0],[.26,W*.5],[1,W*.5]]);
    var rot=kf(p,[[0,rot0],[.24,0],[1,0]])+sway*1.6*(1-sm(.05,.2,p));
    cy+=bob*h*.01*(1-sm(.05,.25,p));
    /* one full turn, always the same way */
    var turn=lin(p,[[0,0],[.24,0],[.5,60],[.76,330],[.9,360],[1,360]]);
    /* at rest the can sits on its true front (wordmark and flavor name centered), with only a tiny breathing sway */
    turn+=reduce?0:Math.sin(time*.45)*2.5*(1-sm(.06,.2,p));
    if(spin>0){var e=1-spin;turn+=360*(e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2)}
    cw=h*asp;
    can.style.width=cw.toFixed(1)+'px';can.style.height=h.toFixed(1)+'px';
    can.style.transform='translate('+(cx-cw/2).toFixed(1)+'px,'+(cy-h/2).toFixed(1)+'px) rotate('+rot.toFixed(2)+'deg)';
    drawCan(turn*Math.PI/180,cw,h);
    glow.style.transform='translate('+(cx-500)+'px,'+(cy-500)+'px) scale('+(h/760).toFixed(3)+')';

    /* the band: under the copy, down a little for the beats, then up over everything */
    var bandY=kf(p,[[0,by],[.26,bandP],[.78,bandP],[1,-110]]);
    band.style.transform='translateY('+bandY.toFixed(1)+'px)';

    /* the sign-up copy leaves first */
    var co=1-sm(.03,.16,p);
    copy.style.opacity=co.toFixed(3);copy.style.visibility=co<.02?'hidden':'visible';
    copy.style.transform='translateY('+(copyY+(desk?0:bandY-by)-(1-co)*30).toFixed(1)+'px)';

    /* stickers float round the can */
    stks.forEach(function(el,i){var g=STK[i],k=desk?.85:1,size=g[2]*h*k,
      x=cx+g[0]*h*(desk?.95:1),y=cy+g[1]*h-(p*H*(i%2?.18:.28));
      var top=navB+size*.1;el.style.opacity=y<top+size*.5?clamp((y-top)/(size*.5),0,1).toFixed(3):'';
      if(!desk&&x-size/2<-size*.25)x=size*.25+size/2;if(!desk&&x+size/2>W+size*.25)x=W-size*.25-size/2;
      el.style.width=size.toFixed(1)+'px';el.style.transform='translate('+(x-size/2).toFixed(1)+'px,'+(y-size/2).toFixed(1)+'px) rotate('+(g[3]+p*40*(i%2?-1:1)).toFixed(1)+'deg)'});

    /* beats sit on the band */
    var bt=bandY+(desk?110:96);
    beats.forEach(function(b,i){
      var a=beatAlpha(i,p),mid=(BEATS[i][0]+BEATS[i][1])/2;
      b.style.opacity=a.toFixed(3);b.style.visibility=a<.01?'hidden':'visible';
      b.style.transform='translateY('+(bt+(1-a)*(p<mid?24:-24)).toFixed(1)+'px)';
    });
    if(spin>0){spin=Math.max(0,spin-dt/1.1);mixT=clamp((1-spin-.3)/.3,0,1);if(spin===0){mixT=1;fromK=toK=null}}
    drawFizz(dt,time,p);
    requestAnimationFrame(frame);
  }

  /* ---------- flavor: the can turns and the page changes color ---------- */
  function paintFlavor(k){
    cur=k;body.dataset.f=k;loadCan(k);
    stks.forEach(function(el,i){el.firstChild.src='img/stk-'+k+'-'+(i+1)+'.webp';el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop')});
    [].forEach.call(document.querySelectorAll('#dots button'),function(b){b.setAttribute('aria-pressed',b.dataset.f===k?'true':'false')});
    $('fname').textContent=F[k].name;
    can.setAttribute('aria-label','A can of Cozypop '+F[k].name);
    if(meta)meta.setAttribute('content',F[k].theme);
    try{sessionStorage.setItem('cp-flavor',k)}catch(e){}
    try{document.dispatchEvent(new CustomEvent('cozy:flavor',{detail:k}))}catch(e){}
  }
  var pend=null;
  function setFlavor(k,instant){
    if(!F[k]||k===cur&&!instant)return;
    loadCan(k);
    if(instant||reduce||offscreen){fromK=toK=null;mixT=1;spin=0;paintFlavor(k);return}
    if(!fromK)fromK=cur;toK=k;mixT=0;spin=1;can.classList.remove('spin');void can.offsetWidth;can.classList.add('spin');
    clearTimeout(pend);pend=setTimeout(function(){paintFlavor(k)},420);
  }
  window.cozySetFlavor=function(k,instant){setFlavor(k,instant)};
  [].forEach.call(document.querySelectorAll('#dots button'),function(b){b.addEventListener('click',function(){setFlavor(b.dataset.f)})});
  /* swipe sideways on the can to change flavor */
  var sx=null,sy=null;
  stage.addEventListener('touchstart',function(e){if(copy.contains(e.target))return;sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
  stage.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;sx=null;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5){var i=KEYS.indexOf(cur);setFlavor(KEYS[(i+(dx<0?1:-1)+KEYS.length)%KEYS.length])}},{passive:true});

  /* ---------- boot ---------- */
  measure();readScroll();prog=target;
  paintFlavor(cur);
  addEventListener('scroll',readScroll,{passive:true});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){measure();readScroll()});
  var rz=0,lastW=0;addEventListener('resize',function(){cancelAnimationFrame(rz);rz=requestAnimationFrame(function(){measure();readScroll()})});
  if(window.ResizeObserver)new ResizeObserver(function(){hc=copy.offsetHeight}).observe(copy);
  addEventListener('load',function(){setTimeout(function(){KEYS.forEach(function(k){loadCan(k)})},1200)});
  requestAnimationFrame(frame);
  window.__cozy={gl:!!gl,get ready(){var c=cans[cur];return !!(c&&c.ready)},get prog(){return prog},get target(){return target},get flavor(){return cur}};
})();
