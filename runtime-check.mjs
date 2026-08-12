import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

const html = await readFile("index.html", "utf8");
const errors = [];
const dom = new JSDOM(html, {
  url: "https://titep00.github.io/nna/",
  runScripts: "dangerously",
  resources: "usable",
  beforeParse(window) {
    window.alert = () => {};
    window.open = () => ({ document: { write() {}, close() {} }, print() {} });
    window.scrollTo = () => {};
  },
});

dom.window.addEventListener("error", (event) => errors.push(event.error || event.message));
await new Promise((resolve) => setTimeout(resolve, 500));
if (errors.length) {
  console.error(errors.map((error) => error?.stack || error).join("\n"));
  process.exit(1);
}
const settings = dom.window.document.getElementById("stat-settings").textContent;
if (settings === "0") {
  throw new Error("Page initialized with zero settings");
}
console.log(`Runtime check passed: ${settings} settings`);
