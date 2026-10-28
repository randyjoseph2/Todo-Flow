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
  assert.deepStrictEqual(p, { text: 'Paper towels', costco: true, p1: true, local: false });
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

console.log('\n' + passed + ' tests passed');
