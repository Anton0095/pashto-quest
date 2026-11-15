import type {WorldData,Position,Chapter,Progress,Progression} from './types';
import {walkable,recover} from './world-data';
/** Only day transfers call this; ordinary resume retains the saved position. */
export function dailySpawn(data:WorldData):Position {
 const bed=data.objects.find(o=>o.id==='house-bed');
 if(bed)for(const [dx,dy]of [[-1,0],[0,1],[1,0],[0,-1]])if(walkable(data,bed.map,bed.x+dx,bed.y+dy))return {map:bed.map,x:bed.x+dx,y:bed.y+dy,facing:dx>0?'right':dx<0?'left':dy>0?'down':'up'};
 return recover(data,data.start);
}
export function dailyGuidance(c:Chapter,p:Progress,progression:Progression,targets?:string[],challengeTarget?:string):string {
 const g=c.guidance;
 if(progression.passedChallenge(p,c.day))return g?.passed??'Return home and sleep when you are ready.';
 if(!p.complete[`${c.day}-school`])return g?.before??'Complete today’s School lesson with Ms Hameed first. You may explore and talk to everyone before studying.';
 const remaining=c.lessons.filter(id=>!p.complete[id]).map(id=>({residential:'Home',nature:'Lake',business:'Market',school:'School'}[id.split('-')[1]]??id));
 return remaining.length?(g?.after??'Continue today’s activities.')+' Remaining: '+(targets?.length?targets:remaining).join(', ')+'.':'You are ready for today’s challenge.'+(challengeTarget?' Go to '+challengeTarget+'.':'');
}
