import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

const html = await readFile("index.html", "utf8");
const script = await readFile("script.js", "utf8");
const dom = new JSDOM(html, { url: "https://titep00.github.io/ssu/", runScripts: "outside-only" });
const { window } = dom;
window.prompt = () => null;
window.alert = () => {};
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};
window.open = () => ({ document: { write() {}, close() {} }, print() {} });
const errors = [];
window.addEventListener("error", (event) => errors.push(event.error || event.message));
try { window.eval(script); } catch (error) { errors.push(error); }
if (errors.length) {
  console.error(errors.map((error) => error?.stack || error).join("\n"));
  process.exit(1);
}
if (!window.document.querySelector("#app-content .overview-card")) throw new Error("Dashboard did not render");
console.log("Browser runtime check passed");
