/* Todo Flow engine - classification + learning. Pure functions, no DOM. */
var TodoFlowEngine = (function () {
  'use strict';

  var SEED = [
    { k: 'household', l: 'Household', c: '#94a3b8', w: [
      'toilet paper', 'paper towel', 'napkin', 'tissue', 'soap', 'dish soap', 'laundry', 'detergent', 'bleach',
      'cleaner', 'sponge', 'trash bag', 'garbage bag', 'ziplock', 'foil', 'aluminum foil', 'plastic wrap',
      'parchment', 'coffee filter', 'battery', 'lightbulb', 'light bulb', 'candle', 'shampoo', 'conditioner',
      'toothpaste', 'toothbrush', 'floss', 'deodorant', 'razor', 'lotion', 'sunscreen', 'hand sanitizer',
      'bandage', 'vitamin', 'supplement', 'pet food', 'cat food', 'dog food', 'litter', 'dryer sheet',
      'fabric softener', 'body wash', 'mouthwash', 'cotton ball', 'q tip'
    ] },
    { k: 'produce', l: 'Produce', c: '#4ade80', w: [
      'apple', 'banana', 'grape', 'strawberry', 'blueberry', 'raspberry', 'blackberry', 'orange', 'lemon', 'lime',
      'avocado', 'tomato', 'lettuce', 'spinach', 'kale', 'broccoli', 'cauliflower', 'carrot', 'celery',
      'cucumber', 'zucchini', 'pepper', 'bell pepper', 'jalapeno', 'onion', 'garlic', 'potato', 'sweet potato',
      'mushroom', 'corn', 'asparagus', 'green bean', 'pea', 'mango', 'peach', 'plum', 'watermelon', 'cantaloupe',
      'pineapple', 'berry', 'herb', 'basil', 'cilantro', 'parsley', 'ginger', 'scallion', 'green onion', 'leek',
      'cabbage', 'beet', 'radish', 'arugula', 'chard', 'squash', 'pumpkin', 'eggplant', 'melon', 'cherry',
      'fig', 'tangerine', 'clementine', 'pear', 'salad', 'coleslaw'
    ] },
    { k: 'dairy', l: 'Dairy & Eggs', c: '#fef08a', w: [
      'milk', 'butter', 'cheese', 'cream', 'yogurt', 'yoghurt', 'egg', 'sour cream', 'cream cheese',
      'cottage cheese', 'heavy cream', 'half and half', 'whipped cream', 'parmesan', 'cheddar', 'mozzarella',
      'brie', 'feta', 'gouda', 'ricotta', 'kefir', 'ghee', 'creamer', 'oat milk', 'almond milk', 'soy milk',
      'cheese stick', 'string cheese', 'shredded cheese'
    ] },
    { k: 'meat', l: 'Meat & Seafood', c: '#f87171', w: [
      'chicken', 'beef', 'pork', 'turkey', 'lamb', 'salmon', 'tuna', 'shrimp', 'tilapia', 'cod', 'bacon',
      'sausage', 'ham', 'steak', 'ground beef', 'ground turkey', 'hot dog', 'bratwurst', 'pepperoni', 'salami',
      'prosciutto', 'deli', 'lunch meat', 'lunchmeat', 'fish', 'crab', 'lobster', 'scallop', 'clam', 'oyster',
      'meatball', 'brisket', 'rib', 'tenderloin', 'filet', 'roast', 'wing', 'drumstick'
    ] },
    { k: 'bakery', l: 'Bread & Bakery', c: '#fb923c', w: [
      'bread', 'bagel', 'muffin', 'croissant', 'bun', 'roll', 'pita', 'tortilla', 'wrap', 'loaf', 'sourdough',
      'english muffin', 'naan', 'flatbread', 'biscuit', 'cornbread', 'cake', 'cupcake', 'donut', 'doughnut',
      'pastry', 'pie crust', 'brioche'
    ] },
    { k: 'frozen', l: 'Frozen', c: '#7dd3fc', w: [
      'frozen', 'ice cream', 'gelato', 'sorbet', 'popsicle', 'frozen pizza', 'waffle', 'nugget', 'edamame',
      'veggie burger', 'fish stick', 'tater tot', 'fry', 'french fry', 'frozen dinner', 'ice', 'pizza roll',
      'corn dog'
    ] },
    { k: 'pantry', l: 'Pantry', c: '#d8b4fe', w: [
      'pasta', 'spaghetti', 'noodle', 'rice', 'quinoa', 'oat', 'oatmeal', 'cereal', 'flour', 'sugar', 'salt',
      'black pepper', 'oil', 'olive oil', 'vinegar', 'sauce', 'marinara', 'salsa', 'ketchup', 'mustard', 'mayo',
      'mayonnaise', 'dressing', 'syrup', 'honey', 'jam', 'jelly', 'peanut butter', 'almond butter', 'soup',
      'broth', 'stock', 'bean', 'lentil', 'chickpea', 'chip', 'popcorn', 'pretzel', 'granola', 'coffee', 'tea',
      'juice', 'soda', 'sparkling water', 'water', 'wine', 'beer', 'spice', 'seasoning', 'baking powder',
      'baking soda', 'yeast', 'vanilla', 'cocoa', 'chocolate', 'nutella', 'olive', 'pickle', 'caper', 'anchovy',
      'coconut milk', 'soy sauce', 'hot sauce', 'sriracha', 'tahini', 'hummus', 'nut', 'almond', 'cashew',
      'walnut', 'pecan', 'pistachio', 'seed', 'trail mix', 'dried fruit', 'raisin', 'cracker', 'cookie',
      'snack', 'candy', 'gatorade', 'kool aid', 'mac and cheese', 'ramen', 'tortilla chip', 'peanut'
    ] }
  ];
  var OTHER = { k: 'other', l: 'Other', c: 'rgba(255,255,255,0.35)' };

  var STOP = { a: 1, an: 1, and: 1, the: 1, of: 1, for: 1, with: 1, to: 1, in: 1, organic: 1, large: 1,
    small: 1, fresh: 1, big: 1, family: 1, size: 1, brand: 1, any: 1, some: 1 };

  function sing(w) {
    if (w.length < 4) return w;
    if (/ies$/.test(w) && w.length > 4) return w.slice(0, -3) + 'y';
    if (/ie$/.test(w) && w.length > 4) return w.slice(0, -2) + 'y';
    if (/(ss|us|is)$/.test(w)) return w;
    if (/(ch|sh|x|z|s|o)es$/.test(w)) return w.slice(0, -2);
    if (/s$/.test(w)) return w.slice(0, -1);
    return w;
  }

  /* Split "[P1] [Costco] text" into parts. */
  function parse(summary) {
    var s = String(summary || '');
    var tags = s.match(/^(\s*\[[^\]]*\]\s*)+/);
    var costco = false, p1 = false, local = false, walmart = false, ht = false;
    if (tags) {
      costco = /\[costco\]/i.test(tags[0]);
      walmart = /\[walmart\]/i.test(tags[0]) && !costco;
      ht = /\[(ht|harris teeter)\]/i.test(tags[0]) && !costco && !walmart;
      local = /\[local\]/i.test(tags[0]) && !costco && !walmart && !ht;
      p1 = /\[p1\]/i.test(tags[0]);
      s = s.slice(tags[0].length);
    }
    return { text: s.trim(), costco: costco, p1: p1, local: local, walmart: walmart, ht: ht };
  }

  /* Store lean: 'costco' (bulk is better, small is fine), 'walmart', 'ht' (Harris Teeter), 'local' (other stores), or 'any'.
     The stored tag for other stores stays [Local] so existing lists keep working. */
  function lean(parts) {
    return parts.costco ? 'costco' : (parts.walmart ? 'walmart' : (parts.ht ? 'ht' : (parts.local ? 'local' : 'any')));
  }

  function setLean(parts, value) {
    parts.costco = value === 'costco';
    parts.walmart = value === 'walmart';
    parts.ht = value === 'ht';
    parts.local = value === 'local';
    return parts;
  }

  function build(parts) {
    var l = lean(parts);
    return (parts.p1 ? '[P1] ' : '') + (l === 'costco' ? '[Costco] ' : '') +
      (l === 'walmart' ? '[Walmart] ' : '') + (l === 'ht' ? '[HT] ' : '') + (l === 'local' ? '[Local] ' : '') + String(parts.text || '').trim();
  }

  function tokenize(text) {
    var t = String(text || '').toLowerCase();
    t = t.replace(/\([^)]*\)/g, ' ');
    t = t.replace(/^\s*\d+([.\/]\d+)?\s*(x|lbs?|oz|ct|pk|packs?|gal|gallons?|dozen|doz|qt|pt|l|ml|g|kg)?\b\.?\s*/, '');
    t = t.replace(/'/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!t) return [];
    var out = [], parts = t.split(' ');
    for (var i = 0; i < parts.length; i++) {
      if (parts[i]) out.push(sing(parts[i]));
    }
    return out;
  }

  /* Canonical key for an item name: tags and quantities stripped, singularized. */
  function normalize(name) {
    return tokenize(parse(name).text).join(' ');
  }

  /* Learnable features: meaningful words plus adjacent word pairs. */
  function features(toks) {
    var words = [], i, f = [];
    for (i = 0; i < toks.length; i++) {
      if (!STOP[toks[i]]) words.push(toks[i]);
    }
    for (i = 0; i < words.length; i++) f.push(words[i]);
    for (i = 0; i + 1 < words.length; i++) f.push(words[i] + ' ' + words[i + 1]);
    return f;
  }

  var INDEX = null;
  function seedIndex() {
    if (INDEX) return INDEX;
    INDEX = [];
    for (var c = 0; c < SEED.length; c++) {
      for (var j = 0; j < SEED[c].w.length; j++) {
        var toks = tokenize(SEED[c].w[j]);
        if (toks.length) INDEX.push({ toks: toks, key: SEED[c].k, chars: toks.join(' ').length });
      }
    }
    return INDEX;
  }

  function containsRun(hay, needle) {
    for (var i = 0; i + needle.length <= hay.length; i++) {
      var ok = true;
      for (var j = 0; j < needle.length; j++) {
        if (hay[i + j] !== needle[j]) { ok = false; break; }
      }
      if (ok) return true;
    }
    return false;
  }

  function seedMatch(toks) {
    var idx = seedIndex(), best = null;
    for (var i = 0; i < idx.length; i++) {
      var e = idx[i];
      if (!containsRun(toks, e.toks)) continue;
      if (!best || e.toks.length > best.toks.length ||
          (e.toks.length === best.toks.length && e.chars > best.chars)) best = e;
    }
    return best;
  }

  function emptyData() {
    return { overrides: {}, tok: {}, settings: { cat_order: [] } };
  }

  function normalizeData(d) {
    var out = emptyData();
    if (d && typeof d === 'object') {
      if (d.overrides) out.overrides = d.overrides;
      if (d.tok) out.tok = d.tok;
      if (d.settings) {
        out.settings = d.settings;
        if (!out.settings.cat_order) out.settings.cat_order = [];
      }
    }
    return out;
  }

  function classify(data, name) {
    var toks = tokenize(parse(name).text);
    var norm = toks.join(' ');
    if (!norm) return { key: 'other', conf: 0, src: 'none', norm: norm };
    var ov = data.overrides[norm];
    if (ov) return { key: ov, conf: 1, src: 'learned', norm: norm };

    var feats = features(toks), scores = {}, total = 0, i, c;
    for (i = 0; i < feats.length; i++) {
      var m = data.tok[feats[i]];
      if (!m) continue;
      var weight = feats[i].indexOf(' ') >= 0 ? 2 : 1;
      for (c in m) {
        scores[c] = (scores[c] || 0) + m[c] * weight;
        total += m[c] * weight;
      }
    }
    var best = null, bs = 0;
    for (c in scores) {
      if (scores[c] > bs) { best = c; bs = scores[c]; }
    }
    var seed = seedMatch(toks);
    /* Learned evidence needs more weight to override a specific multi-word dictionary phrase. */
    var need = seed ? (seed.toks.length > 1 ? 4 : 2) : 1;
    if (best && bs >= need) {
      return { key: best, conf: Math.min(1, (bs / total) * Math.min(1, bs / 2)), src: 'learned', norm: norm };
    }
    if (seed) {
      return { key: seed.key, conf: seed.toks.length > 1 ? 0.85 : 0.7, src: 'seed', norm: norm };
    }
    return { key: 'other', conf: 0, src: 'none', norm: norm };
  }

  function bump(data, feats, cat, delta) {
    for (var i = 0; i < feats.length; i++) {
      var f = feats[i];
      if (!data.tok[f]) data.tok[f] = {};
      var n = (data.tok[f][cat] || 0) + delta;
      if (n <= 0) {
        delete data.tok[f][cat];
        var empty = true;
        for (var k in data.tok[f]) { empty = false; break; }
        if (empty) delete data.tok[f];
      } else {
        data.tok[f][cat] = n;
      }
    }
  }

  /* Teach: this item belongs in this category. Returns the op to send to the backend. */
  function learn(data, name, cat) {
    var toks = tokenize(parse(name).text), norm = toks.join(' ');
    if (!norm) return null;
    var feats = features(toks), old = data.overrides[norm];
    if (old && old !== cat) bump(data, feats, old, -1);
    data.overrides[norm] = cat;
    if (old !== cat) bump(data, feats, cat, 1);
    return { norm: norm, tokens: feats, category: cat };
  }

  function forget(data, norm) {
    var old = data.overrides[norm];
    if (!old) return null;
    var feats = features(norm.split(' '));
    bump(data, feats, old, -1);
    delete data.overrides[norm];
    return { norm: norm, tokens: feats };
  }

  function orderedCats(order) {
    var out = [], used = {}, i, j;
    order = order || [];
    for (i = 0; i < order.length; i++) {
      for (j = 0; j < SEED.length; j++) {
        if (SEED[j].k === order[i] && !used[order[i]]) { out.push(SEED[j]); used[order[i]] = 1; }
      }
    }
    for (j = 0; j < SEED.length; j++) {
      if (!used[SEED[j].k]) out.push(SEED[j]);
    }
    out.push(OTHER);
    return out;
  }

  function catByKey(key) {
    for (var i = 0; i < SEED.length; i++) {
      if (SEED[i].k === key) return SEED[i];
    }
    return OTHER;
  }

  return {
    SEED: SEED, OTHER: OTHER, sing: sing, parse: parse, build: build, lean: lean, setLean: setLean, tokenize: tokenize,
    normalize: normalize, features: features, emptyData: emptyData, normalizeData: normalizeData,
    classify: classify, learn: learn, forget: forget, orderedCats: orderedCats, catByKey: catByKey
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = TodoFlowEngine; }
