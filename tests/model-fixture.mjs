import { readFileSync } from "node:fs";
import vm from "node:vm";
export function models() {
  const read = (name) =>
    readFileSync(new URL("../" + name, import.meta.url), "utf8");
  const context = {
    curriculum: {
      curriculum: JSON.parse(read("content/LEARNING_CURRICULUM.json")),
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
