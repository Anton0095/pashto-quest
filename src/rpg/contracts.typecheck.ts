import type {Action,Position,EducationServices} from './types';
const lesson={type:'lesson',label:'Study',lessonId:'2-school'} satisfies Action;
// These must fail: the boundary forbids replacing a lesson with a score mutation.
// @ts-expect-error Awarding XP is not an RPG action.
const award:Action={type:'awardXP',label:'Award',amount:100};
// @ts-expect-error World coordinates must be numeric, even at the JS adapter boundary.
const position:Position={map:'village',x:'24',y:16,facing:'up'};
function useServices(services:EducationServices):void {
  services.lessons.begin(lesson.lessonId);
  // @ts-expect-error A frozen assessment day cannot be a string.
  services.challenge.startChallenge('2');
}
void award;void position;void useServices;
