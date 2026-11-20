// Inventory the live Index; keep the original baseline and regenerate the remaining queue.
import fs from 'node:fs';import path from 'node:path';import {allEntries,root,slug} from './entries.mjs';
const dir=path.join(root,'research/image-audit');fs.mkdirSync(dir,{recursive:true});
const baseline=JSON.parse(fs.readFileSync(path.join(dir,'baseline.json')));const before=new Map(baseline.map(r=>[r.slug,r]));
const rows=allEntries({withPending:false}).filter(e=>['compound','gear','meta'].includes(e.kind)).map(e=>{const s=slug(e.item.name),p='data/entries/'+s+'.json';let d={};try{d=JSON.parse(fs.readFileSync(path.join(root,p)))}catch{};const image=d.image;return {name:e.item.name,kind:e.kind,slug:s,status:image?.url?'has_lead':e.kind==='compound'&&e.item.structure?'structure_fallback':'missing',before:before.get(s)?.status||'unknown',image_url:image?.url||'',source:image?.credit||'',creator:image?.creator||'',license:image?.license||'',file:p,entry_url:`index.html#/${e.kind}/${s}`};});
function csv(rs,fields){return [fields.join(','),...rs.map(r=>fields.map(f=>'"'+String(r[f]??'').replace(/[\r\n]+/g,' ').replaceAll('"','""')+'"').join(','))].join('\n')+'\n';}
const fields=['name','kind','slug','status','before','image_url','source','creator','license','file','entry_url'];
const missingCsv=csv(rows.filter(r=>r.status==='missing'),fields);
fs.writeFileSync(path.join(dir,'missing-images.csv'),missingCsv);
fs.writeFileSync(path.join(dir,'remaining-missing-images.csv'),missingCsv);
fs.writeFileSync(path.join(dir,'structure-fallbacks.csv'),csv(rows.filter(r=>r.status==='structure_fallback'),fields));
fs.writeFileSync(path.join(dir,'image-changes.csv'),csv(rows.filter(r=>r.before!==r.status||r.slug==='80-20-rule-dating'),fields));
fs.writeFileSync(path.join(dir,'current-inventory.csv'),csv(rows,fields));
const counts=rs=>rs.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{});let report={entries:rows.length,before:counts(baseline),after:counts(rows),added:rows.filter(r=>r.status==='has_lead'&&r.before!=='has_lead').length};fs.writeFileSync(path.join(dir,'summary.json'),JSON.stringify(report,null,2));console.log(report);
