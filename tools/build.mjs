import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(root, 'content/site.json'), 'utf8'));
const assetVersion = filename => createHash('sha256').update(fs.readFileSync(path.join(root, filename))).digest('hex').slice(0,12);
const cssVersion = assetVersion('styles.css');
const jsVersion = assetVersion('script.js');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localAsset = value => {
  if (!/^assets\/[\w\-./]+$/.test(value) || value.includes('..')) throw Error(`Invalid asset: ${value}`);
  if (!fs.existsSync(path.join(root, value))) throw Error(`Missing asset: ${value}`);
  return value;
};
const image = (src, alt, prefix = '', extra = '') => `<img src="${prefix}${esc(localAsset(src))}" alt="${esc(alt)}" decoding="async" ${extra}>`;
const links = [['writing','文字'],['workshop','建造'],['travel','远方'],['about','关于']];
function header(prefix = '') {
  return `<a class="skip-link" href="#main">跳到正文</a><header class="masthead"><a class="wordmark" href="${prefix}index.html" aria-label="Kirk，返回首页">KIRK<span class="wordmark-note"> / A PERSONAL SPACE</span></a><nav class="site-nav" aria-label="页面章节"><ul>${links.map(([id,label])=>`<li><a href="${prefix ? prefix+'index.html' : ''}#${id}">${label}</a></li>`).join('')}</ul></nav></header>`;
}
function shell(title, content, prefix = '', section = '') {
  return `<!doctype html><html lang="zh-Hans"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#ffffff"><meta name="description" content="Kirk 的个人书房：文字、系统与远行。"><title>${esc(title === 'Kirk' ? title : title+' · Kirk')}</title><link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="${prefix}assets/fonts/PublicSans-ExtraBold.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="${prefix}styles.css?v=${cssVersion}"></head><body data-section="${section}">${header(prefix)}${content}<footer class="site-footer"><a href="${prefix}index.html" class="footer-name">Kirk</a><p>思考、建造，也去远方。</p><a class="back-top" href="#main">回到顶部 ↑</a></footer><script src="${prefix}script.js?v=${jsVersion}"></script></body></html>`;
}
const sectionHead = (number, label, title, note) => `<header class="section-head"><p class="section-kicker">${number} / ${label}</p><h2>${title}</h2><p class="section-note">${note}</p></header>`;
const pageLink = (slug, label, cls = '') => {
  const item = [...data.articles,...data.projects,...data.guides,...data.travels].find(p=>p.slug===slug);
  return `<a class="${cls}" href="pages/${slug}.html" aria-label="打开${esc(item.title)}">${label}</a>`;
};
function rail(id, label, cards) {
  return `<div class="rail-wrap"><div class="rail-toolbar"><p>横向浏览 <span aria-hidden="true">↔</span></p><div class="rail-controls" hidden><button type="button" data-rail="${id}" data-step="-1" aria-controls="${id}" aria-label="上一组${label}">←</button><button type="button" data-rail="${id}" data-step="1" aria-controls="${id}" aria-label="下一组${label}">→</button></div></div><ul id="${id}" class="rail" tabindex="0" aria-label="${label}，可横向滑动">${cards.join('')}</ul></div>`;
}
function home() {
  const heroBackground = data.heroBackground ? ` style="--hero-image:url('${esc(localAsset(data.heroBackground))}')"` : '';
  const content = `<main id="main">
  <section class="hero${data.heroBackground?' has-background':''}" aria-labelledby="hero-name"${heroBackground}>
    <div class="hero-copy"><p class="hero-eyebrow"><span class="small-mark" aria-hidden="true"></span> 一个人，一间开放的工坊</p><h1 id="hero-name">Kirk<span aria-hidden="true">.</span></h1><p class="hero-heading">思考、建造，<br>也去远方。</p><p class="hero-role">金融业务实践者 / AI 系统建造者 / 写作者</p><p class="hero-lead">我在现实的金融业务里做判断，也把反复出现的摩擦建造成工具。工作之外，我用写作与远行理解自己。</p><div class="hero-actions"><a class="button" href="#writing">走进书房 <span aria-hidden="true">↗</span></a><a class="text-link" href="#workshop">看看我在建造什么 →</a></div></div>
    <figure class="hero-portrait">${image(data.portrait.src,data.portrait.alt,'',`width="900" height="1200" fetchpriority="high" style="object-position:${esc(data.portrait.position||'50% 50%')}"`)}<figcaption><span>PORTRAIT / 01</span><span>${data.portrait.src.endsWith('.svg')?'肖像待补充':'Kirk'}</span></figcaption></figure>
  </section>
  <section class="principles" aria-labelledby="principles-title"><h2 class="visually-hidden" id="principles-title">原则</h2><ol><li><span>01</span>用工具，但不被工具定义。</li><li><span>02</span>工作的价值由现实结果验钞。</li><li><span>03</span>把反复出现的摩擦，建造成可复用的秩序。</li></ol></section>
  <section class="writing" id="writing">${sectionHead('01','THE STUDY','书房','关于阅读、工作，以及我在使用 AI 时的思考。两篇归档文章，已经可以在这里读完。')}<ul class="writing-list">${data.articles.map((a,i)=>`<li>${pageLink(a.slug,`<article><p class="article-label">${esc(a.category)} <span>ESSAY / 0${i+1}</span></p><h3>${esc(a.title)}</h3><p class="card-summary">${esc(a.summary)}</p><p class="card-bottom"><span>${Math.ceil(a.blocks.map(b=>b.text).join('').length/350)} 分钟阅读 · 归档正文</span><span aria-hidden="true">↗</span></p></article>`,'article-card')}</li>`).join('')}</ul></section>
  <section class="workshop" id="workshop">${sectionHead('02','THE WORKSHOP','开放工坊','从自己的日常需要出发，把有用的系统和方法逐步整理出来。')}${rail('projects-rail','建造项目',data.projects.map((p,i)=>`<li class="rail-card">${pageLink(p.slug,`<article><figure class="media project-media">${image(p.asset,p.title+'概念示意图','','width="1200" height="800" loading="lazy"')}</figure><p class="article-label">PROJECT / 0${i+1}</p><h3>${esc(p.title)} <span aria-hidden="true">↗</span></h3><p class="card-summary">${esc(p.summary)}</p><p class="status">${esc(p.status)} <span>查看项目说明</span></p></article>`,'project-card')}</li>`))}</section>
  <section class="garden" id="garden">${sectionHead('03','OPEN NOTES','你可以带走的东西','从一个日常问题开始。三份可阅读、可下载的入门清单，帮你试出适合自己的工作方式。')}<ol class="garden-path">${data.guides.map((g,i)=>`<li>${pageLink(g.slug,`<span class="garden-index">0${i+1}</span><span><strong>${esc(g.title)}</strong><small>${esc(g.summary)}</small></span><span aria-hidden="true">↗</span>`)}</li>`).join('')}</ol></section>
  <section class="travel" id="travel">${sectionHead('04','FIELD JOURNAL','旅行改写尺度','离开熟悉的地方，再回头看看自己的生活。这里先放下线索，真实照片与游记慢慢补齐。')}${rail('travel-rail','旅行记录',data.travels.map(t=>`<li class="rail-card">${pageLink(t.slug,`<article><figure class="media travel-media">${image(t.asset,t.title+'影像占位示意','','width="1600" height="1000" loading="lazy"')}</figure><div class="travel-caption"><h3>${esc(t.title)}</h3><span aria-hidden="true">↗</span></div><p class="meta">${esc(t.subtitle)} · 照片待补</p><p class="card-summary">${esc(t.quote)}</p></article>`,'travel-card')}</li>`))}</section>
  <section class="about" id="about">${sectionHead('05','THE LIVING ROOM','此刻与会客室','长期在金融业务一线，处理有现实后果的判断与交付。')}<div class="about-body"><p class="about-now">正在把私人系统提炼成<br>可以公开、复用的版本。</p><p>这里放我的文字、正在建造的东西，以及工作之外的生活。你可以先读一篇文章，或者带走一份小清单。</p><div class="connect-list"><a href="#writing"><span>公众号文章</span><span>在本站阅读 ↗</span></a><a href="#workshop"><span>项目与开源计划</span><span>查看说明 ↗</span></a><p><span>Email</span><span>联系地址尚未公开</span></p></div><p class="source-note">此站只代表我个人，与任何机构无关；不出现具体项目、客户与数据。</p></div></section>
  </main>`;
  return shell('Kirk',content);
}
function detail(p, group, label, body, note, next) {
  const chapters = [...body.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)].map(m => [m[0], m[1], m[2].replace(/^\d{2}\s*\/\s*/, '')]);
  return shell(p.title, `<div class="reading-progress" aria-hidden="true"></div><main id="main" class="detail-main"><a class="back-link" href="../index.html#${group}">← 返回${label}</a><header class="detail-header"><p class="section-kicker">${esc(p.category||label)} / ${esc(p.status||'阅读与实践')}</p><h1>${esc(p.title)}</h1><p class="detail-intro">${esc(p.summary||p.quote||'')}</p>${note?`<p class="source-note">${esc(note)}</p>`:''}</header><div class="reading-layout">${chapters.length?`<aside class="toc" aria-label="本页目录"><p>本页目录</p>${chapters.map((m,i)=>`<a href="#${m[1]}"><span>0${i+1}</span>${m[2]}</a>`).join('')}</aside>`:''}<article class="prose">${body}</article></div><nav class="detail-bottom" aria-label="继续阅读"><a href="../index.html#${group}">← 回到${label}</a>${next?`<a href="${next.slug}.html">${esc(next.title)} →</a>`:''}</nav></main>`, '../',group);
}
const paragraphs = sections => sections.map(([h,t],i)=>`<h2 id="part-${i+1}">${esc(h)}</h2><p>${esc(t)}</p>`).join('');
function write(relative, text) {
  const dest = path.join(root, relative);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.writeFileSync(dest,text+'\n');
}
write('index.html',home());
data.articles.forEach((a,i)=>{
  let chapter=0;
  const body=a.blocks.map(b=>b.type==='h2'?`<h2 id="part-${++chapter}">${esc(b.text)}</h2>`:`<p>${esc(b.text)}</p>`).join('');
  write(`pages/${a.slug}.html`,detail(a,'writing','书房',body,a.note,data.articles[(i+1)%data.articles.length]));
});
data.projects.forEach((p,i)=>{
  const body=`<figure class="detail-image">${image(p.asset,p.title+'概念示意图','../','width="1200" height="800"')}<figcaption>项目概念示意 · 非在线产品截图</figcaption></figure>${paragraphs(p.sections)}<div class="related-box"><h2 id="try-it">先试一个小步骤</h2><p>这些方法不需要先安装完整系统。</p><a class="button" href="${data.guides[i].slug}.html">${esc(data.guides[i].title)} →</a></div>`;
  write(`pages/${p.slug}.html`,detail(p,'workshop','工坊',body,'根据已确认的项目方向整理的介绍页；不表示源码、安装包或在线功能已经开放。',data.projects[(i+1)%data.projects.length]));
});
data.guides.forEach((g,i)=>{
  write(`downloads/${g.download}`,g.template);
  const body=paragraphs(g.sections)+`<div class="template-box"><h2 id="template">把这张清单带走</h2><p>可以直接选中复制，也可以下载为通用 Markdown 文件。</p><pre>${esc(g.template)}</pre><a class="button" href="../downloads/${esc(g.download)}" download>下载空白清单 ↓</a></div>`;
  write(`pages/${g.slug}.html`,detail(g,'garden','知识花园',body,'本站整理的入门方法页，待 Kirk 审阅；不是对其既往文章的原文引用。',data.guides[(i+1)%data.guides.length]));
});
data.travels.forEach((t,i)=>{
  const photos=t.photos?.length?t.photos:[{src:t.asset,alt:t.title+'示意图，等待替换为实拍照片'}];
  const body=`<figure class="detail-image">${image(photos[0].src,photos[0].alt,'../','width="1600" height="1000"')}<figcaption>${t.photos?.length?'旅行影像':'当前是示意图，不是真实旅行照片'}<button class="zoom-button" data-lightbox="0" hidden>放大查看 ↗</button></figcaption></figure><h2 id="note">留在这里的一句话</h2><blockquote>${esc(t.quote)}</blockquote><h2 id="record">这段旅程的记录</h2><p>这里为${esc(t.title)}留出一页。现在收录的是首页已有的旅行线索；具体时间、行程、实拍照片和完整游记尚未补入。</p><p>照片到位后，会在这页形成独立影集。你可以放大观看、切换照片，再回到旅行列表，页面结构不需要重做。</p><h2 id="questions">等影像回来，再把故事写完整</h2><ul><li>哪一个具体的场景，让这趟旅行与别处不同？</li><li>拍下这张照片时，你最想留下的是什么？</li><li>离开以后，有什么判断或生活习惯改变了？</li></ul><p class="source-note">以上是待填写的游记提纲，不是虚构的旅行经历。</p><div class="photo-grid">${photos.slice(1).map((p,j)=>`<button data-lightbox="${j+1}" hidden>${image(p.src,p.alt,'../','loading="lazy"')}</button>`).join('')}</div><div id="gallery-data" hidden>${photos.map(p=>image(p.src,p.alt,'../','loading="lazy"')).join('')}</div><dialog class="lightbox" aria-label="旅行影像查看器"><div class="lightbox-toolbar"><span class="lightbox-counter"></span><button data-close aria-label="关闭影像查看器">关闭 ×</button></div><img class="lightbox-image" alt=""><div class="lightbox-toolbar"><button data-photo-step="-1" aria-label="上一张照片">← 上一张</button><p class="lightbox-caption"></p><button data-photo-step="1" aria-label="下一张照片">下一张 →</button></div></dialog>`;
  write(`pages/${t.slug}.html`,detail(t,'travel','远方',body,'旅行记录框架 · 真实影像与游记待补充',data.travels[(i+1)%data.travels.length]));
});
console.log(`Built homepage, ${data.articles.length+data.projects.length+data.guides.length+data.travels.length} detail pages and ${data.guides.length} downloads.`);
