// One catalog of what Exploration Sites sells, keyed by page file name. Feeds the
// per-page Service + Offer JSON-LD (_includes/head.html) and /llms.txt, so AI
// assistants and search engines read the same facts and prices the pages show.
// Prices come from prices.json — never type a number here.
const p = require("./prices.json");
const n = s => Number(String(s).replace(/,/g, ""));

const S = (name, serviceType, summary, price, extra = {}) => ({ name, serviceType, summary, price: n(price), ...extra });

module.exports = {
  "news-release-map-program": S(
    "News-Release Map Program", "News-release drill maps (monthly subscription)",
    `A monthly subscription for junior mining companies in active drilling: a locked, house-styled base map and a set number of news-release maps each month (up to 4, 8 or 12–15), each delivered within two business days of clean data. From $${p.nrmpCadence}/month with no setup fee and a six-month minimum.`,
    p.nrmpCadence, { monthly: true, group: "Investor maps" }),
  "locators-area-plays": S(
    "Locator & area-play maps", "Regional locator maps",
    `Regional locator and area-play maps that place a mineral project in its district — belts, neighbouring deposits, and infrastructure. From $${p.mapFrom} per map.`,
    p.mapFrom, { group: "Investor maps" }),
  "property-target": S(
    "Property & target maps", "Property and drill-target maps",
    `Property, drill-plan, and target maps showing claims, infrastructure, drilling, and the targets driving a program. From $${p.mapFrom} per map.`,
    p.mapFrom, { group: "Investor maps" }),
  "geoscience-maps": S(
    "Geology, geochemistry & geophysics maps", "Geoscience maps",
    `Geological, geochemical, and geophysical maps — soil grids, magnetics, IP chargeability — that show why targets sit where they do. From $${p.mapFrom} per map.`,
    p.mapFrom, { group: "Investor maps" }),
  "drilling": S(
    "Drill plans & sections", "Drill plans, cross-sections and long sections",
    `Drill plans, cross-sections, and long sections that turn drillhole data into a clear picture of grade, geometry, and continuity. From $${p.mapFrom} per map.`,
    p.mapFrom, { group: "Investor maps" }),
  "3d-models": S(
    "3D isometric models", "3D geological visualization",
    `3D isometric and perspective views of terrain, drilling, and orebodies that show a deposit's scale and shape. From $${p.isoFrom}.`,
    p.isoFrom, { group: "Investor maps" }),
  "schematics-plans": S(
    "Schematics & plans", "Geological schematics and site plans",
    `Deposit models, footprint comparisons, simplified sections, and site plans that frame the geological thesis. From $${p.designFrom}.`,
    p.designFrom, { group: "Investor maps" }),
  "presentations": S(
    "Investor presentations", "Investor presentation design",
    `Corporate investor presentations (decks) for exploration and mining companies, built for roadshows and conferences. From $${p.deckFrom}.`,
    p.deckFrom, { group: "Presentations & design" }),
  "fact-sheets": S(
    "Investor fact sheets", "Investor fact sheet design",
    `One-page investor fact sheets covering project highlights, capital structure, and catalysts. From $${p.designFrom}.`,
    p.designFrom, { group: "Presentations & design" }),
  "conference-booth": S(
    "Conference booths & large-format", "Conference booth design",
    `Conference booth graphics, banners, and large-format maps for mining conferences and trade shows. From $${p.designFrom}.`,
    p.designFrom, { group: "Presentations & design" }),
  "logos-branding": S(
    "Logos & branding", "Brand identity design",
    `Brand identity for exploration and mining companies — logo, colour, type, and usage standards. From $${p.brandFrom}.`,
    p.brandFrom, { group: "Presentations & design" }),
  "movies": S(
    "3D GIS films", "3D GIS flythrough films",
    `Cinematic 3D flythrough films built from GIS and drillhole data, for websites, conferences, and roadshows. From $${p.motionFrom}.`,
    p.motionFrom, { group: "Presentations & design" }),
  "websites": S(
    "Investor websites", "Investor relations website design",
    `Investor websites for exploration and mining companies on Webflow or WordPress, with projects, news releases, and disclosure organised the way investors look for them. From $${p.websiteFrom}.`,
    p.websiteFrom, { group: "Websites" }),
  "wordpress": S(
    "WordPress investor websites", "WordPress website development",
    `Investor websites built and maintained on WordPress. From $${p.websiteFrom}.`,
    p.websiteFrom, { group: "Websites" }),
  "webflow": S(
    "Webflow investor websites", "Webflow website design",
    `Design-led investor websites built on Webflow. From $${p.webflowFrom}.`,
    p.webflowFrom, { group: "Websites" }),
  "hosting": S(
    "Hosting & investor CRM", "Managed website hosting and maintenance",
    `Managed hosting and maintenance for investor websites, including an investor CRM and analytics. $${p.hostingMonthly}/month.`,
    p.hostingMonthly, { monthly: true, group: "Websites" }),
};
