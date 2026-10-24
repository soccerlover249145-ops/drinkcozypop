/* Cozypop pill nav (v46 coming-soon): menu toggle; flavor links recolor the page, then go to the flavors */
(function(){
  var burger=document.getElementById('burger'),menu=document.getElementById('menu');
  if(!burger||!menu)return;
  function set(open){burger.setAttribute('aria-expanded',open?'true':'false');menu.hidden=!open;burger.setAttribute('aria-label',open?'Close menu':'Menu')}
  burger.addEventListener('click',function(e){e.stopPropagation();set(menu.hidden)});
  document.addEventListener('click',function(e){if(!menu.hidden&&!menu.contains(e.target))set(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!menu.hidden){set(false);burger.focus()}});
  [].forEach.call(menu.querySelectorAll('a'),function(a){a.addEventListener('click',function(){
    var f=a.getAttribute('data-f');
    if(f&&window.cozySetFlavor)window.cozySetFlavor(f,true);
    set(false);
  })});
})();
