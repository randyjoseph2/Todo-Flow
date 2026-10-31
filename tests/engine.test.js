var assert = require('assert');
var E = require('../src/engine.js');

var passed = 0;
function t(name, fn) {
  fn();
  passed++;
  console.log('ok - ' + name);
}
function key(data, name) { return E.classify(data, name).key; }

t('seed: basics from the real grocery list', function () {
  var d = E.emptyData();
  assert.strictEqual(key(d, 'Frigo cheese sticks'), 'dairy');
  assert.strictEqual(key(d, 'Pumpkins'), 'produce');
  assert.strictEqual(key(d, 'Tortillas'), 'bakery');
  assert.strictEqual(key(d, 'Potatoes'), 'produce');
  assert.strictEqual(key(d, 'Shout'), 'other');
});

t('seed: whole words and longest phrase win', function () {
  var d = E.emptyData();
  assert.strictEqual(key(d, 'peanut butter'), 'pantry');
  assert.strictEqual(key(d, 'rice'), 'pantry');
  assert.strictEqual(key(d, 'ice cream'), 'frozen');
  assert.strictEqual(key(d, 'cream cheese'), 'dairy');
  assert.strictEqual(key(d, 'sweet potatoes'), 'produce');
  assert.strictEqual(key(d, 'black pepper'), 'pantry');
});

t('normalize: tags, quantities, plurals', function () {
  assert.strictEqual(E.normalize('[Costco] 2 lbs Ground Beef'), 'ground beef');
  assert.strictEqual(E.normalize('12 pack Gatorade (variety)'), 'gatorade');
  assert.strictEqual(E.normalize('Cookies'), E.normalize('cookie'));
  assert.strictEqual(E.normalize('Tomatoes'), E.normalize('tomato'));
  assert.strictEqual(E.normalize('7up'), '7up');
});

t('parse/build round trip keeps tags', function () {
  var p = E.parse('[P1] [Costco] Paper towels');
  assert.deepStrictEqual(p, { text: 'Paper towels', costco: true, p1: true, local: false, walmart: false, ht: false, rep: null });
  assert.strictEqual(E.build(p), '[P1] [Costco] Paper towels');
  assert.strictEqual(E.build({ text: 'Milk', costco: false, p1: false }), 'Milk');
});

t('store lean: any / costco / local round trip', function () {
  var p = E.parse('Eggs');
  assert.strictEqual(E.lean(p), 'any');
  E.setLean(p, 'costco');
  assert.strictEqual(E.build(p), '[Costco] Eggs');
  E.setLean(p, 'local');
  assert.strictEqual(E.build(p), '[Local] Eggs');
  assert.strictEqual(E.lean(E.parse('[Local] Eggs')), 'local');
  assert.strictEqual(E.normalize('[Local] Eggs'), 'egg');
  E.setLean(p, 'walmart');
  assert.strictEqual(E.build(p), '[Walmart] Eggs');
  assert.strictEqual(E.lean(E.parse('[P1] [Walmart] Eggs')), 'walmart');
  assert.strictEqual(E.normalize('[Walmart] Eggs'), 'egg');
  E.setLean(p, 'ht');
  assert.strictEqual(E.build(p), '[HT] Eggs');
  assert.strictEqual(E.lean(E.parse('[HT] Eggs')), 'ht');
  assert.strictEqual(E.lean(E.parse('[Harris Teeter] Eggs')), 'ht');
  assert.strictEqual(E.parse('[P1] [HT] Eggs').p1, true);
  assert.strictEqual(E.normalize('[HT] Eggs'), 'egg');
  E.setLean(p, 'any');
  assert.strictEqual(E.build(p), 'Eggs');
});

t('learn: exact override, generalizes, then forget', function () {
  var d = E.emptyData();
  assert.strictEqual(key(d, 'Shout'), 'other');
  var op = E.learn(d, 'Shout', 'household');
  assert.strictEqual(op.norm, 'shout');
  assert.strictEqual(key(d, 'shout'), 'household');
  assert.strictEqual(key(d, 'Shout spray'), 'household');
  assert.strictEqual(E.classify(d, 'Shout').src, 'learned');
  E.forget(d, 'shout');
  assert.strictEqual(key(d, 'Shout'), 'other');
  assert.deepStrictEqual(d.tok, {});
});

