import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const data=JSON.parse(fs.readFileSync(path.join(root,'content/site.json'),'utf8'));
const pages=['index.html',...[...data.articles,...data.projects,...data.guides,...data.travels].map(p=>'pages/'+p.slug+'.html')];
const origin='http://127.0.0.1:4173/';
const checks=[];
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const file of pages){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 assert.equal((html.match(/<h1\b/g)||[]).length,1,file+' needs one h1');
 assert(!html.includes('/Users/')&&!html.includes('Kirk_WorkOS'),file+' leaks a workspace path');
 assert(!/<script[^>]+src="https?:/i.test(html),'remote script');
 const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
 assert(ids.has('main'));
 const targets=[...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map(m=>m[1]).filter(Boolean);
 for(const target of targets){
  const url=new URL(target,origin+file);
  assert.equal(url.origin,new URL(origin).origin,'unexpected external link: '+target);
  const targetFile=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';
  assert(fs.existsSync(path.join(root,targetFile)),file+' -> missing '+targetFile);
  if(url.hash&&targetFile.endsWith('.html')){
   const targetHtml=fs.readFileSync(path.join(root,targetFile),'utf8');
   assert(targetHtml.includes('id="'+url.hash.slice(1)+'"'),file+' -> missing anchor '+url.hash);
  }
 }
 const response=await fetch(origin+file);
 assert.equal(response.status,200,file);
 assert.equal(await response.text(),html);
 checks.push({file,linksAndAssets:targets.length,status:response.status});
}
for(const article of data.articles){
 assert(article.blocks.length>40,'article was truncated');
 const html=fs.readFileSync(path.join(root,'pages',article.slug+'.html'),'utf8');
 for(const block of article.blocks)assert(html.includes(escape(block.text)),article.slug+' lost source text');
}
for(const guide of data.guides){
 const response=await fetch(origin+'downloads/'+guide.download);
 assert.equal(response.status,200);
 assert.equal((await response.text()).trim(),guide.template.trim());
}
for(const name of ['PublicSans-Regular.woff2','PublicSans-ExtraBold.woff2']){
 const response=await fetch(origin+'assets/fonts/'+name);assert.equal(response.status,200);
 assert((await response.arrayBuffer()).byteLength>30000);
}
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
assert(css.includes('prefers-reduced-motion:reduce'));
assert(!/opacity:\s*0\b/.test(css),'content must not wait on JS to become visible');
console.log(JSON.stringify({passed:true,pages:checks,articleBlocks:data.articles.map(a=>({slug:a.slug,blocks:a.blocks.length})),downloads:data.guides.length,fonts:2,notes:'HTTP/content/asset checks. Browser interaction and responsive visual acceptance are separate.'},null,2));
