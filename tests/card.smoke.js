/* Minimal DOM stub + mocked HA to exercise the built card without a browser. */
var fs = require('fs');
var vm = require('vm');

function Node(tag) { this.tag = tag; this.children = []; this.attrs = {}; this.listeners = {}; this.style = {}; this.className = ''; this._text = ''; this.value = ''; }
Node.prototype.appendChild = function (c) { this.children.push(c); c.parent = this; return c; };
Node.prototype.setAttribute = function (k, v) { this.attrs[k] = v; if (k === 'value') this.value = v; };
Node.prototype.addEventListener = function (t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); };
Node.prototype.dispatchEvent = function (e) { var self = this; (this.listeners[e.type] || []).forEach(function (f) { f.call(self, e); }); };
Node.prototype.click = function () { this.dispatchEvent({ type: 'click', stopPropagation: function () {} }); };
Node.prototype.focus = function () {};
Object.defineProperty(Node.prototype, 'textContent', {
  get: function () { return this.tag === '#text' ? this._text : this.children.map(function (c) { return c.textContent; }).join(''); },
  set: function (v) { this.children = []; if (v) this.appendChild(mkText(v)); }
});
function mkText(t) { var n = new Node('#text'); n._text = String(t); return n; }
function matches(n, sel) {
  if (n.tag === '#text') return false;
  if (sel.charAt(0) === '.') return (' ' + n.className + ' ').indexOf(' ' + sel.slice(1) + ' ') >= 0;
  return n.tag === sel;
}
Node.prototype.querySelectorAll = function (sel) {
  var out = [];
  (function walk(n) { n.children.forEach(function (c) { if (matches(c, sel)) out.push(c); walk(c); }); })(this);
  return out;
};
Node.prototype.querySelector = function (sel) { return this.querySelectorAll(sel)[0] || null; };

var registry = {};
var pushed = [];
var sandbox = {
  document: {
    createElement: function (t) { return new Node(t); },
    createElementNS: function (ns, t) { return new Node(t); },
    createTextNode: mkText
  },
  HTMLElement: function () {},
  customElements: { define: function (n, c) { registry[n] = c; } },
  window: {}, localStorage: { getItem: function () { return null; }, setItem: function () {} },
  history: { pushState: function (a, b, path) { pushed.push(path); } }, Event: function (type) { this.type = type; }, dispatchEvent: function () {},
  setTimeout: setTimeout, clearTimeout: clearTimeout, Promise: Promise, console: console, Date: Date, Object: Object, Array: Array, JSON: JSON, Math: Math, String: String
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(__dirname + '/../custom_components/todo_flow/www/todo-flow.js', 'utf8'), sandbox);

var Card = registry['todo-flow-card'];
Card.prototype.attachShadow = function () { this.shadowRoot = new Node('#root'); return this.shadowRoot; };