t('learn: two agreeing corrections beat the dictionary', function () {
  var d = E.emptyData();
  assert.strictEqual(key(d, 'cheese crackers'), 'pantry');
  E.learn(d, 'goldfish cheese', 'pantry');
  E.learn(d, 'cheese puffs', 'pantry');
  assert.strictEqual(key(d, 'cheese snack'), 'pantry');
  assert.strictEqual(key(d, 'shredded cheese'), 'dairy');
});

t('learn: re-teaching moves the item and fixes counts', function () {
  var d = E.emptyData();
  E.learn(d, 'kombucha', 'pantry');
  E.learn(d, 'kombucha', 'dairy');
  assert.strictEqual(key(d, 'kombucha'), 'dairy');
  assert.strictEqual(d.tok.kombucha.pantry, undefined);
  assert.strictEqual(d.tok.kombucha.dairy, 1);
});

t('orderedCats: respects order, other always last', function () {
  var o = E.orderedCats(['frozen', 'produce']);
  assert.strictEqual(o[0].k, 'frozen');
  assert.strictEqual(o[1].k, 'produce');
  assert.strictEqual(o[o.length - 1].k, 'other');
  assert.strictEqual(o.length, E.SEED.length + 1);
});

t('learned store default: tag wins, then learned, then any', function () {
  var d = E.emptyData();
  assert.strictEqual(E.effLean(d, 'Paper towels'), 'any');
  var op = E.learnStore(d, 'Paper towels', 'costco');
  assert.deepStrictEqual(op, { norm: 'paper towel', store: 'costco' });
  assert.strictEqual(E.effLean(d, 'paper towel'), 'costco');
  assert.strictEqual(E.effLean(d, '[Walmart] Paper towels'), 'walmart');
  assert.strictEqual(E.learnedStore(d, '[HT] Paper towels'), 'costco');
  E.learnStore(d, 'paper towels', 'any');
  assert.strictEqual(E.effLean(d, 'Paper towels'), 'any');
  assert.deepStrictEqual(d.stores, {});
});

t('pantry staples: built-in, user-set, user-cleared', function () {
  var d = E.emptyData();
  assert.strictEqual(E.isStaple(d, 'Salt'), true);
  assert.strictEqual(E.isStaple(d, 'Butter'), false);
  E.setStaple(d, 'Butter', true);
  assert.strictEqual(E.isStaple(d, 'butter'), true);
  E.setStaple(d, 'Salt', false);
  assert.strictEqual(E.isStaple(d, 'Salt'), false);
  E.clearStaple(d, 'salt');
  assert.strictEqual(E.isStaple(d, 'Salt'), true);
});

t('fmtQty: fractions and rounding', function () {
  assert.strictEqual(E.fmtQty(0.25), '1/4');
  assert.strictEqual(E.fmtQty(0.333), '1/3');
  assert.strictEqual(E.fmtQty(3.5), '3 1/2');
  assert.strictEqual(E.fmtQty(2), '2');
  assert.strictEqual(E.fmtQty(0), '');
  assert.strictEqual(E.fmtQty(2.97), '3');
});

t('mealieMerge: merges across recipes, sums units, files by category, flags staples and list matches', function () {
  var unit = function (name, plural) { return { name: name, plural_name: plural || null }; };
  var ing = function (food, q, u, label) { return { quantity: q, unit: u || null, food: food ? { name: food, label: label ? { name: label } : null } : null, note: food ? '' : 'Salt and pepper' }; };
  var chicken = { ingredients: [ing('chicken breast', 500, unit('gram'), 'Meat'), ing('garlic', 2, unit('clove', 'cloves'), 'Produce'), ing(null, 0, null), ing('butter', 3.5, unit('tablespoon'), 'Dairy Products')] };
  var pasta = { ingredients: [ing('garlic', 3, unit('clove', 'cloves'), 'Produce'), ing('chicken breast', 1, unit('pound')), ing('smoked paprika', 1, unit('teaspoon'), 'Spices')] };
  var d = E.emptyData();
  var out = E.mealieMerge(d, [{ title: 'Honey Garlic Chicken', recipe: chicken }, { title: 'Chicken Pasta', recipe: pasta }], { 'butter': true });
  var by = {};
  out.forEach(function (i) { by[i.norm] = i; });
  assert.strictEqual(by['garlic'].qty, '5 cloves');
  assert.deepStrictEqual(by['garlic'].recipes, ['Honey Garlic Chicken', 'Chicken Pasta']);
  assert.strictEqual(by['chicken breast'].qty, '500 g + 1 lb');
  assert.strictEqual(by['chicken breast'].cat, 'meat');
  assert.strictEqual(by['butter'].onList, true);
  assert.strictEqual(by['butter'].qty, '3 1/2 tbsp');
  assert.strictEqual(by['salt and pepper'].staple, true);
  assert.strictEqual(by['smoked paprika'].cat, 'pantry', 'Mealie Spices label maps to pantry');
  assert.strictEqual(E.mealieSummary(by['garlic']), 'Garlic (5 cloves)');
  assert.strictEqual(E.mealieSummary(by['salt and pepper']), 'Salt and pepper');
  assert.strictEqual(E.classify(d, E.mealieSummary(by['garlic'])).key, 'produce', 'quantity in parentheses does not hurt classification');
});

