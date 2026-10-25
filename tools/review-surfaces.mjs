// Read-only export of the actual catalog and authored assessment blueprints.
import { readFileSync } from "node:fs";
import vm from "node:vm";
const html = readFileSync("index.html", "utf8");
const context = Object.fromEntries(
  ["GAME_DATA", "WEEK2_DATA", "LIBRARY_DATA", "NARRATIVE_DATA"].map((n) => [
    n,
    JSON.parse(html.match(new RegExp("const " + n + "=(\\{.*?\\});", "s"))[1]),
  ]),
);
const names = [
  "library-engine",
  "content",
  "progression",
  "question-engine",
  "assessment-content",
  "grammar-content",
];
const result = vm.runInNewContext(
  names.map((n) => readFileSync("src/" + n + ".js", "utf8")).join("\n") +
    `
 const content=createContent(GAME_DATA,WEEK2_DATA,LIBRARY_DATA,NARRATIVE_DATA);
 const progression=createProgression(content,LibraryEngine);
 const authored=createAssessmentContent({content,progression,shuffle:list=>[...list]});
 ({scenes:Array.from({length:14},(_,i)=>content.zoneKeys.map(location=>({day:i+1,location,teacher:content.teacherFor(i+1,location,'standard').name,participants:content.peopleAt[i+1]?.[location]||[content.teacherFor(i+1,location,'standard').name]}))).flat(),cards:Object.values(content.wordById),tutorial:content.tutorialCards,grammar:GrammarContent,
 assessments:Array.from({length:14},(_,i)=>({day:i+1,questions:authored.selectAuthoredChallenge(i+1)}))});`,
  context,
);
process.stdout.write(JSON.stringify(result));
