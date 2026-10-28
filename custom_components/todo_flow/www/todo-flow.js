/* Todo Flow - built file, edit src/ and run scripts/build.py */
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
    var costco = false, p1 = false, local = false, walmart = false;
    if (tags) {
      costco = /\[costco\]/i.test(tags[0]);
      walmart = /\[walmart\]/i.test(tags[0]) && !costco;
      local = /\[local\]/i.test(tags[0]) && !costco && !walmart;
      p1 = /\[p1\]/i.test(tags[0]);
      s = s.slice(tags[0].length);
    }
    return { text: s.trim(), costco: costco, p1: p1, local: local, walmart: walmart };
  }

  /* Store lean: 'costco' (bulk is better, small is fine), 'walmart', 'local' (other stores), or 'any'.
     The stored tag for other stores stays [Local] so existing lists keep working. */
  function lean(parts) {
    return parts.costco ? 'costco' : (parts.walmart ? 'walmart' : (parts.local ? 'local' : 'any'));
  }

  function setLean(parts, value) {
    parts.costco = value === 'costco';
    parts.walmart = value === 'walmart';
    parts.local = value === 'local';
    return parts;
  }

  function build(parts) {
    var l = lean(parts);
    return (parts.p1 ? '[P1] ' : '') + (l === 'costco' ? '[Costco] ' : '') +
      (l === 'walmart' ? '[Walmart] ' : '') + (l === 'local' ? '[Local] ' : '') + String(parts.text || '').trim();
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

/* Todo Flow card - beta. No template literals, no emoji, SVG icons only (HA mobile WebView). */
var TF = TodoFlowEngine;
var TF_VERSION = '0.3.1-beta';
var LEAN_LABEL = { any: 'Any store', costco: 'Costco', walmart: 'Walmart', local: 'Other stores' };
var LEAN_COLOR = { any: '#4ade80', costco: '#f87171', walmart: '#60a5fa', local: '#cbd5e1' };
var LEAN_STRIPE = { any: '', costco: 'box-shadow:inset 3px 0 0 #f87171;', walmart: 'box-shadow:inset 3px 0 0 #60a5fa;', local: 'box-shadow:inset 3px 0 0 rgba(255,255,255,0.22);' };
var LEAN_ORDER = ['any', 'costco', 'walmart', 'local'];
var SVG_NS = 'http://www.w3.org/2000/svg';
var STORE_KEY = 'todo_flow_data_v1';
var PALETTE = ['#818cf8', '#f472b6', '#38bdf8', '#a78bfa', '#d97706', '#fb923c', '#2dd4bf', '#facc15', '#f87171', '#34d399'];
var MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var IC = {
  check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  send: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z',
  refresh: 'M17.65 6.35A7.96 7.96 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
  edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  up: 'M7 14l5-5 5 5z',
  down: 'M7 10l5 5 5-5z',
  cart: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45A2 2 0 0 0 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 23.43 5H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z',
  gear: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  list: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z'
};

function el(tag, attrs, kids) {
  var e = document.createElement(tag);
  if (attrs) {
    for (var k in attrs) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'style') e.style.cssText = v;
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
  }
  if (kids !== undefined && kids !== null) {
    if (!Array.isArray(kids)) kids = [kids];
    for (var i = 0; i < kids.length; i++) {
      var c = kids[i];
      if (c === null || c === undefined || c === false) continue;
      e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    }
  }
  return e;
}

