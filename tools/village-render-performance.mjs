/* Rendering-only diagnostic: explicit frozen releases; no language-engine benchmark. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {setup} from '../tests/browser-fixture.mjs';
const arg=(name,fallback)=>{const n=process.argv.indexOf(name);return n<0?fallback:process.argv[n+1];};
const release=arg('--release','index.html'),output=arg('--output','work/village-render-performance.json');
const stats=values=>{const a=[...values].sort((a,b)=>a-b);return {samples:a.length,medianMs:a[Math.floor(a.length/2)],p95Ms:a[Math.min(a.length-1,Math.ceil(a.length*.95)-1)]};};
const report={releaseSha256:createHash('sha256').update(readFileSync(release)).digest('hex'),releaseBytes:readFileSync(release).length,method:'Loopback Chromium, offline release, three world boots per profile; 120 requestAnimationFrame intervals, cached textures and scene objects. Mobile 375px with 4× CPU throttle. Shared-host diagnostic; not GPU timing or physical Safari. No educational state or grading fixture.',profiles:[]};
for(const [width,rate]of [[1280,1],[375,4]]){
 const b=await setup({width,rpg:true,bridge:false,offline:true,htmlPath:release,transform:h=>h.replace('// @TEST_HOOK','const oldCreate=PashtoRPG.VillageScene.prototype.create;PashtoRPG.VillageScene.prototype.create=function(){oldCreate.call(this);window.__renderScene=this;}; // @TEST_HOOK')});
 try{
 await b.page.close();let p,context;const boots=[],errors=[];
 for(let i=0;i<3;i++){if(context)await context.close();context=await b.browser.newContext({viewport:{width,height:900}});p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));const cdp=await context.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate});await p.goto(b.url);await p.bringToFront();const start=Date.now();await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.phaser&&window.__renderScene?.player);boots.push(Date.now()-start);}
 const frames=await p.evaluate(async()=>{const deltas=[];await new Promise(resolve=>{let previous;function frame(now){if(previous)deltas.push(now-previous);previous=now;if(deltas.length<120)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});return deltas;});
 const scene=await p.evaluate(()=>{const textures=__renderScene.textures.getTextureKeys().map(k=>{const t=__renderScene.textures.get(k).getSourceImage();return {key:k,width:t.width,height:t.height};});return {objects:__renderScene.children.length,textures,estimatedTextureRgbaBytes:textures.reduce((n,t)=>n+t.width*t.height*4,0)};});
 report.profiles.push({width,cpuThrottle:rate,browser:b.browser.version(),boot:stats(boots),frames:stats(frames),averageFps:1000/(frames.reduce((a,b)=>a+b,0)/frames.length),scene,errors:[...b.errors,...errors]});
 if(b.errors.length||errors.length)throw Error([...b.errors,...errors].join('\n'));await context.close();
 }finally{await b.close();}
}
writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(output);
