import {readFileSync} from 'node:fs';
export const day1=JSON.parse(readFileSync(new URL('./fixtures/rpg-day1.json',import.meta.url),'utf8'));
/** Historical profile compatibility; the shipped Week1 profile has its own full UI routes. */
export function withDay1(html){return html.replace(/const RPG_WORLD_DATA=\{[^\n]+\};\n/,'const RPG_WORLD_DATA='+JSON.stringify(day1)+';\n');}
