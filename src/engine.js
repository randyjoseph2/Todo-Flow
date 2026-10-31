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


  /* ---------- repeats and date words ---------- */

  var WD = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  var MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function toYmd(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function fromYmd(s) { var p = String(s).slice(0, 10).split('-'); return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12, 0, 0); }
  function plusDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function plusMonths(d, n) {
    var x = new Date(d.getFullYear(), d.getMonth() + n, 1, 12, 0, 0);
    var last = new Date(x.getFullYear(), x.getMonth() + 1, 0, 12, 0, 0).getDate();
    x.setDate(Math.min(d.getDate(), last));
    return x;
  }

  /* Repeat spec: "1d" "2w" "1m" "1y" or "wd" (weekdays). Returns null when invalid. */
  function parseRepeat(spec) {
    var s = String(spec || '').toLowerCase();
    if (s === 'wd') return { u: 'wd', n: 1 };
    var m = /^(\d{1,3})([dwmy])$/.exec(s);
    if (!m || Number(m[1]) < 1) return null;
    return { u: m[2], n: Number(m[1]) };
  }

  function repLabel(spec) {
    var r = parseRepeat(spec);
    if (!r) return '';
    if (r.u === 'wd') return 'Weekdays';
    var names = { d: ['Daily', 'day'], w: ['Weekly', 'week'], m: ['Monthly', 'month'], y: ['Yearly', 'year'] }[r.u];
    return r.n === 1 ? names[0] : 'Every ' + r.n + ' ' + names[1] + 's';
  }

  /* Next due date (YYYY-MM-DD) after finishing a repeating task. Keeps the schedule, skips dates already past. */
  function nextDue(spec, due, today) {
    var r = parseRepeat(spec);
    if (!r) return null;
    var t = fromYmd(today), base = fromYmd(due || today), nx = base, guard = 0;
    do {
      if (r.u === 'wd') {
        nx = plusDays(nx, 1);
        while (nx.getDay() === 0 || nx.getDay() === 6) nx = plusDays(nx, 1);
      } else if (r.u === 'd') nx = plusDays(nx, r.n);
      else if (r.u === 'w') nx = plusDays(nx, 7 * r.n);
      else if (r.u === 'm') nx = plusMonths(nx, r.n);
      else nx = plusMonths(nx, 12 * r.n);
      guard++;
    } while (nx.getTime() <= t.getTime() && guard < 800);
    return toYmd(nx);
  }

  function wdIndex(w) { return WD[String(w).toLowerCase().slice(0, 3)]; }

  function nextWeekday(now, idx, strict) {
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0), n = 0;
    do { if (n > 0 || strict) { d = plusDays(d, 1); } n++; } while (d.getDay() !== idx && n < 9);
    return d;
  }

  var WDRX = '(?:monday|mon|tuesday|tues|tue|wednesday|wed|thursday|thurs|thur|thu|friday|fri|saturday|sat|sunday|sun)';
  var MORX = '(?:january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)';
  var REP_RX = new RegExp('(?:\\s+)(every\\s+(\\d+\\s+)?(day|week|month|year)s?|daily|weekly|monthly|yearly|every\\s+weekday|every\\s+' + WDRX + ')\\s*$', 'i');
  var DATE_RX = new RegExp('(?:\\s+(?:on|by|due|this))?\\s+(today|tonight|tomorrow|tmrw|tmr|(?:next\\s+)?' + WDRX + '|next week|next month|in\\s+\\d+\\s+(?:day|week|month)s?|' + MORX + '\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?|\\d{1,2}\\/\\d{1,2}(?:\\/\\d{2,4})?)\\s*$', 'i');

  /* Pull trailing date/repeat words off a task: "pay rent friday" -> due Friday, "trash every tuesday" -> weekly. */
  function dateWords(text, now) {
    var s = String(text || '').trim(), out = { text: s, due: null, rep: null, found: false };
    var today = new Date((now || new Date()).getFullYear(), (now || new Date()).getMonth(), (now || new Date()).getDate(), 12, 0, 0);
    var passes = 0;
    while (passes < 2) {
      passes++;
      var m = REP_RX.exec(s);
      if (m && !out.rep && s.slice(0, m.index).trim()) {
        var ph = m[1].toLowerCase().replace(/\s+/g, ' ');
        var wm = new RegExp('^every ' + WDRX + '$').test(ph);
        if (wm) { out.rep = '1w'; if (!out.due) out.due = toYmd(nextWeekday(today, wdIndex(ph.slice(6)), false)); }
        else if (ph === 'every weekday') { out.rep = 'wd'; }
        else {
          var u = /day/.test(ph) ? 'd' : (/week/.test(ph) ? 'w' : (/month/.test(ph) ? 'm' : 'y'));
          if (ph === 'daily') u = 'd'; else if (ph === 'weekly') u = 'w'; else if (ph === 'monthly') u = 'm'; else if (ph === 'yearly') u = 'y';
          var nm = /every (\d+)/.exec(ph);
          out.rep = (nm ? Number(nm[1]) : 1) + u;
        }
        s = s.slice(0, m.index).trim();
        out.found = true;
        continue;
      }
      var d = DATE_RX.exec(s);
      if (d && !out.due && s.slice(0, d.index).trim()) {
        var w = d[1].toLowerCase().replace(/\s+/g, ' '), due = null;
        if (w === 'today' || w === 'tonight') due = today;
        else if (w === 'tomorrow' || w === 'tmrw' || w === 'tmr') due = plusDays(today, 1);
        else if (w === 'next week') due = plusDays(today, 7);
        else if (w === 'next month') due = plusMonths(today, 1);
        else if (/^in \d/.test(w)) {
          var q = /^in (\d+) (day|week|month)/.exec(w);
          due = q[2] === 'day' ? plusDays(today, Number(q[1])) : (q[2] === 'week' ? plusDays(today, 7 * Number(q[1])) : plusMonths(today, Number(q[1])));
        } else if (/^(next )?[a-z]+$/.test(w) && wdIndex(w.replace('next ', '')) !== undefined && new RegExp('^(next )?' + WDRX + '$').test(w)) {
          due = nextWeekday(today, wdIndex(w.replace('next ', '')), /^next /.test(w));
        } else if (/\//.test(w)) {
          var sp = w.split('/');
          var yr = sp[2] ? Number(sp[2]) : today.getFullYear();
          if (yr < 100) yr += 2000;
          due = new Date(yr, Number(sp[0]) - 1, Number(sp[1]), 12, 0, 0);
          if (!sp[2] && due.getTime() < today.getTime()) due = new Date(yr + 1, Number(sp[0]) - 1, Number(sp[1]), 12, 0, 0);
        } else {
          var mm = new RegExp('^(' + MORX + ')\\.?\\s+(\\d{1,2})').exec(w);
          if (mm) {
            due = new Date(today.getFullYear(), MONTHS[mm[1].slice(0, 3)], Number(mm[2]), 12, 0, 0);
            if (due.getTime() < today.getTime()) due = new Date(today.getFullYear() + 1, MONTHS[mm[1].slice(0, 3)], Number(mm[2]), 12, 0, 0);
          }
        }
        if (due) {
          out.due = toYmd(due);
          s = s.slice(0, d.index).trim();
          out.found = true;
          continue;
        }
      }
      break;
    }
    out.text = s;
    if (!out.found) { out.due = null; out.rep = null; }
    return out;
  }

  /* Split "[P1] [Costco] text" into parts. */
  function parse(summary) {
    var s = String(summary || '');
    var tags = s.match(/^(\s*\[[^\]]*\]\s*)+/);
    var costco = false, p1 = false, local = false, walmart = false, ht = false, rp = null;
    if (tags) {
      costco = /\[costco\]/i.test(tags[0]);
      walmart = /\[walmart\]/i.test(tags[0]) && !costco;
      ht = /\[(ht|harris teeter)\]/i.test(tags[0]) && !costco && !walmart;
      local = /\[local\]/i.test(tags[0]) && !costco && !walmart && !ht;
      p1 = /\[p1\]/i.test(tags[0]);
      var rm = /\[r:([^\]]+)\]/i.exec(tags[0]);
      if (rm && parseRepeat(rm[1].toLowerCase())) rp = rm[1].toLowerCase();
      s = s.slice(tags[0].length);
    }
    return { text: s.trim(), costco: costco, p1: p1, local: local, walmart: walmart, ht: ht, rep: rp };
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
    return (parts.p1 ? '[P1] ' : '') + (parts.rep && parseRepeat(parts.rep) ? '[R:' + parts.rep + '] ' : '') + (l === 'costco' ? '[Costco] ' : '') +
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
    return { overrides: {}, tok: {}, stores: {}, pantry: {}, settings: { cat_order: [] } };
  }

  function normalizeData(d) {
    var out = emptyData();
    if (d && typeof d === 'object') {
      if (d.overrides) out.overrides = d.overrides;
      if (d.tok) out.tok = d.tok;
      if (d.stores) out.stores = d.stores;
      if (d.pantry) out.pantry = d.pantry;
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

  /* ---------- learned store per item ---------- */

  function normOf(name) {
    return tokenize(parse(name).text).join(' ');
  }

  /* The tag on the item wins; otherwise what the household taught for this exact item; otherwise any. */
  function effLean(data, summary) {
    var p = parse(summary), l = lean(p);
    if (l !== 'any') return l;
    var norm = tokenize(p.text).join(' ');
    return (norm && data.stores && data.stores[norm]) || 'any';
  }

  function learnedStore(data, name) {
    var norm = normOf(name);
    return (norm && data.stores && data.stores[norm]) || 'any';
  }

  /* Teach the store for this item. 'any' forgets it. Returns the op for the backend. */
  function learnStore(data, name, store) {
    var norm = normOf(name);
    if (!norm) return null;
    if (!data.stores) data.stores = {};
    if (store === 'any') delete data.stores[norm]; else data.stores[norm] = store;
    return { norm: norm, store: store };
  }

  /* ---------- pantry staples (skipped when importing a meal plan) ---------- */

  var STAPLES = { 'salt': 1, 'pepper': 1, 'black pepper': 1, 'salt pepper': 1, 'salt and pepper': 1, 'kosher salt': 1, 'water': 1 };

  function isStaple(data, name) {
    var norm = normOf(name);
    var v = data.pantry ? data.pantry[norm] : undefined;
    if (v === 1) return true;
    if (v === 0) return false;
    return !!STAPLES[norm];
  }

  function setStaple(data, name, on) {
    var norm = normOf(name);
    if (!norm) return null;
    if (!data.pantry) data.pantry = {};
    data.pantry[norm] = on ? 1 : 0;
    return { norm: norm, value: on ? 1 : 0 };
  }

  function clearStaple(data, norm) {
    if (data.pantry) delete data.pantry[norm];
    return { norm: norm, value: null };
  }

  /* ---------- Mealie import ---------- */

  var UNIT_ABBR = { tablespoon: 'tbsp', teaspoon: 'tsp', gram: 'g', kilogram: 'kg', ounce: 'oz', pound: 'lb', milliliter: 'ml', liter: 'l', 'fluid ounce': 'fl oz' };
  var LABEL_CAT = [
    ['produce', 'produce'], ['vegetable', 'produce'], ['fruit', 'produce'], ['meat', 'meat'], ['seafood', 'meat'], ['fish', 'meat'],
    ['dairy', 'dairy'], ['egg', 'dairy'], ['bakery', 'bakery'], ['bread', 'bakery'], ['frozen', 'frozen'],
    ['baking', 'pantry'], ['condiment', 'pantry'], ['spice', 'pantry'], ['pantry', 'pantry'], ['canned', 'pantry'], ['grain', 'pantry'],
    ['household', 'household'], ['cleaning', 'household']
  ];
  var FRACS = [[0, ''], [1 / 8, '1/8'], [1 / 4, '1/4'], [1 / 3, '1/3'], [3 / 8, '3/8'], [1 / 2, '1/2'], [5 / 8, '5/8'], [2 / 3, '2/3'], [3 / 4, '3/4'], [7 / 8, '7/8'], [1, '']];

  function fmtQty(q) {
    q = Number(q);
    if (!q || q < 0) return '';
    var whole = Math.floor(q), frac = q - whole, best = null, i;
    for (i = 0; i < FRACS.length; i++) {
      if (Math.abs(frac - FRACS[i][0]) < 0.03) { best = FRACS[i]; break; }
    }
    if (best) {
      if (best[0] === 1) { whole += 1; best = FRACS[0]; }
      if (!best[1]) return String(whole);
      return whole ? whole + ' ' + best[1] : best[1];
    }
    return String(Math.round(q * 100) / 100);
  }

  function cap(s) {
    s = String(s || '').trim();
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  function labelCat(label) {
    var l = String(label || '').toLowerCase();
    for (var i = 0; i < LABEL_CAT.length; i++) {
      if (l.indexOf(LABEL_CAT[i][0]) >= 0) return LABEL_CAT[i][1];
    }
    return 'other';
  }

  function unitText(unit, q) {
    if (!unit) return '';
    var n = String(unit.name || '').toLowerCase();
    if (UNIT_ABBR[n]) return UNIT_ABBR[n];
    if (q > 1 && unit.plural_name) return unit.plural_name;
    return unit.name || unit.abbreviation || '';
  }

  /* entries: [{ title, recipe }] where recipe.ingredients is Mealie's ingredient list.
     Merges the same food across recipes, adds quantities that share a unit, and files each
     result under a grocery category. existing: map of normalized names already on the list. */
  function mealieMerge(data, entries, existing) {
    var acc = {}, order = [];
    existing = existing || {};
    (entries || []).forEach(function (en) {
      var ings = (en.recipe && en.recipe.ingredients) || [];
      ings.forEach(function (ing) {
        var name = (ing.food && ing.food.name) ? ing.food.name : String(ing.note || ing.display || '').trim();
        var norm = normOf(name);
        if (!norm) return;
        var a = acc[norm];
        if (!a) {
          a = acc[norm] = { norm: norm, name: cap(name), units: {}, unitOrder: [], recipes: [], label: ing.food && ing.food.label ? ing.food.label.name : '' };
          order.push(norm);
        }
        var q = Number(ing.quantity) || 0;
        var uk = ing.unit ? String(ing.unit.name || '') : '';
        if (!a.units[uk]) { a.units[uk] = { q: 0, unit: ing.unit || null }; a.unitOrder.push(uk); }
        a.units[uk].q += q;
        if (en.title && a.recipes.indexOf(en.title) < 0) a.recipes.push(en.title);
      });
    });
    return order.map(function (norm) {
      var a = acc[norm], parts = [];
      a.unitOrder.forEach(function (uk) {
        var u = a.units[uk], t = fmtQty(u.q);
        if (!t) return;
        var ut = unitText(u.unit, u.q);
        parts.push(ut ? t + ' ' + ut : t);
      });
      var cls = classify(data, a.name).key;
      if (cls === 'other') { var lc = labelCat(a.label); if (lc !== 'other') cls = lc; }
      return {
        norm: norm, name: a.name, qty: parts.join(' + '), recipes: a.recipes, cat: cls,
        staple: isStaple(data, a.name), onList: !!existing[norm]
      };
    });
  }

  function mealieSummary(item) {
    return item.qty ? item.name + ' (' + item.qty + ')' : item.name;
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
    effLean: effLean, learnedStore: learnedStore, learnStore: learnStore, isStaple: isStaple, setStaple: setStaple, clearStaple: clearStaple,
    normOf: normOf, mealieMerge: mealieMerge, mealieSummary: mealieSummary, fmtQty: fmtQty,
    parseRepeat: parseRepeat, repLabel: repLabel, nextDue: nextDue, dateWords: dateWords,
    classify: classify, learn: learn, forget: forget, orderedCats: orderedCats, catByKey: catByKey
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = TodoFlowEngine; }