var items = {
  'todo.grocery_list': [
    { uid: 'a', summary: 'Shout', status: 'needs_action' },
    { uid: 'b', summary: 'Frigo cheese sticks', status: 'needs_action' },
    { uid: 'c', summary: '[Costco] Pumpkins', status: 'needs_action' },
    { uid: 'd', summary: 'Tortillas', status: 'completed' },
    { uid: 'e', summary: '[Walmart] Paper towels', status: 'needs_action' },
    { uid: 'f', summary: '[HT] Organic strawberries', status: 'needs_action' }
  ],
  'todo.randy_to_do': [{ uid: 'r1', summary: '[P1] Fix gate', status: 'needs_action', due: '2026-10-20' }]
};
var calls = [];
var store = { overrides: {}, tok: {}, settings: { cat_order: [] } };
var hass = {
  states: {
    'todo.grocery_list': { state: '5', attributes: { friendly_name: 'Grocery List' } },
    'todo.randy_to_do': { state: '1', attributes: { friendly_name: 'Randy To Do' } },
    'sensor.x': { state: '1', attributes: {} }
  },
  connection: {
    subscribeEvents: function () {},
    sendMessagePromise: function (m) {
      calls.push(m);
      if (m.type === 'todo_flow/get_data') return Promise.resolve(store);
      if (m.type === 'todo_flow/mealie_entry') return Promise.resolve({ entry_id: 'mealie1' });
      if (m.type === 'call_service' && m.domain === 'mealie' && m.service === 'get_mealplan') {
        var sd = String(m.service_data.start_date || '2026-10-29'), nx = new Date(sd + 'T00:00:00');
        nx.setDate(nx.getDate() + 1);
        var nxs = nx.getFullYear() + '-' + ('0' + (nx.getMonth() + 1)).slice(-2) + '-' + ('0' + nx.getDate()).slice(-2);
        return Promise.resolve({ response: { mealplan: [
          { mealplan_id: 'p2', mealplan_date: nxs, entry_type: 'dinner', title: 'Takeout night', recipe: null },
          { mealplan_id: 7, mealplan_date: sd, entry_type: 'dinner', recipe: { recipe_id: 'r1', name: 'Honey Garlic Chicken' } }
        ] } });
      }
      if (m.type === 'call_service' && m.domain === 'mealie' && m.service === 'get_recipes') {
        return Promise.resolve({ response: { recipes: { items: [
          { recipe_id: 'r2', name: 'Best Lasagna', description: 'Classic.', tags: [{ name: 'Beef' }, { name: 'Pasta' }], total_time: '0.0', prep_time: '60.0', perform_time: '50.0', last_made: '2026-10-07T03:45:00+00:00' },
          { recipe_id: 'r1', name: 'Honey Garlic Chicken Breast', description: 'Quick and easy.', tags: [{ name: 'Chicken' }], total_time: '12.0', last_made: null },
          { recipe_id: 'r3', name: 'Marry Me Chicken Tortellini', description: '', tags: [{ name: 'Chicken' }, { name: 'Pasta' }], total_time: '60.0', last_made: null }
        ] } } });
      }
      if (m.type === 'call_service' && m.domain === 'mealie' && m.service === 'delete_mealplan' && m.return_response) return Promise.reject(new Error('service does not support responses'));
      if (m.type === 'call_service' && m.domain === 'mealie' && ['set_mealplan', 'delete_mealplan', 'set_random_mealplan'].indexOf(m.service) >= 0) return Promise.resolve({ response: {} });
      if (m.type === 'call_service' && m.domain === 'mealie' && m.service === 'get_recipe') {
        var ing = function (food, q, unit, label) { return { quantity: q, unit: unit, food: { name: food, label: label ? { name: label } : null }, note: '' }; };
        return Promise.resolve({ response: { recipe: { recipe_id: 'r1', name: 'Honey Garlic Chicken', total_time: '25.0', instructions: [{ text: 'Sear the chicken.' }, { text: 'Add the sauce.' }], ingredients: [
          ing('chicken breast', 500, { name: 'gram' }, 'Meat'), ing('garlic', 2, { name: 'clove', plural_name: 'cloves' }, 'Produce'),
          ing('pumpkin', 1, null, 'Produce'), ing('salt', 0, null, 'Baking')
        ] } } });
      }
      if (m.type === 'call_service' && m.service === 'get_items') {
        var r = {}; r[m.target.entity_id] = { items: items[m.target.entity_id] };
        return Promise.resolve({ response: r });
      }
      return Promise.resolve({});
    }
  }
};
var assert = require('assert');
var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
function txt(sr, sel) { return sr.querySelector(sel).textContent; }
function find(list, s) {
  return list.filter(function (n) {
    if (n.textContent.indexOf(s) >= 0) return true;
    var inp = n.querySelector ? n.querySelector('.tin') : null;
    return !!(inp && String(inp.value).indexOf(s) >= 0);
  })[0];
}

