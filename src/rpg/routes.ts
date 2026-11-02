import type {Chapter,ChapterRoute,Progress,WorldSave} from './types';
/** Narrative routes record actual event choices, never educational visits or grades. */
export function createChapterRoutes({chapter,progress,save}:{chapter:()=>Chapter;progress:()=>Progress;save:()=>WorldSave}) {
  const visited=()=>chapter().lessons.every(id=>progress().complete[id]);
  function resolved(route:ChapterRoute){const rules=chapter().routes;if(!rules)return true;
    const event=route==='normal'?rules.normal.finale:rules.skip.event;
    return (!event||!!save().triggers[event])&&(route!=='normal'||!rules.normal.opening||!!save().triggers[rules.normal.opening]);
  }
  return {visited,resolved,
    selected:()=>save().routes?.[chapter().id],
    select(route:ChapterRoute){if(route==='normal'&&(!visited()||!resolved(route)))return false;if(route==='skip'&&!resolved(route))return false;(save().routes??={})[chapter().id]=route;return true;},
    complete(){const rules=chapter().routes,route=save().routes?.[chapter().id];return !rules||!!route&&resolved(route);},
    request(){return visited()&&resolved('normal')?'normal' as const:'skip' as const;}};
}
