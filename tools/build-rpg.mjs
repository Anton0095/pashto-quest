import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
execFileSync(process.execPath,['node_modules/typescript/bin/tsc','--noEmit'],{stdio:'inherit'});
mkdirSync('generated',{recursive:true});mkdirSync('work',{recursive:true});
const output=await build({entryPoints:['src/rpg/index.ts'],bundle:true,format:'iife',globalName:'PashtoRPG',target:'safari15',minify:true,legalComments:'eof',write:false});
// The Python assembler embeds this inside a script element. Escape HTML terminators.
const script=output.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const file='generated/rpg.bundle.js';
if(process.argv.includes('--check')){if(readFileSync(file,'utf8')!==script)throw Error('Stale RPG bundle: run python3 tools/build.py');}
else writeFileSync(file,script);
await build({entryPoints:['src/rpg/model.ts'],bundle:true,platform:'node',format:'cjs',target:'node20',outfile:'work/rpg-model.cjs'});

const model=createRequire(import.meta.url)('../work/rpg-model.cjs');
model.createRPGRegistry(JSON.parse(readFileSync('content/RPG_WORLD.json','utf8')),{});
