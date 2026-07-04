import { readFileSync, writeFileSync } from "node:fs";

const html = readFileSync("src/site/home.html", "utf8");
const site = html
  .replace(/href="\.\.\/css\//g, 'href="/css/')
  .replace(/href="css\//g, 'href="/css/')
  .replace(/href="overrides\.css/g, 'href="/overrides.css')
  .replace(/href="assets\//g, 'href="/assets/')
  .replace(/src="js\//g, 'src="/js/')
  .replace(/src="assets\//g, 'src="/assets/')
  .replace(/data-src="assets\//g, 'data-src="/assets/')
  .replace(/href="coming-soon\.html/g, 'href="/coming-soon.html');

writeFileSync("public/site.html", site);
