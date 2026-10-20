// Retainer desks (credit model, 2026-10-20). Single source for the Engagement and
// pricing pages. Prices come from prices.json; credits, menu and rules live here.
// 1 credit ≈ 1 hour of production. The menu was checked against real jobs
// (invoices 5919, 5920 and 6346): new map ≈ 6 h, data update ≈ 3 h.
// Terms §04 states the same rules in legal form.
const p = require("./prices.json");

module.exports = {
  tiers: [
    {
      name: "Explorer Desk",
      price: p.retainerFrom,
      for: "For juniors with one program a year.",
      credits: 120,
      perQuarter: 30,
      note: "A typical year: eight new maps, ten data updates, a new investor deck, a booth banner and regular website updates.",
      features: [
        "Opening audit of your maps, deck, website and fact sheet",
        "Monthly one-page report of credits used and work delivered",
        "Unused credits roll forward one quarter",
      ],
      response: "3 business days",
      extra: "190",
    },
    {
      name: "Developer Desk",
      price: p.retainerDev,
      for: "For companies in an active program.",
      credits: 260,
      perQuarter: 65,
      note: "Borrow up to one quarter ahead for conference season or a financing.",
      features: [
        "Everything in Explorer Desk",
        "Website hosting with investor CRM and analytics",
        "News-Release Map Program setup waived",
      ],
      response: "48 hours",
      extra: "175",
    },
    {
      name: "Producer Desk",
      price: p.retainerProducer,
      for: "For advancing issuers with a full investor-relations calendar.",
      credits: 640,
      perQuarter: 160,
      note: "Covers 3D models and motion work. Borrowing ahead included.",
      features: [
        "Everything in Developer Desk",
        "First in the queue during a financing",
        "Quarterly planning call against your catalyst calendar",
      ],
      response: "36 hours",
      extra: "160",
    },
  ],
  menu: [
    { item: "Map data update (new holes, assays, geophysics)", credits: "3" },
    { item: "New map or section", credits: "6" },
    { item: "New investor deck", credits: "25" },
    { item: "Website updates", credits: "from 0.5" },
    { item: "Booth banner", credits: "6" },
    { item: "3D model", credits: "from 9" },
  ],
  rules: [
    "Credits are released each quarter and agreed before work starts",
    "Every item includes two rounds of revisions",
    "Rush work, under 24 hours, costs 1.5× credits",
    "12-month term, then month to month; step down one desk after month six",
  ],
};