(async function () {
  var card = new Card();
  card.setConfig({});
  card.hass = hass;
  await wait(30);
  var sr = card.shadowRoot;

  var chips = sr.querySelectorAll('.chip').map(function (c) { return c.textContent; });
  assert.deepStrictEqual(chips, ['All', 'Grocery5', 'Randy To Do1']);
  assert.ok(txt(sr, '.body').indexOf('Fix gate') >= 0, 'all view shows Randy task');

  find(sr.querySelectorAll('.chip'), 'Grocery').click();
  var hdrs = sr.querySelectorAll('.hname').map(function (c) { return c.textContent; });
  assert.ok(hdrs.indexOf('Dairy & Eggs') >= 0 && hdrs.indexOf('Produce') >= 0 && hdrs.indexOf('Other') >= 0, 'grocery groups: ' + hdrs);
  assert.ok(find(sr.querySelectorAll('.hname'), 'Done (1)'), 'done section');

  /* Costco lean: invisible tag, stripe only */
  var pump = find(sr.querySelectorAll('.row'), 'Pumpkins');
  assert.ok(pump.style.cssText.indexOf('inset 3px 0 0 #f87171') >= 0, 'costco stripe');
  assert.ok(txt(sr, '.body').indexOf('Costco') < 0 || sr.querySelectorAll('.tab').length, 'no visible tag text on rows');
  assert.strictEqual(pump.textContent.indexOf('Costco'), -1, 'tag text hidden');

  /* Store tabs */
  assert.deepStrictEqual(sr.querySelectorAll('.tab').map(function (t) { return t.textContent; }), ['All', 'Costco', 'Walmart', 'Harris Teeter', 'Other stores']);
  find(sr.querySelectorAll('.tab'), 'Costco').click();
  var cb = txt(sr, '.body');
  assert.ok(cb.indexOf('Pumpkins') >= 0 && cb.indexOf('Grab it while you are there') > cb.indexOf('Pumpkins'), 'costco run order');
  assert.ok(cb.indexOf('Frigo') > cb.indexOf('Grab it while you are there'), 'any items under grab-it section');
  assert.ok(cb.indexOf('Other stops') > cb.indexOf('Frigo') && cb.indexOf('Paper towels') > cb.indexOf('Other stops'), 'walmart item shown dimmed under other stops');
  find(sr.querySelectorAll('.tab'), 'Walmart').click();
  var wb = txt(sr, '.body');
  assert.ok(wb.indexOf('Paper towels') >= 0 && wb.indexOf('Paper towels') < wb.indexOf('Grab it while you are there'), 'walmart items first');
  assert.ok(wb.indexOf('Pumpkins') > wb.indexOf('Other stops'), 'costco item under other stops on walmart tab');
  assert.ok(find(sr.querySelectorAll('.row'), 'Paper towels').style.cssText.indexOf('#60a5fa') >= 0, 'walmart stripe');
  assert.strictEqual(sr.querySelector('.tog').textContent, 'Walmart', 'add bar defaults to the tab store');
  find(sr.querySelectorAll('.tab'), 'Harris Teeter').click();
  assert.ok(find(sr.querySelectorAll('.row'), 'strawberries').style.cssText.indexOf('#22c55e') >= 0, 'HT stripe is green');
  assert.strictEqual(sr.querySelector('.tog').textContent, 'Harris Teeter');
  find(sr.querySelectorAll('.tab'), 'Other stores').click();
  assert.strictEqual(sr.querySelector('.tog').textContent, 'Other stores');
  find(sr.querySelectorAll('.tab'), 'All').click();
  assert.strictEqual(sr.querySelector('.tog').textContent, 'Any store');

  /* Add bar sits above the list */
  var kids = sr.querySelector('ha-card').children.map(function (c) { return c.className || c.tag; });
  assert.ok(kids.indexOf('body') > kids.indexOf('top') && sr.querySelector('ha-card').children[2].querySelector('.add'), 'add bar above body: ' + kids);

  /* Three-state lean from an open row */
  find(sr.querySelectorAll('.row'), 'Frigo').click();
  find(sr.querySelectorAll('.cat'), 'Costco').click();
  var ren = calls.filter(function (c) { return c.service === 'update_item' && c.service_data.rename; });
  assert.strictEqual(ren[ren.length - 1].service_data.rename, '[Costco] Frigo cheese sticks');
  find(sr.querySelectorAll('.row'), 'Frigo').click();
  find(sr.querySelectorAll('.cat'), 'Other stores').click();
  ren = calls.filter(function (c) { return c.service === 'update_item' && c.service_data.rename; });
  assert.strictEqual(ren[ren.length - 1].service_data.rename, '[Local] Frigo cheese sticks');

  /* Walmart lean from an open row, then inline text edit on the same row */
  find(sr.querySelectorAll('.cat'), 'Walmart').click();
  ren = calls.filter(function (c) { return c.service === 'update_item' && c.service_data.rename; });
  assert.strictEqual(ren[ren.length - 1].service_data.rename, '[Walmart] Frigo cheese sticks');
  var ed = find(sr.querySelectorAll('.row'), 'Frigo').querySelector('.tin');
  assert.ok(ed, 'tapping a grocery row opens the text field directly');
  ed.value = 'Frigo string cheese';
  ed.dispatchEvent({ type: 'input' });
  find(sr.querySelectorAll('.cat'), 'Costco').click();
  ren = calls.filter(function (c) { return c.service === 'update_item' && c.service_data.rename; });
  assert.strictEqual(ren[ren.length - 1].service_data.rename, '[Costco] Frigo string cheese', 'unsaved text survives a lean tap');
  ed = find(sr.querySelectorAll('.row'), 'Frigo string cheese').querySelector('.tin');
  ed.value = 'Frigo cheese sticks';
  ed.dispatchEvent({ type: 'input' });
  find(sr.querySelectorAll('.cat'), 'Any store').click();

  /* Undo toast on check-off */
  var chk = find(sr.querySelectorAll('.row'), 'Frigo').querySelector('.chk');
  chk.click();
  assert.strictEqual(sr.querySelector('.toast').style.display, 'flex', 'toast shown');
  assert.ok(find(sr.querySelectorAll('.hname'), 'Done (2)'), 'frigo is done');
  find(sr.querySelector('.toast').querySelectorAll('button'), 'Undo').click();
  assert.ok(find(sr.querySelectorAll('.hname'), 'Done (1)'), 'undo restored it');
  assert.strictEqual(sr.querySelector('.toast').style.display, 'none');

  find(sr.querySelectorAll('.row'), 'Shout').click();
  find(sr.querySelectorAll('.cat'), 'Household').click();
  hdrs = sr.querySelectorAll('.hname').map(function (c) { return c.textContent; });
  assert.ok(hdrs.indexOf('Household') >= 0 && hdrs.indexOf('Other') < 0, 'Shout moved to Household: ' + hdrs);
  var lc = calls.filter(function (c) { return c.type === 'todo_flow/learn'; });
  assert.strictEqual(lc.length, 1);
  assert.strictEqual(lc[0].norm, 'shout');

  var input = sr.querySelector('.add');
  input.value = 'Kind bars';
  input.dispatchEvent({ type: 'input' });
  assert.strictEqual(txt(sr, '.pv'), 'Other');
  find(sr.querySelectorAll('.pv'), 'Other').click();
  find(sr.querySelectorAll('.cat'), 'Pantry').click();
  assert.strictEqual(txt(sr, '.pv'), 'Pantry');
  var lt = sr.querySelector('.tog');
  assert.strictEqual(lt.textContent, 'Any store');
  lt.click();
  assert.strictEqual(lt.textContent, 'Costco');
  lt.click();
  assert.strictEqual(lt.textContent, 'Walmart');
  lt.click();
  assert.strictEqual(lt.textContent, 'Harris Teeter');
  lt.click();
  assert.strictEqual(lt.textContent, 'Other stores');
  lt.click();
  assert.strictEqual(lt.textContent, 'Any store');
  lt.click();
  assert.strictEqual(lt.textContent, 'Costco');
  sr.querySelector('.snd').click();
  await wait(20);
  var add = calls.filter(function (c) { return c.service === 'add_item'; });
  assert.strictEqual(add[0].service_data.item, '[Costco] Kind bars');
  assert.strictEqual(sr.querySelector('.tog').textContent, 'Any store', 'lean resets after add');
  assert.ok(calls.filter(function (c) { return c.type === 'todo_flow/learn'; }).length === 2, 'pick taught');

  /* Learned store default: touched pick teaches, untouched add reuses without a tag */
  input.value = 'Cheddar';
  input.dispatchEvent({ type: 'input' });
  var lt2 = sr.querySelector('.tog');
  lt2.click();
  assert.strictEqual(lt2.textContent, 'Costco');
  sr.querySelector('.snd').click();
  await wait(20);
  add = calls.filter(function (c) { return c.service === 'add_item'; });
  assert.strictEqual(add[add.length - 1].service_data.item, '[Costco] Cheddar');
  var ls = calls.filter(function (c) { return c.type === 'todo_flow/learn_store'; });
  assert.deepStrictEqual({ n: ls[ls.length - 1].norm, s: ls[ls.length - 1].store }, { n: 'cheddar', s: 'costco' });
  input = sr.querySelector('.add');
  input.value = 'cheddar';
  input.dispatchEvent({ type: 'input' });
  assert.strictEqual(sr.querySelector('.tog').textContent, 'Costco', 'learned store pre-selected');
  sr.querySelector('.snd').click();
  await wait(20);
  add = calls.filter(function (c) { return c.service === 'add_item'; });
  assert.strictEqual(add[add.length - 1].service_data.item, 'cheddar', 'learned default is not written as a tag');

  /* Mealie panel */
  assert.ok(sr.querySelector('.mph'), 'mealie panel present below the list');
  sr.querySelector('.mph').click();
  assert.strictEqual(sr.querySelectorAll('.mdate').length, 2, 'date range inputs');
  sr.querySelector('.mfind').click();
  await wait(40);
  assert.strictEqual(sr.querySelectorAll('.meal').length, 2, 'meal rows (recipe + note)');
  var ingRow = function (name) {
    return sr.querySelectorAll('.ing').filter(function (n) { return n.querySelector('.tx').textContent.indexOf(name) === 0; })[0];
  };
  var ings = sr.querySelectorAll('.ing');
  assert.strictEqual(ings.length, 4, 'ingredient rows');
  assert.ok(ingRow('Chicken breast').textContent.indexOf('500 g') >= 0, 'quantity shown');
  assert.ok(ingRow('Pumpkin').textContent.indexOf('on list') >= 0, 'already on the list is flagged');
  assert.strictEqual(sr.querySelector('.madd').textContent, 'Add 2 items to list', 'staples and on-list items off by default');
  ingRow('Garlic').querySelector('.mx').click();
  var sp = calls.filter(function (c) { return c.type === 'todo_flow/set_pantry'; });
  assert.deepStrictEqual({ n: sp[0].norm, v: sp[0].value }, { n: 'garlic', v: 1 });
  assert.strictEqual(sr.querySelector('.madd').textContent, 'Add 1 item to list', 'staple moved out');
  ingRow('Garlic').querySelector('.mx').click();
  assert.strictEqual(sr.querySelector('.madd').textContent, 'Add 2 items to list', 'un-stapling brings it back');
  ingRow('Garlic').querySelector('.chk').click();
  assert.strictEqual(sr.querySelector('.madd').textContent, 'Add 1 item to list', 'untick drops it');
  ingRow('Garlic').querySelector('.chk').click();
  assert.strictEqual(sr.querySelector('.madd').textContent, 'Add 2 items to list');
  var before = calls.filter(function (c) { return c.service === 'add_item'; }).length;
  sr.querySelector('.madd').click();
  await wait(60);
  add = calls.filter(function (c) { return c.service === 'add_item'; });
  assert.deepStrictEqual(add.slice(before).map(function (c) { return c.service_data.item; }), ['Chicken breast (500 g)', 'Garlic (2 cloves)']);
  assert.strictEqual(sr.querySelector('.toast').style.display, 'flex', 'toast with undo');

  sr.querySelectorAll('.ib')[1].click();
  assert.ok(txt(sr, '.body').indexOf('Aisle order') >= 0 && txt(sr, '.body').indexOf('shout') >= 0, 'settings view');
  sr.querySelectorAll('.ib')[1].click();

  find(sr.querySelectorAll('.chip'), 'Randy').click();
  assert.ok(txt(sr, '.body').indexOf('Fix gate') >= 0 && txt(sr, '.body').indexOf('Oct 20') >= 0, 'list view with overdue date');


  /* Mode: tasks page hides grocery, grocery page hides chips */
  var tcard = new Card();
  tcard.setConfig({ mode: 'tasks' });
  tcard.hass = hass;
  await wait(30);
  var tchips = tcard.shadowRoot.querySelectorAll('.chip').map(function (c) { return c.textContent; });
  assert.deepStrictEqual(tchips, ['All', 'Randy To Do1'], 'tasks mode chips: ' + tchips);
  assert.ok(txt(tcard.shadowRoot, '.ttl').indexOf('Tasks') >= 0, 'tasks title');
  assert.strictEqual(txt(tcard.shadowRoot, '.body').indexOf('Shout'), -1, 'no grocery items on tasks page');

  var gcard = new Card();
  gcard.setConfig({ mode: 'grocery' });
  gcard.hass = hass;
  await wait(30);
  var gsr = gcard.shadowRoot;
  assert.strictEqual(gsr.querySelector('.chips').style.display, 'none', 'chips hidden on grocery page');
  assert.ok(txt(gsr, '.ttl').indexOf('Grocery') >= 0, 'grocery title');
  assert.ok(gsr.querySelectorAll('.tab').length === 5, 'trip tabs on grocery page');
  assert.strictEqual(txt(gsr, '.body').indexOf('Fix gate'), -1, 'no tasks on grocery page');

  find(sr.querySelectorAll('.row'), 'Fix gate').click();
  var tin = sr.querySelector('.tin');
  assert.ok(tin && tin.value === 'Fix gate', 'task row opens text field');
  tin.value = 'Fix back gate';
  tin.dispatchEvent({ type: 'input' });
  tin.dispatchEvent({ type: 'keydown', key: 'Enter', preventDefault: function () {} });
  ren = calls.filter(function (c) { return c.service === 'update_item' && c.service_data.rename; });
  assert.strictEqual(ren[ren.length - 1].service_data.rename, '[P1] Fix back gate', 'Enter saves the edit and keeps the tag');

  find(sr.querySelectorAll('.chip'), 'All').click();
  assert.ok(sr.querySelector('.add'), 'add bar present in All view');
  assert.strictEqual(txt(sr, '.bar').indexOf('Randy To Do') >= 0 || txt(sr, '.bar').indexOf('Grocery') >= 0, true, 'list target button');

  /* Meal planner page */
  var mcard = new Card();
  mcard.setConfig({ mode: 'meals', grocery_path: '/newui-4-0/grocery' });
  mcard.hass = hass;
  await wait(80);
  var msr = mcard.shadowRoot;
  assert.ok(txt(msr, '.ttl').indexOf('Meals') >= 0, 'meals title');
  assert.strictEqual(msr.querySelectorAll('.ib').length, 1, 'no settings gear on the meals page');
  assert.strictEqual(msr.querySelectorAll('.dcell').length, 14, 'two weeks of days');
  assert.strictEqual(msr.querySelectorAll('.rcp').length, 3, 'all recipes listed');
  assert.deepStrictEqual(msr.querySelectorAll('.rn').map(function (n) { return n.textContent; }), ['Best Lasagna', 'Honey Garlic Chicken Breast', 'Marry Me Chicken Tortellini'], 'alphabetical');
  assert.ok(msr.querySelectorAll('.rm').some(function (n) { return n.textContent.indexOf('Never made') >= 0 && n.textContent.indexOf('12 min') >= 0; }), 'time and last made shown');
  assert.ok(msr.querySelectorAll('.dm')[0].textContent.indexOf('Honey Garlic Chicken') >= 0, 'planned dinner shown on its day');
  assert.ok(msr.querySelectorAll('.dcell')[2].className.indexOf('sel') >= 0, 'first empty day is selected');

  msr.querySelectorAll('.rcp')[2].click();
  var plan = msr.querySelector('.mdo');
  assert.ok(plan && plan.textContent.indexOf('Plan for') === 0, 'open recipe offers a plan button');
  var selDay = msr.querySelector('.dsel').querySelector('.dh').textContent;
  assert.ok(plan.textContent.indexOf(selDay) >= 0, 'button names the selected day');
  plan.click();
  await wait(40);
  var sm = calls.filter(function (c) { return c.service === 'set_mealplan'; });
  assert.strictEqual(sm.length, 1);
  assert.strictEqual(sm[0].service_data.recipe_id, 'r3');
  assert.strictEqual(sm[0].service_data.entry_type, 'dinner');
  assert.strictEqual(sm[0].service_data.config_entry_id, 'mealie1');
  assert.strictEqual(msr.querySelector('.toast').style.display, 'flex', 'planned toast');

  var search = msr.querySelector('.rsearch');
  search.value = 'lasa';
  search.dispatchEvent({ type: 'input' });
  assert.strictEqual(msr.querySelectorAll('.rcp').length, 1, 'search narrows the list');
  search.value = '';
  search.dispatchEvent({ type: 'input' });
  find(msr.querySelectorAll('.chip'), 'Pasta').click();
  assert.strictEqual(msr.querySelectorAll('.rcp').length, 2, 'tag filter');
  find(msr.querySelectorAll('.chip'), 'All').click();

  msr.querySelectorAll('.dcell')[0].click();
  msr.querySelector('.dsel').querySelector('.act').click();
  await wait(40);
  var dm = calls.filter(function (c) { return c.service === 'delete_mealplan'; });
  assert.strictEqual(dm.length, 1);
  assert.strictEqual(dm[dm.length - 1].service_data.mealplan_id, '7', 'numeric mealplan ids are sent as text');
  assert.strictEqual(dm[dm.length - 1].return_response, false, 'delete is sent without return_response');
  assert.ok(!msr.querySelector('.merr'), 'no error shown after a successful delete');
  msr.querySelector('.mrand').click();
  await wait(40);
  assert.ok(calls.some(function (c) { return c.service === 'set_random_mealplan' && c.service_data.entry_type === 'dinner'; }), 'surprise me');
  msr.querySelector('.mgro').click();
  assert.deepStrictEqual(pushed, ['/newui-4-0/grocery'], 'build grocery list navigates');

  /* Plan meals button on the grocery page */
  var pcard = new Card();
  pcard.setConfig({ mode: 'grocery', plan_path: '/newui-4-0/meals' });
  pcard.hass = hass;
  await wait(60);
  assert.ok(pcard.shadowRoot.querySelector('.mplan'), 'plan button shows even with the import panel collapsed');
  assert.ok(pcard.shadowRoot.querySelector('.mplan').className.indexOf('orange') >= 0, 'orange');
  pcard.shadowRoot.querySelector('.mph').click();
  assert.ok(pcard.shadowRoot.querySelector('.mplan'), 'still there when the panel is open');
  pcard.shadowRoot.querySelector('.mplan').click();
  assert.strictEqual(pushed[1], '/newui-4-0/meals', 'plan meals navigates');

  /* P1 flag */
  var pcard1 = new Card();
  pcard1.setConfig({ mode: 'tasks' });
  pcard1.hass = hass;
  await wait(40);
  var psr = pcard1.shadowRoot;
  var pbar = function () { return psr.querySelectorAll('.pfl').filter(function (n) { return n.className.indexOf(' bar') >= 0; })[0]; };
  var hotRows = psr.querySelectorAll('.row').filter(function (n) { return n.className.indexOf(' hot') >= 0; });
  assert.strictEqual(hotRows.length, 1, 'P1 task pops');
  assert.ok(hotRows[0].querySelector('.pfl'), 'row has a flag button');
  assert.ok(pbar(), 'add bar has a P1 toggle');
  var padd = calls.filter(function (c) { return c.service === 'add_item'; }).length;
  psr.querySelector('.add').value = '!Call the vet';
  psr.querySelector('.add').dispatchEvent({ type: 'keydown', key: 'Enter' });
  await wait(30);
  var pnew = calls.filter(function (c) { return c.service === 'add_item'; });
  assert.strictEqual(pnew.length, padd + 1);
  assert.strictEqual(pnew[pnew.length - 1].service_data.item, '[P1] Call the vet', '! prefix makes it P1');
  pbar().click();
  psr.querySelector('.add').value = 'Pay the bill';
  psr.querySelector('.add').dispatchEvent({ type: 'keydown', key: 'Enter' });
  await wait(30);
  pnew = calls.filter(function (c) { return c.service === 'add_item'; });
  assert.strictEqual(pnew[pnew.length - 1].service_data.item, '[P1] Pay the bill', 'toggle makes it P1');
  hotRows[0].querySelector('.pfl').click();
  await wait(30);
  assert.ok(calls.some(function (c) { return c.service === 'update_item' && c.service_data.rename === 'Fix back gate'; }), 'flag button removes P1');

  /* Task notes + glance tile */
  var ncard = new Card();
  ncard.setConfig({ mode: 'tasks' });
  ncard.hass = hass;
  await wait(40);
  var nsr = ncard.shadowRoot;
  var nrow = nsr.querySelectorAll('.row').filter(function (n) { return n.textContent.indexOf('Fix back gate') >= 0; })[0];
  nrow.click();
  await wait(10);
  var nta = nsr.querySelector('.nta');
  assert.ok(nta, 'note box in the editor');
  nta.value = 'Hinge is bent. Check the latch too.';
  nta.dispatchEvent({ type: 'input' });
  var nsave = nsr.querySelectorAll('.act').filter(function (n) { return n.textContent.indexOf('Save') >= 0; })[0];
  nsave.click();
  await wait(30);
  var nup = calls.filter(function (c) { return c.service === 'update_item' && c.service_data.description; });
  assert.strictEqual(nup[nup.length - 1].service_data.description, 'Hinge is bent. Check the latch too.', 'note saved as description');
  assert.ok(nsr.querySelector('.nt') && nsr.querySelector('.nt').textContent.indexOf('Hinge is bent') >= 0, 'row previews the note');

  var gl = new Card();
  gl.setConfig({ mode: 'glance', tasks_path: '/lineage/tasks' });
  gl.hass = hass;
  await wait(50);
  var glr = gl.shadowRoot;
  assert.ok(glr.querySelector('.glance'), 'glance tile renders');
  assert.ok(glr.querySelector('.thd').textContent.indexOf('task') >= 0, 'glance count');
  assert.ok(glr.querySelectorAll('.gl-row').length >= 1, 'top tasks listed');
  var gnp = pushed.length;
  glr.querySelector('.glance').click();
  assert.strictEqual(pushed[gnp], '/lineage/tasks', 'glance opens tasks page');

  /* Tonight tile + recipe view */
  var tcard = new Card();
  tcard.setConfig({ mode: 'dinner', recipe_path: '/lineage/dinner' });
  tcard.hass = hass;
  await wait(80);
  var tsr = tcard.shadowRoot;
  assert.ok(tsr.querySelector('.tile'), 'tile renders');
  assert.ok(txt(tsr, '.thd').indexOf('Honey Garlic Chicken') >= 0, 'tile shows tonight');
  assert.ok(txt(tsr, '.tsub').indexOf('25 min') >= 0, 'tile shows cook time');
  assert.strictEqual(tsr.querySelectorAll('.tday').length, 7, 'week strip');
  assert.strictEqual(tsr.querySelectorAll('.tday').filter(function (n) { return n.className.indexOf(' on') >= 0; }).length, 2, 'two planned days lit');
  var np = pushed.length;
  tsr.querySelector('.tile').click();
  assert.strictEqual(pushed[np], '/lineage/dinner', 'tile opens recipe page');
  tsr.querySelectorAll('.tday')[1].click();
  assert.ok(/^\/lineage\/dinner\?d=\d{4}-\d{2}-\d{2}$/.test(pushed[np + 1]), 'day dot opens that day');

  var rcard = new Card();
  rcard.setConfig({ mode: 'recipe', plan_path: '/lineage/meals', grocery_path: '/lineage/grocery' });
  rcard.hass = hass;
  await wait(100);
  var rsr = rcard.shadowRoot;
  assert.strictEqual(rsr.querySelectorAll('.dcell').length, 7, 'week picker');
  assert.ok(txt(rsr, '.rv-t').indexOf('Honey Garlic Chicken') >= 0, 'recipe title');
  assert.ok(txt(rsr, '.body').indexOf('2 cloves garlic') >= 0 || txt(rsr, '.body').indexOf('garlic') >= 0, 'ingredients');
  assert.ok(txt(rsr, '.body').indexOf('Sear the chicken.') >= 0, 'steps');
  rsr.querySelectorAll('.dcell')[1].click();
  await wait(40);
  assert.ok(txt(rsr, '.body').indexOf('No recipe attached') >= 0 || txt(rsr, '.body').indexOf('Takeout night') >= 0, 'recipe-less entry handled');
  assert.ok(!rsr.querySelector('.mgro'), 'no grocery button without a recipe');
  rsr.querySelectorAll('.dcell')[0].click();
  await wait(40);
  assert.ok(rsr.querySelector('.mgro'), 'grocery button');
  rsr.querySelectorAll('.dcell')[3].click();
  await wait(20);
  assert.ok(rsr.querySelector('.orange'), 'empty night offers planning');

  /* Date words + repeating tasks */
  var dcard = new Card();
  dcard.setConfig({ mode: 'tasks' });
  dcard.hass = hass;
  await wait(40);
  var dsr = dcard.shadowRoot;
  dsr.querySelector('.add').value = 'Water the plants every week';
  dsr.querySelector('.add').dispatchEvent({ type: 'input' });
  assert.ok(dsr.querySelector('.dpv') && dsr.querySelector('.dpv').style.display === 'flex', 'date preview shows');
  dsr.querySelector('.add').dispatchEvent({ type: 'keydown', key: 'Enter' });
  await wait(30);
  var dadd = calls.filter(function (c) { return c.service === 'add_item'; });
  assert.strictEqual(dadd[dadd.length - 1].service_data.item, '[R:1w] Water the plants', 'repeat becomes a tag, words stripped');
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(dadd[dadd.length - 1].service_data.due_date || ''), 'repeat sets a due date');
  dsr.querySelector('.add').value = 'Call the vet tomorrow';
  dsr.querySelector('.add').dispatchEvent({ type: 'keydown', key: 'Enter' });
  await wait(30);
  dadd = calls.filter(function (c) { return c.service === 'add_item'; });
  assert.strictEqual(dadd[dadd.length - 1].service_data.item, 'Call the vet');
  assert.ok(dadd[dadd.length - 1].service_data.due_date, 'tomorrow sets a due date');

  items['todo.randy_to_do'].push({ uid: 'rep1', summary: '[R:1w] Trash out', status: 'needs_action', due: '2026-11-03' });
  var rcard2 = new Card();
  rcard2.setConfig({ mode: 'tasks' });
  rcard2.hass = hass;
  await wait(40);
  var rr = rcard2.shadowRoot.querySelectorAll('.row').filter(function (n) { return n.textContent.indexOf('Trash out') >= 0; })[0];
  assert.ok(rr && rr.querySelector('.rpt'), 'repeat badge on the row');
  var before2 = calls.filter(function (c) { return c.service === 'add_item'; }).length;
  rr.querySelector('.chk').click();
  await wait(40);
  var after2 = calls.filter(function (c) { return c.service === 'add_item'; });
  assert.strictEqual(after2.length, before2 + 1, 'finishing a repeating task adds the next one');
  assert.strictEqual(after2[after2.length - 1].service_data.item, '[R:1w] Trash out');
  assert.ok(after2[after2.length - 1].service_data.due_date > '2026-11-03', 'next due is later');
  items['todo.randy_to_do'] = items['todo.randy_to_do'].filter(function (i) { return i.uid !== 'rep1'; });

  /* takeout flag */
  msr.querySelector('.mtake').click();
  await wait(40);
  assert.ok(calls.some(function (c) { return c.service === 'set_mealplan' && c.service_data.note_title === 'Takeout'; }), 'takeout saved as a note entry');
  msr.querySelector('.mleft').click();
  await wait(40);
  assert.ok(calls.some(function (c) { return c.service === 'set_mealplan' && c.service_data.note_title === 'Leftovers'; }), 'leftovers saved as a note entry');

  console.log('card smoke test passed');
  process.exit(0);
})().catch(function (e) { console.error('FAIL', e); process.exit(1); });
