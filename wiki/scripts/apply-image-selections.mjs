import fs from 'node:fs';
import path from 'node:path';
import { root } from './entries.mjs';
export function applyImages(){
 const overrides=JSON.parse(fs.readFileSync(path.join(root,'research/image-overrides.json'),'utf8'));let changed=0;
 for(const [slug,o] of Object.entries(overrides)){const p=path.join(root,'data/entries',slug+'.json');const d=JSON.parse(fs.readFileSync(p,'utf8'));d.image=o.image;if(o.gallery!==undefined)d.gallery=o.gallery;fs.writeFileSync(p,JSON.stringify(d));changed++;}return {changed};
}
if(process.argv[1]===new URL(import.meta.url).pathname)console.log(applyImages());
