// Tells IndexNow-participating search engines (Bing, which feeds ChatGPT search and
// Copilot, plus Yandex, Seznam and Naver) that the site's pages changed, so they
// re-crawl now instead of eventually. Run after a production deploy that changes
// content:  npm run indexnow
// The key file src/446d45b491bb1d660b1f96d071d35dad.txt proves ownership; it must stay at the site root.
const HOST = "www.explorationsites.com";
const KEY = "446d45b491bb1d660b1f96d071d35dad";

const sitemap = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).concat(`https://${HOST}/llms.txt`);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: submitted ${urlList.length} URLs → HTTP ${res.status} ${res.statusText}`);
if (!res.ok && res.status !== 202) { console.error(await res.text()); process.exit(1); }
