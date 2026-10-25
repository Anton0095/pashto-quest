import { readFileSync } from "node:fs";
import vm from "node:vm";
export function models() {
  const read = (name) =>
    readFileSync(new URL("../" + name, import.meta.url), "utf8");
  const week2 = JSON.parse(read("content/WEEK2_RUNTIME.json"));
  const context = {
    curriculum: {
      week2Days: Object.fromEntries(week2.days.map((d) => [d.day, d])),
      loops: Array.from({ length: 14 }, (_, i) => ({ id: i + 1 })),
      zoneKeys: ["residential", "nature", "business", "school"],
    },
  };
  return vm.runInNewContext(
    read("src/library-engine.js") +
      "\n" +
      read("src/progression.js") +
      "\n" +
      read("src/question-engine.js") +
      ";({E:LibraryEngine,...createProgression(curriculum,LibraryEngine),...QuestionEngine})",
    context,
  );
}
