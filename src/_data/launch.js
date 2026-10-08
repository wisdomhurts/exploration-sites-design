// The Launch Package "commissioned separately" comparison, computed from prices.json
// so it can't drift: 8 investor maps + deck + WordPress site + fact sheet + brand.
const prices = require("./prices.json");

const num = (v) => Number(String(v).replace(/,/g, ""));
const fmt = (n) => n.toLocaleString("en-US");

const maps = 8;
const separate =
  maps * num(prices.mapFrom) +
  num(prices.deckFrom) +
  num(prices.websiteFrom) +
  num(prices.designFrom) + // fact sheet
  num(prices.brandFrom);

module.exports = {
  maps,
  separate: fmt(separate),
  saving: fmt(separate - num(prices.launchPackage)),
};
