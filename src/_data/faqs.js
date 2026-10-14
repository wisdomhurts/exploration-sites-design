// FAQ blocks, keyed by page file name. Rendered by _includes/faq.html (visible
// Q&A + FAQPage JSON-LD) on any page that includes it. Approved 2026-10-14
// (docs/ai-visibility/phase2-drafts.md). Prices come from prices.json — keep them
// out of the strings. Answers are HTML.
const p = require("./prices.json");

module.exports = {
  "news-release-map-program": [
    {
      q: "How fast can I get a drill-results map for a news release?",
      a: `On the News-Release Map Program, within two business days of clean, complete data — collar, survey and assay tables plus the text you want on the map — for up to two maps per request. Larger batches get a delivery schedule agreed with you. One-off maps outside the program typically take 3–7 business days.`,
    },
    {
      q: "How much does a news-release map cost?",
      a: `A one-off map starts at $${p.mapFrom} CAD. On the Map Program, maps come as monthly capacity: Cadence is $${p.nrmpCadence}/month for up to 4 maps, Active Drill $${p.nrmpActive} for up to 8, and Full Program $${p.nrmpFull} for up to 12–15, with a one-time $${p.nrmpSetup} setup and a four-month minimum. Extra maps are $${p.nrmpOverage} each. All prices are in Canadian dollars, before tax.`,
    },
    {
      q: "What do you need from us?",
      a: `Claim boundaries and your drilling to date — collars, downhole surveys and assays, or simply the drill-database export. For each new set of results, send the new holes' data. Your Qualified Person reviews and approves every map before release.`,
    },
    {
      q: "Can we pause between drill programs?",
      a: `Yes. You can pause for up to six months, with your locked base map kept. Paused months don't count toward the four-month minimum.`,
    },
  ],
  "presentations": [
    {
      q: "How much does an investor presentation for a mining company cost?",
      a: `Decks start at $${p.deckFrom} CAD and typically take 4–6 weeks, depending on how many maps and figures are needed and how much of the story is being rebuilt.`,
    },
    {
      q: "What should a junior mining company's investor presentation include?",
      a: `A one-line thesis on slide one; the project in its regional context; the key result shown on a section, not buried in a table; a scale anchor against known deposits; a dated catalyst calendar; cash, burn and what the raise funds; capital structure; and a factual management record. Our free <a href="/fundable-materials-scorecard.html">Fundable Materials Scorecard</a> lists all twelve criteria a generalist investor checks.`,
    },
    {
      q: "Do you make the maps in the deck too?",
      a: `Yes. Locator, property, geoscience, drill and 3D figures are drawn to one standard, so the deck, fact sheet and website read as one company.`,
    },
  ],
  "websites": [
    {
      q: "What should a mining company's investor website include?",
      a: `At minimum: Projects, News, Investors, Corporate and Contact sections, plus a live share quote, a news-release archive and links to your SEDAR+ filings. The project pages should answer an analyst's next question — location, geology, sections, resources, catalysts — without a phone call.`,
    },
    {
      q: "Webflow or WordPress for a junior mining company?",
      a: `Webflow suits companies that want a polished, design-led site that's quick to launch and easy to keep current, with less plugin maintenance. WordPress suits companies that need bespoke functionality — multi-language, complex document libraries, deep integrations — or already run on it. We build and maintain both.`,
    },
    {
      q: "How much does an investor website cost, and how long does it take?",
      a: `WordPress sites start at $${p.websiteFrom} CAD and Webflow sites at $${p.webflowFrom} CAD; both typically take about five weeks.`,
    },
  ],
  "hosting": [
    {
      q: "What does managed hosting include?",
      a: `$${p.hostingMonthly} CAD/month covers a global CDN with SSL, daily backups, uptime monitoring, software updates, and content updates on request — news releases, figures and filings posted for you. Every hosted site also includes an investor CRM and investor analytics.`,
    },
    {
      q: "Do you host sites you didn't build?",
      a: `No. Managed hosting is for investor websites we build, so we can keep them fast, secure and current. If you have an existing site, we can rebuild it on <a href="/webflow.html">Webflow</a> or <a href="/wordpress.html">WordPress</a> and host it from there.`,
    },
  ],
};