function icon(path, size, color) {
  var s = document.createElementNS(SVG_NS, 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('width', size || 16);
  s.setAttribute('height', size || 16);
  s.style.fill = color || 'currentColor';
  var p = document.createElementNS(SVG_NS, 'path');
  p.setAttribute('d', path);
  s.appendChild(p);
  return s;
}

function cleanName(s) {
  return String(s || '').replace(/[^\x20-\x7E]/g, '').trim();
}

function fmtDue(d) {
  if (!d) return null;
  var ds = String(d).slice(0, 10);
  var dt = new Date(ds + 'T00:00:00');
  var t = new Date();
  t.setHours(0, 0, 0, 0);
  var diff = Math.round((dt - t) / 86400000);
  if (diff < 0) return { txt: MO[dt.getMonth()] + ' ' + dt.getDate(), od: true };
  if (diff === 0) return { txt: 'Today', od: false };
  if (diff === 1) return { txt: 'Tomorrow', od: false };
  return { txt: MO[dt.getMonth()] + ' ' + dt.getDate(), od: false };
}

var CSS = [
  '*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}',
  ':host{display:block;font-family:var(--primary-font-family,system-ui,sans-serif)}',
  'ha-card{background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.10);border-radius:20px;overflow:hidden;display:flex;flex-direction:column;height:calc(100vh - 160px);min-height:480px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#fff;position:relative}',
  '.top{padding:14px 14px 4px;display:flex;align-items:center;gap:8px;flex-shrink:0}',
  '.ttl{font-size:17px;font-weight:600;color:#fff;display:flex;align-items:center;gap:8px}',
  '.beta{font-size:9px;font-weight:800;letter-spacing:.08em;padding:2px 6px;border-radius:6px;background:rgba(251,146,60,0.18);color:#fb923c}',
  '.sub{font-size:11px;color:rgba(255,255,255,0.3);margin-top:3px}',
  '.sp{flex:1}',
  '.ib{background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;padding:6px;display:flex;align-items:center;border-radius:8px}',
  '.ib:active{color:#fff;background:rgba(255,255,255,0.08)}',
  '.chips{display:flex;gap:6px;padding:8px 12px 6px;overflow-x:auto;flex-shrink:0;scrollbar-width:none}',
  '.chips::-webkit-scrollbar{display:none}',
  '.chip{display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.5);font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all .14s}',
  '.chip:active{transform:scale(0.94)}',
  '.dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;display:inline-block}',
  '.cn{font-size:10px;font-weight:700;opacity:.6}',
  '.body{flex:1;overflow-y:auto;padding:4px 8px 12px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.07) transparent;-webkit-overflow-scrolling:touch}',
  '.tabs{display:flex;gap:6px;padding:4px 4px 6px;overflow-x:auto;scrollbar-width:none}',
  '.tab{flex-shrink:0;white-space:nowrap;padding:5px 13px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.4);font-size:12px;font-weight:600;cursor:pointer}',
  '.hdr{display:flex;align-items:center;gap:8px;padding:11px 6px 5px}',
  '.hico{width:15px;height:15px;flex-shrink:0;display:flex}',
  '.hname{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;flex:1}',
  '.hct{font-size:10px;font-weight:700;color:rgba(255,255,255,0.2);background:rgba(255,255,255,0.06);padding:1px 7px;border-radius:8px}',
  '.hbtn{font-size:11px;font-weight:600;color:rgba(255,255,255,0.4);background:none;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:3px 9px;cursor:pointer}',
  '.done-h{margin-top:6px;padding-top:12px;border-top:0.5px solid rgba(255,255,255,0.07)}',
  '.row{display:flex;align-items:center;gap:10px;padding:8px 8px 8px 10px;border-radius:12px;min-height:52px;cursor:pointer}',
  '.row:not(.open):active{background:rgba(255,255,255,0.04)}',
  '.row.open{flex-direction:column;align-items:stretch;gap:8px;background:rgba(255,255,255,0.06);border-radius:14px;padding:10px;cursor:default}',
  '.rmain{display:flex;align-items:center;gap:10px;min-width:0;flex:1}',
  '.chk{width:28px;height:28px;min-width:28px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.2);background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}',
  '.chk:active{transform:scale(0.82)}',
  '.chk.on{background:#4ade80;border-color:#4ade80}',
  '.tb{flex:1;min-width:0}',
  '.tx{font-size:15px;color:rgba(255,255,255,0.9);line-height:1.35;word-break:break-word}',
  '.dn .tx{text-decoration:line-through;color:rgba(255,255,255,0.28)}',
  '.mt{display:flex;align-items:center;gap:5px;margin-top:2px;flex-wrap:wrap}',
  '.due{font-size:11px;color:rgba(255,255,255,0.32)}.due.od{color:#f87171;font-weight:600}',
  '.badge{font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;flex-shrink:0}',
  '.acts{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding-left:36px}',
  '.act{display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.14);background:transparent;color:rgba(255,255,255,0.5);font-size:11px;font-weight:600;cursor:pointer}',
  '.act.on{background:rgba(0,80,220,0.18);border-color:rgba(147,197,253,0.35);color:#93c5fd}',
  '.act.good{border-color:rgba(74,222,128,0.35);background:rgba(74,222,128,0.1);color:#4ade80}',
  '.act.bad{margin-left:auto;border-color:transparent;padding:5px}',
  '.cats{display:flex;flex-wrap:wrap;gap:5px;padding-left:36px}',
  '.cat{padding:4px 10px;border-radius:14px;border:1px solid;background:transparent;font-size:11px;font-weight:700;cursor:pointer}',
  '.lbl{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,0.25);padding-left:36px}',
  '.edit{display:flex;flex-direction:column;gap:7px;padding-left:36px}',
  '.inp{width:100%;background:rgba(255,255,255,0.07);border:0.5px solid rgba(255,255,255,0.18);border-radius:9px;padding:8px 11px;color:#fff;font-size:14px;outline:none;-webkit-appearance:none}',
  '.date{background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.13);border-radius:8px;padding:6px 10px;color:rgba(255,255,255,0.8);font-size:12px;outline:none;-webkit-appearance:none;color-scheme:dark}',
  '.bar{display:flex;align-items:center;gap:8px;padding:8px 12px 10px;border-bottom:0.5px solid rgba(255,255,255,0.07);flex-shrink:0}',
  '.add{flex:1;min-width:0;background:transparent;border:none;border-bottom:1.5px solid rgba(255,255,255,0.2);padding:6px 4px;color:#fff;font-size:15px;outline:none;-webkit-appearance:none}',
  '.add::placeholder{color:rgba(255,255,255,0.22)}',
  '.pv{padding:4px 10px;border-radius:14px;border:1px solid;background:transparent;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0}',
  '.tog{padding:5px 10px;border-radius:16px;border:1px solid rgba(255,255,255,0.12);background:transparent;color:rgba(255,255,255,0.3);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap}',
  '.tog.on{background:rgba(248,113,113,0.16);color:#f87171;border-color:rgba(248,113,113,0.4)}',
  '.tog.loc{color:#e2e8f0;border-color:rgba(255,255,255,0.35)}',
  '.tog.wm{background:rgba(96,165,250,0.16);color:#60a5fa;border-color:rgba(96,165,250,0.4)}',
  '.toast{position:absolute;left:12px;right:12px;bottom:16px;display:none;align-items:center;gap:10px;padding:10px 14px;border-radius:14px;background:rgba(30,30,46,0.97);border:0.5px solid rgba(255,255,255,0.14);font-size:13px;color:#fff;z-index:50}',
  '.toast button{margin-left:auto;background:none;border:none;color:#4ade80;font-weight:700;font-size:13px;cursor:pointer;padding:4px 8px}',
  '.snd{width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
  '.snd:active{transform:scale(0.88)}',
  '.chooser{display:flex;flex-wrap:wrap;gap:5px;padding:8px 12px 8px;flex-shrink:0;border-bottom:0.5px solid rgba(255,255,255,0.07)}',
  '.tin{flex:1;min-width:0;background:rgba(255,255,255,0.07);border:0.5px solid rgba(255,255,255,0.18);border-radius:9px;padding:8px 11px;color:#fff;font-size:15px;outline:none;-webkit-appearance:none}',
  '.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:48px 20px;color:rgba(255,255,255,0.22);font-size:13px;text-align:center}',
  '.spin{width:22px;height:22px;border:2px solid rgba(255,255,255,0.07);border-top-color:rgba(255,255,255,0.4);border-radius:50%;animation:sp .8s linear infinite}',
  '@keyframes sp{to{transform:rotate(360deg)}}',
  '.sec{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,0.35);padding:14px 6px 6px}',
  '.srow{display:flex;align-items:center;gap:8px;padding:6px 6px;border-radius:10px;min-height:40px}',
  '.sname{flex:1;font-size:14px;color:rgba(255,255,255,0.85)}',
  '.note{font-size:12px;color:rgba(255,255,255,0.35);padding:4px 6px;line-height:1.5}',
  '.lrn{display:flex;align-items:center;gap:8px;padding:5px 6px;font-size:13px;color:rgba(255,255,255,0.7)}',
  '.lrn .arrow{color:rgba(255,255,255,0.25)}'
].join('\n');

class TodoFlowCard extends HTMLElement {
  constructor() {
    super();
    this._cfg = {};
    this._lists = [];
    this._items = {};
    this._sig = {};
    this._active = 'all';
    this._gview = 'all';
    this._open = null;
    this._edit = null;
    this._draft = null;
    this._addTarget = null;
    this._focusEl = null;
    this._data = TF.emptyData();
    this._backend = false;
    this._settings = false;
    this._chooser = false;
    this._pick = null;
    this._lean = 'any';
    this._toastTimer = null;
    this._confirmReset = false;
    this._loading = true;
    this._ready = false;
  }

  setConfig(c) {
    var cfg = Object.assign({ grocery_entity: 'todo.grocery_list', mode: 'all', entities: [], exclude: [], colors: {} }, c || {});
    if (cfg.mode !== 'tasks' && cfg.mode !== 'grocery') cfg.mode = 'all';
    if (!cfg.title) cfg.title = cfg.mode === 'grocery' ? 'Grocery' : (cfg.mode === 'tasks' ? 'Tasks' : 'Todo Flow');
    this._cfg = cfg;
    this._active = cfg.mode === 'grocery' ? cfg.grocery_entity : 'all';
  }

  set hass(h) {
    var first = !this._hass;
    this._hass = h;
    if (first) {
      this._build();
      this._init();
    } else if (this._ready) {
      this._sync();
    }
  }

  getCardSize() { return 10; }
  static getConfigElement() { return document.createElement('div'); }
  static getStubConfig() { return {}; }

  /* ---------- setup ---------- */

  _gid() { return this._cfg.grocery_entity; }

  _defLean() { return (this._gview === 'costco' || this._gview === 'walmart' || this._gview === 'local') ? this._gview : 'any'; }

  _discover() {
    var self = this, st = this._hass.states;
    var ids = (this._cfg.entities && this._cfg.entities.length) ? this._cfg.entities.slice() :
      Object.keys(st).filter(function (k) { return k.indexOf('todo.') === 0; });
    ids = ids.filter(function (id) {
      if (self._cfg.exclude.indexOf(id) >= 0 || !st[id]) return false;
      if (self._cfg.mode === 'grocery') return id === self._gid();
      if (self._cfg.mode === 'tasks') return id !== self._gid();
      return true;
    });
    ids.sort(function (a, b) {
      if (a === self._gid()) return 1;
      if (b === self._gid()) return -1;
      return 0;
    });
    var n = 0;
    this._lists = ids.map(function (id) {
      var name = cleanName(st[id].attributes.friendly_name) || id;
      var color = (self._cfg.colors && self._cfg.colors[id]) || (id === self._gid() ? '#4ade80' : PALETTE[n++ % PALETTE.length]);
      return { id: id, name: name, color: color, grocery: id === self._gid() };
    });
  }

  _init() {
    var self = this;
    this._discover();
    this._lists.forEach(function (l) { self._sig[l.id] = self._hass.states[l.id].state; });
    this._loadData().then(function () {
      return Promise.all(self._lists.map(function (l) { return self._fetch(l.id); }));
    }).then(function () {
      self._loading = false;
      self._ready = true;
      self._renderAll();
    });
    try {
      this._hass.connection.subscribeEvents(function () { self._loadData().then(function () { self._renderBody(); self._renderBar(); }); }, 'todo_flow_updated');
    } catch (e) { /* no event bus access */ }
  }

  _loadData() {
    var self = this;
    return this._hass.connection.sendMessagePromise({ type: 'todo_flow/get_data' }).then(function (r) {
      self._data = TF.normalizeData(r);
      self._backend = true;
    }).catch(function () {
      self._backend = false;
      try { self._data = TF.normalizeData(JSON.parse(localStorage.getItem(STORE_KEY))); } catch (e) { self._data = TF.emptyData(); }
    });
  }

  _persist(msg) {
    if (this._backend) {
      this._hass.connection.sendMessagePromise(msg).catch(function () {});
    } else {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(this._data)); } catch (e) { /* storage unavailable */ }
    }
  }

  _fetch(id) {
    var self = this;
    var st = id === this._gid() ? ['needs_action', 'completed'] : ['needs_action'];
    return this._hass.connection.sendMessagePromise({
      type: 'call_service', domain: 'todo', service: 'get_items',
      target: { entity_id: id }, service_data: { status: st }, return_response: true
    }).then(function (r) {
      var rs = r && r.response && r.response[id];
      self._items[id] = (rs && rs.items) || [];
    }).catch(function () {
      self._items[id] = self._items[id] || [];
    });
  }

  _svc(id, service, data) {
    return this._hass.connection.sendMessagePromise({
      type: 'call_service', domain: 'todo', service: service,
      target: { entity_id: id }, service_data: data, return_response: false
    });
  }

  _sync() {
    var self = this, changed = false;
    this._lists.forEach(function (l) {
      var s = self._hass.states[l.id];
      var sig = s ? s.state : '';
      if (sig !== self._sig[l.id]) {
        self._sig[l.id] = sig;
        changed = true;
        self._fetch(l.id).then(function () { self._renderBody(); self._renderChips(); self._renderHead(); });
      }
    });
    if (changed) this._renderChips();
  }

  _refresh() {
    var self = this;
    this._loading = true;
    this._renderBody();
    this._discover();
    this._loadData().then(function () {
      return Promise.all(self._lists.map(function (l) { return self._fetch(l.id); }));
    }).then(function () {
      self._loading = false;
      self._renderAll();
    });
  }

  /* ---------- data helpers ---------- */

  _list(id) {
    for (var i = 0; i < this._lists.length; i++) {
      if (this._lists[i].id === id) return this._lists[i];
    }
    return null;
  }

  _find(lid, uid) {
    var arr = this._items[lid] || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].uid === uid) return arr[i];
    }
    return null;
  }

  _count(lid) {
    var arr = this._items[lid] || [];
    var n = 0;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].status === 'needs_action') n++;
    }
    return n;
  }

  _teach(name, key) {
    var op = TF.learn(this._data, name, key);
    if (!op) return;
    this._persist({ type: 'todo_flow/learn', norm: op.norm, tokens: op.tokens, category: op.category });
  }

  /* ---------- actions ---------- */

  _toast(msg, undo) {
    var self = this, t = this._elToast;
    if (!t) return;
    if (this._toastTimer) clearTimeout(this._toastTimer);
    t.textContent = '';
    t.appendChild(el('span', null, msg));
    t.appendChild(el('button', { onclick: function () {
      if (self._toastTimer) clearTimeout(self._toastTimer);
      t.style.display = 'none';
      undo();
    } }, 'Undo'));
    t.style.display = 'flex';
    this._toastTimer = setTimeout(function () { t.style.display = 'none'; }, 5000);
  }

  _toggle(lid, uid, silent) {
    var self = this, it = this._find(lid, uid);
    if (!it) return;
    var old = it.status;
    it.status = old === 'completed' ? 'needs_action' : 'completed';
    this._open = null;
    this._renderBody(); this._renderChips(); this._renderHead();
    if (!silent && it.status === 'completed') {
      this._toast('Checked off', function () { self._toggle(lid, uid, true); });
    }
    this._svc(lid, 'update_item', { item: uid, status: it.status }).catch(function () {
      it.status = old;
      self._renderBody(); self._renderChips(); self._renderHead();
    });
  }

  _remove(lid, uid) {
    var self = this, prev = (this._items[lid] || []).slice(), gone = this._find(lid, uid);
    this._items[lid] = prev.filter(function (i) { return i.uid !== uid; });
    this._open = null;
    this._renderBody(); this._renderChips(); this._renderHead();
    if (gone) this._toast('Removed', function () { self._restore(lid, gone); });
    this._svc(lid, 'remove_item', { item: uid }).catch(function () {
      self._items[lid] = prev;
      self._renderBody(); self._renderChips(); self._renderHead();
    });
  }

  _restore(lid, it) {
    var self = this, data = { item: it.summary };
    if (it.due) data.due_date = String(it.due).slice(0, 10);
    var tmp = { uid: 'tmp' + Date.now(), summary: it.summary, status: 'needs_action', due: it.due };
    this._items[lid] = [tmp].concat(this._items[lid] || []);
    this._renderBody(); this._renderChips(); this._renderHead();
    this._svc(lid, 'add_item', data).then(function () {
      return self._fetch(lid);
    }).then(function () {
      self._renderBody(); self._renderChips(); self._renderHead();
    }).catch(function () {
      self._items[lid] = (self._items[lid] || []).filter(function (i) { return i.uid !== tmp.uid; });
      self._renderBody();
    });
  }

  _setLean(lid, uid, value) {
    var self = this, it = this._find(lid, uid);
    if (!it) return;
    var p = TF.setLean(TF.parse(it.summary), value);
    if (this._draft && this._draft.uid === uid) p.text = this._draft.text.trim() || p.text;
    var nm = TF.build(p), os = it.summary;
    it.summary = nm;
    this._renderBody();
    this._svc(lid, 'update_item', { item: uid, rename: nm }).catch(function () {
      it.summary = os;
      self._renderBody();
    });
  }

  _saveEdit(lid, uid, text, due) {
    var self = this, it = this._find(lid, uid);
    if (!it || !text.trim()) return;
    var p = TF.parse(it.summary);
    p.text = text.trim();
    var nm = TF.build(p), os = it.summary, od = it.due;
    var payload = { item: uid, rename: nm };
    it.summary = nm;
    if (due !== undefined) { it.due = due || undefined; payload.due_date = due || null; }
    this._edit = null; this._open = null; this._draft = null;
    this._renderBody();
    this._svc(lid, 'update_item', payload).catch(function () {
      it.summary = os; it.due = od;
      self._renderBody();
    });
  }

  _retag(lid, uid, field) {
    var self = this, it = this._find(lid, uid);
    if (!it) return;
    var p = TF.parse(it.summary);
    p[field] = !p[field];
    if (this._draft && this._draft.uid === uid) p.text = this._draft.text.trim() || p.text;
    var nm = TF.build(p), os = it.summary;
    it.summary = nm;
    this._renderBody();
    this._svc(lid, 'update_item', { item: uid, rename: nm }).catch(function () {
      it.summary = os;
      self._renderBody();
    });
  }

  _add(lid, text, lean, pickKey) {
    var self = this, t = text.trim();
    if (!t) return;
    var l = this._list(lid);
    var p = { text: t, costco: false, local: false, walmart: false, p1: false };
    if (l && l.grocery) TF.setLean(p, lean);
    var summary = TF.build(p);
    if (l && l.grocery && pickKey) {
      var predicted = TF.classify(this._data, t).key;
      if (pickKey !== predicted) this._teach(t, pickKey);
    }
    var tmp = { uid: 'tmp' + Date.now(), summary: summary, status: 'needs_action' };
    this._items[lid] = [tmp].concat(this._items[lid] || []);
    this._renderBody(); this._renderChips(); this._renderHead();
    this._svc(lid, 'add_item', { item: summary }).then(function () {
      return self._fetch(lid);
    }).then(function () {
      self._renderBody(); self._renderChips(); self._renderHead();
    }).catch(function () {
      self._items[lid] = (self._items[lid] || []).filter(function (i) { return i.uid !== tmp.uid; });
      self._renderBody();
    });
  }

  _clearDone(lid) {
    var self = this;
    this._items[lid] = (this._items[lid] || []).filter(function (i) { return i.status !== 'completed'; });
    this._renderBody();
    this._svc(lid, 'remove_completed_items', {}).catch(function () { self._fetch(lid).then(function () { self._renderBody(); }); });
  }

  /* ---------- shell ---------- */

  _build() {
    var self = this;
    var root = this.attachShadow({ mode: 'open' });
    root.appendChild(el('style', null, CSS));
    this._elTitle = el('div', { class: 'ttl' });
    this._elSub = el('div', { class: 'sub' });
    this._elChips = el('div', { class: 'chips' });
    this._elBody = el('div', { class: 'body' });
    this._elBar = el('div', { style: 'flex-shrink:0' });
    this._elToast = el('div', { class: 'toast' });
    var top = el('div', { class: 'top' }, [
      el('div', null, [this._elTitle, this._elSub]),
      el('div', { class: 'sp' }),
      el('button', { class: 'ib', title: 'Refresh', onclick: function () { self._refresh(); } }, icon(IC.refresh, 16)),
      el('button', { class: 'ib', title: 'Settings', onclick: function () { self._settings = !self._settings; self._renderBody(); self._renderBar(); } }, icon(IC.gear, 17))
    ]);
    root.appendChild(el('ha-card', null, [top, this._elChips, this._elBar, this._elBody, this._elToast]));
    this._renderHead();
    this._elBody.appendChild(el('div', { class: 'empty' }, el('div', { class: 'spin' })));
  }

  _renderAll() {
    this._renderHead();
    this._renderChips();
    this._renderBody();
    this._renderBar();
  }

  _renderHead() {
    var total = 0, self = this;
    this._lists.forEach(function (l) { total += self._count(l.id); });
    this._elTitle.textContent = '';
    this._elTitle.appendChild(document.createTextNode(this._cfg.title));
    this._elTitle.appendChild(el('span', { class: 'beta' }, 'BETA'));
    if (this._cfg.mode === 'grocery') {
      this._elSub.textContent = total + (total === 1 ? ' item' : ' items') + ' on the list';
      return;
    }
    this._elSub.textContent = total + ' open item' + (total !== 1 ? 's' : '') + ' across ' + this._lists.length + ' list' + (this._lists.length !== 1 ? 's' : '');
  }

  _renderChips() {
    var self = this;
    this._elChips.textContent = '';
    this._elChips.style.display = this._cfg.mode === 'grocery' ? 'none' : '';
    var mk =function (id, name, color, count, dot) {
      var on = self._active === id;
      var kids = [];
      if (dot) kids.push(el('span', { class: 'dot', style: 'background:' + color }));
      kids.push(name);
      if (count !== null) kids.push(el('span', { class: 'cn' }, String(count)));
      return el('button', {
        class: 'chip',
        style: on ? 'background:' + color + '26;border-color:' + color + '66;color:' + color : '',
        onclick: function () { self._active = id; self._open = null; self._edit = null; self._settings = false; self._chooser = false; self._pick = null; self._renderChips(); self._renderBody(); self._renderBar(); }
      }, kids);
    };
    this._elChips.appendChild(mk('all', 'All', '#ffffff', null, false));
    var g = this._list(this._gid());
    if (g) this._elChips.appendChild(mk(g.id, 'Grocery', g.color, this._count(g.id), false));
    this._lists.forEach(function (l) {
      if (l.grocery) return;
      self._elChips.appendChild(mk(l.id, l.name, l.color, self._count(l.id), true));
    });
  }

  /* ---------- body ---------- */

  _renderBody() {
    var b = this._elBody, scroll = b.scrollTop;
    b.textContent = '';
    if (this._loading) {
      b.appendChild(el('div', { class: 'empty' }, el('div', { class: 'spin' })));
      return;
    }
    if (this._settings) this._bodySettings(b);
    else if (this._active === 'all') this._bodyAll(b);
    else if (this._active === this._gid()) this._bodyGrocery(b);
    else this._bodyList(b, this._active);
    b.scrollTop = scroll;
    if (this._focusEl) {
      var f = this._focusEl;
      this._focusEl = null;
      try { f.focus(); f.select(); } catch (e) { /* focus unavailable */ }
    }
  }

  _openRow(uid) {
    this._open = uid;
    this._edit = null;
    this._draft = null;
    this._wantFocus = true;
    this._renderBody();
  }

  _closeRow() {
    this._open = null;
    this._draft = null;
    this._renderBody();
  }

  /* Text field that opens right on the row. Enter saves, Escape closes. */
  _titleInput(l, it, p, withDate) {
    var self = this;
    var shown = (this._draft && this._draft.uid === it.uid) ? this._draft.text : p.text;
    var inp = el('input', { class: 'tin', value: shown, placeholder: 'Item name' });
    var dt = withDate ? el('input', { class: 'date', type: 'date', value: it.due ? String(it.due).slice(0, 10) : '' }) : null;
    var save = function () { self._saveEdit(l.id, it.uid, inp.value, dt ? dt.value : undefined); };
    inp.addEventListener('input', function () { self._draft = { uid: it.uid, text: inp.value }; });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); save(); }
      if (e.key === 'Escape') { self._closeRow(); }
    });
    if (this._wantFocus) { this._focusEl = inp; this._wantFocus = false; }
    return { inp: inp, dt: dt, save: save };
  }

  _check(lid, it, done, color) {
    var self = this;
    return el('button', {
      class: 'chk' + (done ? ' on' : ''),
      style: done ? '' : 'border-color:' + color + '88',
      onclick: function (e) { e.stopPropagation(); self._toggle(lid, it.uid); }
    }, done ? icon(IC.check, 14, '#fff') : null);
  }

  _taskRow(l, it) {
    var self = this, p = TF.parse(it.summary), due = fmtDue(it.due), done = it.status === 'completed';
    if (this._open === it.uid) return this._taskOpen(l, it, p);
    var meta = [];
    if (due) meta.push(el('span', { class: 'due' + (due.od ? ' od' : '') }, due.txt));
    if (p.p1) meta.push(el('span', { class: 'badge', style: 'color:' + l.color + ';background:' + l.color + '22' }, 'P1'));
    return el('div', { class: 'row' + (done ? ' dn' : ''), onclick: function () { self._openRow(it.uid); } }, [
      this._check(l.id, it, done, l.color),
      el('div', { class: 'tb' }, [el('div', { class: 'tx' }, p.text), meta.length ? el('div', { class: 'mt' }, meta) : null])
    ]);
  }

  _taskOpen(l, it, p) {
    var self = this;
    var t = this._titleInput(l, it, p, true);
    return el('div', { class: 'row open' }, [
      el('div', { class: 'rmain' }, [this._check(l.id, it, it.status === 'completed', l.color), t.inp]),
      el('div', { class: 'edit' }, [t.dt]),
      el('div', { class: 'acts' }, [
        el('button', { class: 'act good', onclick: t.save }, [icon(IC.check, 13, '#4ade80'), 'Save']),
        el('button', { class: 'act', onclick: function () { self._toggle(l.id, it.uid); } }, it.status === 'completed' ? 'Reopen' : 'Done'),
        el('button', { class: 'act' + (p.p1 ? ' on' : ''), onclick: function () { self._retag(l.id, it.uid, 'p1'); } }, 'P1'),
        el('button', { class: 'act bad', onclick: function () { self._remove(l.id, it.uid); } }, icon(IC.trash, 14, '#f87171')),
        el('button', { class: 'act', style: 'border-color:transparent;padding:5px', onclick: function () { self._closeRow(); } }, icon(IC.close, 12))
      ])
    ]);
  }

  _sortTasks(items) {
    return items.slice().sort(function (a, b) {
      var ap = TF.parse(a.summary).p1 ? 0 : 1, bp = TF.parse(b.summary).p1 ? 0 : 1;
      if (ap !== bp) return ap - bp;
      var ad = a.due || '9999', bd = b.due || '9999';
      return ad < bd ? -1 : (ad > bd ? 1 : 0);
    });
  }

  _groupHdr(name, color, count, iconPath, onclick) {
    return el('div', { class: 'hdr', style: onclick ? 'cursor:pointer' : '', onclick: onclick }, [
      iconPath ? el('div', { class: 'hico', style: 'color:' + color }, icon(iconPath, 15)) : el('span', { class: 'dot', style: 'background:' + color }),
      el('span', { class: 'hname', style: 'color:' + color }, name),
      el('span', { class: 'hct' }, String(count))
    ]);
  }

  _bodyAll(b) {
    var self = this, any = false;
    var g = this._list(this._gid());
    if (g && this._count(g.id)) {
      any = true;
      b.appendChild(this._groupHdr('Grocery - open list', g.color, this._count(g.id), IC.cart, function () {
        self._active = g.id; self._renderChips(); self._renderBody(); self._renderBar();
      }));
    }
    this._lists.forEach(function (l) {
      if (l.grocery) return;
      var items = self._sortTasks((self._items[l.id] || []).filter(function (i) { return i.status === 'needs_action'; }));
      if (!items.length) return;
      any = true;
      b.appendChild(self._groupHdr(l.name, l.color, items.length, IC.list, null));
      items.forEach(function (it) { b.appendChild(self._taskRow(l, it)); });
    });
    if (!any) b.appendChild(el('div', { class: 'empty' }, [icon(IC.check, 28, 'rgba(255,255,255,0.15)'), 'All clear']));
  }

  _bodyList(b, lid) {
    var self = this, l = this._list(lid);
    if (!l) return;
    var items = this._sortTasks((this._items[lid] || []).filter(function (i) { return i.status === 'needs_action'; }));
    if (!items.length) {
      b.appendChild(el('div', { class: 'empty' }, [icon(IC.check, 28, 'rgba(255,255,255,0.15)'), 'Nothing open in ' + l.name]));
      return;
    }
    items.forEach(function (it) { b.appendChild(self._taskRow(l, it)); });
  }

  /* ---------- grocery ---------- */

  _groceryRow(l, it, cat, dim) {
    var self = this, p = TF.parse(it.summary), done = it.status === 'completed';
    var stripe = LEAN_STRIPE[TF.lean(p)] + (dim ? 'opacity:.5;' : '');
    if (this._open !== it.uid) {
      return el('div', { class: 'row' + (done ? ' dn' : ''), style: stripe, onclick: function () { self._openRow(it.uid); } }, [
        this._check(l.id, it, done, cat.c),
        el('div', { class: 'tb' }, el('div', { class: 'tx' }, p.text))
      ]);
    }
    var t = this._titleInput(l, it, p, false);
    var current = TF.classify(this._data, it.summary);
    var chips = TF.orderedCats(this._data.settings.cat_order).map(function (c) {
      var on = c.k === current.key;
      return el('button', {
        class: 'cat',
        style: 'color:' + c.c + ';border-color:' + (on ? c.c : 'rgba(255,255,255,0.12)') + ';background:' + (on ? c.c + '26' : 'transparent'),
        onclick: function () { self._teach(it.summary, c.k); self._open = null; self._draft = null; self._renderBody(); }
      }, c.l);
    });
    var cur = TF.lean(p);
    var leans = LEAN_ORDER.map(function (k) {
      var on = k === cur, col = LEAN_COLOR[k];
      return el('button', {
        class: 'cat',
        style: 'color:' + col + ';border-color:' + (on ? col : 'rgba(255,255,255,0.12)') + ';background:' + (on ? col + '26' : 'transparent'),
        onclick: function () { self._setLean(l.id, it.uid, k); }
      }, LEAN_LABEL[k]);
    });
    return el('div', { class: 'row open', style: LEAN_STRIPE[cur] }, [
      el('div', { class: 'rmain' }, [this._check(l.id, it, done, cat.c), t.inp]),
      el('div', { class: 'lbl' }, 'Where to buy'),
      el('div', { class: 'cats' }, leans),
      el('div', { class: 'lbl' }, current.src === 'learned' ? 'Category (learned)' : 'Category - tap to teach'),
      el('div', { class: 'cats' }, chips),
      el('div', { class: 'acts' }, [
        el('button', { class: 'act good', onclick: t.save }, [icon(IC.check, 13, '#4ade80'), 'Save']),
        el('button', { class: 'act bad', onclick: function () { self._remove(l.id, it.uid); } }, icon(IC.trash, 14, '#f87171')),
        el('button', { class: 'act', style: 'border-color:transparent;padding:5px', onclick: function () { self._closeRow(); } }, icon(IC.close, 12))
      ])
    ]);
  }

  /* Append items grouped by category in aisle order. Returns how many rows were added. */
  _groceryGroups(b, l, items, dim) {
    var self = this, groups = {}, n = 0;
    items.forEach(function (it) {
      var k = TF.classify(self._data, it.summary).key;
      if (!groups[k]) groups[k] = [];
      groups[k].push(it);
    });
    TF.orderedCats(this._data.settings.cat_order).forEach(function (c) {
      var g = groups[c.k];
      if (!g || !g.length) return;
      n += g.length;
      b.appendChild(self._groupHdr(c.l, c.c, g.length, null, null));
      g.forEach(function (it) { b.appendChild(self._groceryRow(l, it, c, dim)); });
    });
    return n;
  }

  _bodyGrocery(b) {
    var self = this, l = this._list(this._gid());
    if (!l) {
      b.appendChild(el('div', { class: 'empty' }, 'Grocery entity ' + this._gid() + ' was not found. Set grocery_entity in the card config.'));
      return;
    }
    var tabs = el('div', { class: 'tabs' });
    [['all', 'All'], ['costco', 'Costco'], ['walmart', 'Walmart'], ['local', 'Other stores']].forEach(function (t) {
      var on = self._gview === t[0], col = t[0] === 'all' ? '#4ade80' : LEAN_COLOR[t[0]];
      tabs.appendChild(el('button', {
        class: 'tab',
        style: on ? 'background:' + col + '26;color:' + col + ';border-color:' + col + '55' : '',
        onclick: function () { self._gview = t[0]; self._open = null; self._draft = null; self._lean = self._defLean(); self._renderBody(); self._renderBar(); }
      }, t[1]));
    });
    b.appendChild(tabs);

    var all = this._items[l.id] || [];
    var active = all.filter(function (i) { return i.status === 'needs_action'; });
    var done = all.filter(function (i) { return i.status === 'completed'; });
    var leanOf = function (i) { return TF.lean(TF.parse(i.summary)); };
    var shown = 0;
    if (this._gview === 'all') {
      shown += this._groceryGroups(b, l, active, false);
    } else {
      var gv = this._gview;
      shown += this._groceryGroups(b, l, active.filter(function (i) { return leanOf(i) === gv; }), false);
      var anyItems = active.filter(function (i) { return leanOf(i) === 'any'; });
      if (anyItems.length) {
        b.appendChild(el('div', { class: 'sec' }, 'Grab it while you are there (' + anyItems.length + ')'));
        shown += this._groceryGroups(b, l, anyItems, false);
      }
      var elsewhere = active.filter(function (i) { var k = leanOf(i); return k !== gv && k !== 'any'; });
      if (elsewhere.length) {
        b.appendChild(el('div', { class: 'sec' }, 'Other stops (' + elsewhere.length + ')'));
        shown += this._groceryGroups(b, l, elsewhere, true);
      }
    }
    if (!shown) b.appendChild(el('div', { class: 'empty' }, [icon(IC.check, 28, 'rgba(255,255,255,0.15)'), 'Nothing here']));
    if (done.length) {
      b.appendChild(el('div', { class: 'hdr done-h' }, [
        el('span', { class: 'hname', style: 'color:rgba(255,255,255,0.25)' }, 'Done (' + done.length + ')'),
        el('button', { class: 'hbtn', onclick: function () { self._clearDone(l.id); } }, 'Clear')
      ]));
      var cdone = { c: '#4ade80' };
      done.forEach(function (it) { b.appendChild(self._groceryRow(l, it, cdone)); });
    }
  }

  /* ---------- settings ---------- */

  _saveSettings() {
    this._persist({ type: 'todo_flow/set_settings', settings: this._data.settings });
  }

  _move(key, dir) {
    var order = TF.orderedCats(this._data.settings.cat_order).filter(function (c) { return c.k !== 'other'; }).map(function (c) { return c.k; });
    var i = order.indexOf(key), j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    var t = order[i]; order[i] = order[j]; order[j] = t;
    this._data.settings.cat_order = order;
    this._saveSettings();
    this._renderBody();
  }

  _bodySettings(b) {
    var self = this;
    b.appendChild(el('div', { class: 'sec' }, 'Aisle order'));
    b.appendChild(el('div', { class: 'note' }, 'Grocery categories show in this order. Put them in the order you walk the store.'));
    var cats = TF.orderedCats(this._data.settings.cat_order).filter(function (c) { return c.k !== 'other'; });
    cats.forEach(function (c, i) {
      b.appendChild(el('div', { class: 'srow' }, [
        el('span', { class: 'dot', style: 'background:' + c.c }),
        el('span', { class: 'sname' }, c.l),
        el('button', { class: 'ib', style: i === 0 ? 'opacity:.2' : '', onclick: function () { self._move(c.k, -1); } }, icon(IC.up, 18)),
        el('button', { class: 'ib', style: i === cats.length - 1 ? 'opacity:.2' : '', onclick: function () { self._move(c.k, 1); } }, icon(IC.down, 18))
      ]));
    });

    var keys = Object.keys(this._data.overrides).sort();
    b.appendChild(el('div', { class: 'sec' }, 'Learned items (' + keys.length + ')'));
    if (!keys.length) {
      b.appendChild(el('div', { class: 'note' }, 'Nothing yet. Tap a grocery item and pick a category, or pick one in the add bar, and Todo Flow remembers.'));
    }
    keys.forEach(function (k) {
      var c = TF.catByKey(self._data.overrides[k]);
      b.appendChild(el('div', { class: 'lrn' }, [
        el('span', { style: 'flex:1' }, k),
        el('span', { class: 'arrow' }, '>'),
        el('span', { style: 'color:' + c.c + ';font-weight:700;font-size:12px' }, c.l),
        el('button', { class: 'ib', title: 'Forget', onclick: function () {
          var op = TF.forget(self._data, k);
          if (op) self._persist({ type: 'todo_flow/forget', norm: op.norm, tokens: op.tokens });
          self._renderBody();
        } }, icon(IC.close, 14))
      ]));
    });
    if (keys.length) {
      b.appendChild(el('div', { class: 'srow' }, el('button', {
        class: 'act' + (this._confirmReset ? ' bad' : ''),
        style: this._confirmReset ? 'margin-left:0;border-color:#f87171;color:#f87171;padding:5px 10px' : '',
        onclick: function () {
          if (!self._confirmReset) { self._confirmReset = true; self._renderBody(); return; }
          self._confirmReset = false;
          self._data.overrides = {};
          self._data.tok = {};
          self._persist({ type: 'todo_flow/reset_learning' });
          self._renderBody();
        }
      }, this._confirmReset ? 'Tap again to erase all learning' : 'Reset learning')));
    }

    b.appendChild(el('div', { class: 'sec' }, 'Storage'));
    b.appendChild(el('div', { class: 'note' }, this._backend ?
      'Learning is saved in Home Assistant and shared by every device.' :
      'Todo Flow integration not found - learning is saved in this browser only. Install the integration to share it across devices.'));
    b.appendChild(el('div', { class: 'note' }, 'Todo Flow ' + TF_VERSION));
  }

  /* ---------- add bar ---------- */

  _renderBar() {
    var self = this, bar = this._elBar;
    bar.textContent = '';
    if (this._settings || !this._lists.length) return;
    var lid = this._active;
    var l = this._list(lid);
    var combined = false;
    if (!l) {
      combined = true;
      l = this._list(this._addTarget) || this._lists.filter(function (x) { return !x.grocery; })[0] || this._lists[0];
      lid = l.id;
    }
    var grocery = l.grocery;
    var input = el('input', { class: 'add', placeholder: grocery ? 'Add grocery item...' : 'Add to ' + l.name + '...', style: 'border-bottom-color:' + l.color + '55' });
    var preview = el('button', { class: 'pv', style: 'display:none' });
    var chooser = el('div', { class: 'chooser', style: 'display:none' });
    var leanBtn = el('button', { class: 'tog', onclick: function () {
      self._lean = LEAN_ORDER[(LEAN_ORDER.indexOf(self._lean) + 1) % LEAN_ORDER.length];
      paintLean();
    } });
    var paintLean = function () {
      leanBtn.className = 'tog' + (self._lean === 'costco' ? ' on' : (self._lean === 'local' ? ' loc' : (self._lean === 'walmart' ? ' wm' : '')));
      leanBtn.textContent = LEAN_LABEL[self._lean];
    };
    paintLean();
    var send = el('button', { class: 'snd', style: 'background:' + l.color, onclick: function () { go(); } }, icon(IC.send, 16, '#0a0a14'));
    var target = combined ? el('button', {
      class: 'tog', title: 'Which list',
      style: 'color:' + l.color + ';border-color:' + l.color + '66',
      onclick: function () {
        var i = self._lists.indexOf(l);
        self._addTarget = self._lists[(i + 1) % self._lists.length].id;
        self._renderBar();
      }
    }, l.name) : null;

    var curKey = function () { return self._pick || TF.classify(self._data, input.value).key; };
    var paintPreview = function () {
      if (!grocery || !input.value.trim()) { preview.style.display = 'none'; chooser.style.display = 'none'; return; }
      var c = TF.catByKey(curKey());
      preview.style.display = 'block';
      preview.textContent = c.l;
      preview.style.color = c.c;
      preview.style.borderColor = c.c + '88';
      preview.style.background = self._pick ? c.c + '26' : 'transparent';
    };
    var paintChooser = function () {
      chooser.textContent = '';
      chooser.style.display = self._chooser && grocery && input.value.trim() ? 'flex' : 'none';
      TF.orderedCats(self._data.settings.cat_order).forEach(function (c) {
        chooser.appendChild(el('button', {
          class: 'cat',
          style: 'color:' + c.c + ';border-color:' + (curKey() === c.k ? c.c : 'rgba(255,255,255,0.12)') + ';background:' + (curKey() === c.k ? c.c + '26' : 'transparent'),
          onclick: function () { self._pick = c.k; self._chooser = false; paintPreview(); paintChooser(); input.focus(); }
        }, c.l));
      });
    };
    var go = function () {
      var v = input.value;
      if (!v.trim()) return;
      var pk = self._pick;
      input.value = '';
      self._pick = null; self._chooser = false;
      paintPreview(); paintChooser();
      self._add(lid, v, self._lean, pk);
      self._lean = self._defLean();
      paintLean();
    };
    preview.addEventListener('click', function () { self._chooser = !self._chooser; paintChooser(); });
    input.addEventListener('input', function () { if (!input.value.trim()) self._pick = null; paintPreview(); paintChooser(); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });

    bar.appendChild(el('div', { class: 'bar' }, [target, input, preview, grocery ? leanBtn : null, send]));
    bar.appendChild(chooser);
  }
}

customElements.define('todo-flow-card', TodoFlowCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'todo-flow-card',
  name: 'Todo Flow',
  description: 'Any todo list plus a grocery area that learns your categories.'
});
