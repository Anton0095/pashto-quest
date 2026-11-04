import type {SaveFence} from './save-fence';
/** Boundary contracts describe the existing JS authorities, not replacement stores. */
export type Direction = 'up' | 'down' | 'left' | 'right';
export type Appearance = 'masculine' | 'feminine' | 'neutral';
export interface Point {x:number; y:number}
export interface Position extends Point {map:string; facing:Direction}
export interface Transition extends Point {to:string; spawn:Point}
export interface WorldMap {furniture?:Array<Point&{kind:string;w:number;h:number}>;name:string; tiles:string[]; collision?:string[]; spawn:Point; transitions:Transition[]; regions:Array<Point & {id:string;name:string;w:number;h:number}>; buildings:Array<Point & {w:number;h:number;label:string;color:string}>}
export type Action = {label:string;condition?:string} & ({type:'flag';flag:string}|{type:'tutorial'|'reference'|'completion'|'sleep'|'dream'}|{type:'lesson';lessonId:string;resumeEvent?:string}|{type:'challenge';day:number;route?:'normal'|'skip'}|{type:'event';event:string}|{type:'explore'}|{type:'scene';position:Position});
export interface StoryEvent {characterId?:string;expression?:string;listener?:string;trigger?:'interaction'|'map';speaker:string;lines:string[];messages?:Array<{characterId?:string;expression?:string;speaker:string;listener?:string;text:string;condition?:string}>;condition?:string;once?:boolean;setFlags?:string[];actions:Action[]}
export interface Schedule extends Point {condition?:string;day:number;map:string;event?:string}
export interface NPC {defaultLocation?:Omit<Schedule,'day'>;characterId:string;interactionRange?:number;animations?:Partial<Record<Direction,string>>;id:string;name:string;sprite:string;condition?:string;event:string;schedule:Schedule[]}
export interface WorldObject extends Point {interactionBounds?:Point&{w:number;h:number};id:string;name:string;map:string;event:string;condition?:string}
export type Actor = WorldObject & {characterId?:string;interactionRange?:number;animations?:Partial<Record<Direction,string>>;sprite?:string;schedule?:Schedule[];facing?:Direction};
export type ChapterRoute='normal'|'skip';
export interface ChapterRoutes {normal:{opening?:string;finale?:string};skip:{event?:string}}
export interface Chapter {guidance?:{introLessonId:string;destination:string;character:string;before:string;after:string;passed:string};routes?:ChapterRoutes;mapEvents?:Record<string,string[]>;presentation?:{milestoneTitle?:string;completeTitle?:string;terminalTitle?:string};id:string;day:number;name:string;intro:string;maps:string[];start:Position;prerequisites:string[];mandatoryEvents:string[];activeNPCs:string[];endingEvent?:string;nextChapter:string|null;objective:string;openingMode?:'automatic'|'interaction';openingEvent?:string;tutorialLessonId?:string;lessons:string[];challenge?:{day:number;npc:string;location?:string;map?:string;conditions?:string[]};completion:{challengePassed?:number;terminal:boolean}}
export interface WorldData {schemaVersion:number;firstDay:number;lastDay:number;start:Position;tiles:Record<string,{walkable:boolean;kind:string}>;maps:Record<string,WorldMap>;npcs:NPC[];objects:WorldObject[];events:Record<string,StoryEvent>;days:Record<string,Chapter>}
export interface Question {id:string;kind:'word'|'construct';retries:number;[key:string]:unknown}
export interface LessonSession {
  mode:'tutorial'|'standard'|'review';id:string;loop:number;loc:string|null;phase:string;cardIndex:number;attemptId:number;
  answered:number;firstCorrect:number;earned:number;tutorialResponses:number;constructionCount:number;locked:boolean;finished?:boolean;
  required:string[];studyWords:string[];greetingCards:string[];studySentences:string[];firstAsked:Set<string>;passed:Set<string>;
  tutorialConstruction?:{built:number[];order:number[];locked:boolean};
  queue:Question[];activeItem?:Question;built:number[];tileOrder?:number[];choices?:string[];
  [key:string]:unknown;
}
export interface ChallengeSession {mode:'challenge';loop:number;correctCount:number;finished?:boolean;[key:string]:unknown}
export type Session = LessonSession | ChallengeSession;
export interface Progress {xp:number;tutorialDone:boolean;playerProfile:{name:string;gender:string};complete:Record<string,boolean>;challenges:Record<string,{best:number;passed:boolean;attempts:number}>;activeChallenge?:{loop:number};library:{attemptSequence:number;acquired:Record<string,unknown>;[key:string]:unknown};[key:string]:unknown}
export interface State {day:number;progress:Progress;session:Session|null;reviewCampaign?:Progress;rpg?:{startWorld():void;navigatePlace():void;reset():void}}
export interface Card {id:string;ps:string;en:string;[key:string]:unknown}
export interface Content {zoneKeys:string[];libraryEntries:Record<string,{countsTowardDailyQuota:boolean}>;wordById:Record<string,Card>;tutorialCards:Array<{id:string;kind:string}>}
export interface UI {
  $(id:string):HTMLElement;
  node<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string,cls?:string):HTMLElementTagNameMap[K];
  button(text:string,fn:(event:MouseEvent)=>void):HTMLButtonElement;
  hud():void;view(name:string):void;portrait(identity:string,expression?:string):HTMLElement;usePhaserPortraits(enabled?:boolean):void;portraitReady(key:string,source:string):void;
}
export interface Learning {allowed(day:number):boolean;placeAccessible(day:number,place:string):boolean}
export interface Progression {passedChallenge(progress:Progress,day:number):boolean;characterStatus(progress:Progress):{xp:number;level:number;title:string};getChallengeSpec(day:number):{passCount:number;questionCount:number}}
export interface EducationStorage {save():boolean|Promise<boolean>;settled():Promise<boolean>;snapshot():string;readonly problem:string|null;readonly persistenceProblem:string|null}
export interface EducationServices {state:State;content:Content;progression:Progression;learning:Learning;ui:UI;audio:{stopAudio():void};storage:EducationStorage;world:{startWorld():void};lessons:{begin(id:string):void;resume(snapshot:LessonSession):void};challenge:{startChallenge(day:number,...args:unknown[]):void;resumeChallenge():boolean};library:{openLibrary():void}}
export interface DialogueCursor {event:string;index:number;resumeEvent?:string}
export interface WorldSave {sleepIntent?:{from:number;to:number};routes?:Record<string,ChapterRoute>;chapter?:string;dialogue?:DialogueCursor;schemaVersion:1;position:Position;appearance:Appearance;flags:Record<string,boolean>;npcFlags:Record<string,boolean>;triggers:Record<string,boolean>;view:'world'|'lesson'|'complete';lesson:unknown;educationFingerprint:string|null}
export interface QuestionService {buildTiles(card:Card|undefined,question:Question|undefined,day:number):Array<{index:number;word:string}>}
export interface RPGDependencies {portraits?:{characters:Record<string,{expressions:Record<string,string|null>}>};fence:SaveFence;data:WorldData;questions:QuestionService}