t('repeats: parse, label, tag round trip', function () {
  var p = E.parse('[P1] [R:2w] Water the plants');
  assert.strictEqual(p.rep, '2w');
  assert.strictEqual(p.p1, true);
  assert.strictEqual(E.build(p), '[P1] [R:2w] Water the plants');
  assert.strictEqual(E.parse('[R:bogus] x').rep, null);
  assert.strictEqual(E.repLabel('1w'), 'Weekly');
  assert.strictEqual(E.repLabel('3d'), 'Every 3 days');
  assert.strictEqual(E.repLabel('wd'), 'Weekdays');
});

t('repeats: next due keeps the schedule and skips the past', function () {
  assert.strictEqual(E.nextDue('1w', '2026-11-03', '2026-11-03'), '2026-11-10');
  assert.strictEqual(E.nextDue('1w', '2026-11-03', '2026-11-20'), '2026-11-24', 'late completion skips missed weeks');
  assert.strictEqual(E.nextDue('1d', null, '2026-11-03'), '2026-11-04');
  assert.strictEqual(E.nextDue('1m', '2026-01-31', '2026-01-31'), '2026-02-28', 'month end clamps');
  assert.strictEqual(E.nextDue('wd', '2026-11-06', '2026-11-06'), '2026-11-09', 'Friday to Monday');
  assert.strictEqual(E.nextDue('1y', '2026-11-03', '2026-11-03'), '2027-11-03');
});

t('date words: due dates and repeats come off the end', function () {
  var now = new Date(2026, 9, 31, 9, 0, 0);
  var a = E.dateWords('Call the vet tomorrow', now);
  assert.deepStrictEqual([a.text, a.due, a.rep], ['Call the vet', '2026-11-01', null]);
  var b = E.dateWords('Pay rent friday', now);
  assert.deepStrictEqual([b.text, b.due], ['Pay rent', '2026-11-06']);
  var c = E.dateWords('Trash out every tuesday', now);
  assert.deepStrictEqual([c.text, c.due, c.rep], ['Trash out', '2026-11-03', '1w']);
  var d = E.dateWords('Change filter every 3 months', now);
  assert.deepStrictEqual([d.text, d.rep], ['Change filter', '3m']);
  var e = E.dateWords('Dentist nov 12', now);
  assert.deepStrictEqual([e.text, e.due], ['Dentist', '2026-11-12']);
  var f = E.dateWords('Renew tags 3/5', now);
  assert.strictEqual(f.due, '2027-03-05');
  var g = E.dateWords('Send invoice in 2 weeks', now);
  assert.strictEqual(g.due, '2026-11-14');
  var h = E.dateWords('Vacuum daily', now);
  assert.deepStrictEqual([h.text, h.rep], ['Vacuum', '1d']);
  var i = E.dateWords('Take out trash every weekday', now);
  assert.strictEqual(i.rep, 'wd');
  var j = E.dateWords('Pay bill on the 15th', now);
  assert.strictEqual(j.found, false, 'unsupported phrasing is left alone');
  var k = E.dateWords('Friday', now);
  assert.strictEqual(k.found, false, 'a lone date word stays as the text');
  var l = E.dateWords('Buy sun tan lotion', now);
  assert.strictEqual(l.found, false, 'words in the middle are left alone');
});

console.log('\n' + passed + ' tests passed');
