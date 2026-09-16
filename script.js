(() => {
  'use strict';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const behavior = () => reduceMotion.matches ? 'auto' : 'smooth';
  document.querySelectorAll('.rail-controls').forEach(el => el.hidden = false);
  document.querySelectorAll('.rail').forEach(rail => {
    const controls = [...document.querySelectorAll('[data-rail]')].filter(b => b.dataset.rail === rail.id);
    const update = () => controls.forEach(b => b.disabled = Number(b.dataset.step) < 0 ? rail.scrollLeft <= 2 : rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2);
    const move = direction => {
      const card = rail.querySelector('.rail-card');
      if (!card) return;
      rail.scrollBy({left:direction*(card.getBoundingClientRect().width+(parseFloat(getComputedStyle(rail).columnGap)||0)),behavior:behavior()});
    };
    controls.forEach(b => b.addEventListener('click',() => move(Number(b.dataset.step))));
    rail.addEventListener('keydown',event => {
      if (!['ArrowRight','ArrowLeft'].includes(event.key)) return;
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    });
    rail.addEventListener('scroll',update,{passive:true});
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(rail);
    else window.addEventListener('resize',update,{passive:true});
    update();
  });
  const nav = [...document.querySelectorAll('.site-nav a')];
  const setActive = id => nav.forEach(a => {
    if (a.hash === '#'+id) a.setAttribute('aria-current','location');
    else a.removeAttribute('aria-current');
  });
  if (document.body.dataset.section) setActive(document.body.dataset.section);
  else if ('IntersectionObserver' in window) {
    const sections = [...document.querySelectorAll('main > section[id]')];
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => a.boundingClientRect.top-b.boundingClientRect.top);
      if (visible.length) setActive(visible[0].target.id);
    },{rootMargin:'-15% 0px -55% 0px',threshold:0});
    sections.forEach(section => observer.observe(section));
  }
  const progress = document.querySelector('.reading-progress');
  if (progress) {
    let pending = false;
    const update = () => {
      const range = document.documentElement.scrollHeight-innerHeight;
      progress.style.transform = 'scaleX('+Math.min(1,Math.max(0,range>0?scrollY/range:0))+')';
      pending = false;
    };
    window.addEventListener('scroll',() => { if (!pending) { pending=true; requestAnimationFrame(update); } },{passive:true});
    window.addEventListener('resize',update,{passive:true}); update();
  }
  const dialog = document.querySelector('.lightbox');
  if (dialog && typeof dialog.showModal === 'function') {
    const photos = [...document.querySelectorAll('#gallery-data img')];
    const display = dialog.querySelector('.lightbox-image');
    let current = 0, opener;
    const show = index => {
      current = Math.min(photos.length-1,Math.max(0,index));
      display.src=photos[current].src; display.alt=photos[current].alt;
      dialog.querySelector('.lightbox-counter').textContent=(current+1)+' / '+photos.length;
      dialog.querySelector('.lightbox-caption').textContent=photos[current].alt;
      dialog.querySelector('[data-photo-step="-1"]').disabled=current===0;
      dialog.querySelector('[data-photo-step="1"]').disabled=current===photos.length-1;
    };
    document.querySelectorAll('[data-lightbox]').forEach(button => {
      button.hidden=false;
      button.addEventListener('click',() => {
        opener=button; show(Number(button.dataset.lightbox)); dialog.showModal();
      });
    });
    dialog.querySelector('[data-close]').addEventListener('click',() => dialog.close());
    dialog.querySelectorAll('[data-photo-step]').forEach(b => b.addEventListener('click',() => show(current+Number(b.dataset.photoStep))));
    dialog.addEventListener('keydown',event => {
      if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault(); show(current+(event.key==='ArrowRight'?1:-1));
    });
    dialog.addEventListener('close',() => opener?.focus());
    dialog.addEventListener('click',event => {if (event.target===dialog) {const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  }
})();
