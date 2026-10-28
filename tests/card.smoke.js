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
var sandbox = {
  document: {
    createElement: function (t) { return new Node(t); },
    createElementNS: function (ns, t) { return new Node(t); },
    createTextNode: mkText
  },
  HTMLElement: function () {},
  customElements: { define: function (n, c) { registry[n] = c; } },
  window: {}, localStorage: { getItem: function () { return null; }, setItem: function () {} },
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
    { uid: 'd', summary: 'Tortillas', status: 'completed' }
  ],
  'todo.randy_to_do': [{ uid: 'r1', summary: '[P1] Fix gate', status: 'needs_action', due: '2026-10-20' }]
};
var calls = [];
var store = { overrides: {}, tok: {}, settings: { cat_order: [] } };
var hass = {
  states: {
    'todo.grocery_list': { state: '3', attributes: { friendly_name: 'Grocery List' } },
    'todo.randy_to_do': { state: '1', attributes: { friendly_name: 'Randy To Do' } },
    'sensor.x': { state: '1', attributes: {} }
  },
  connection: {
    subscribeEvents: function () {},
    sendMessagePromise: function (m) {
      calls.push(m);
      if (m.type === 'todo_flow/get_data') return Promise.resolve(store);
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
function find(list, s) { return list.filter(function (n) { return n.textContent.indexOf(s) >= 0; })[0]; }

(async function () {
  var card = new Card();
  card.setConfig({});
  card.hass = hass;
  await wait(30);
  var sr = card.shadowRoot;

  var chips = sr.querySelectorAll('.chip').map(function (c) { return c.textContent; });
  assert.deepStrictEqual(chips, ['All', 'Grocery3', 'Randy To Do1']);
  assert.ok(txt(sr, '.body').indexOf('Fix gate') >= 0, 'all view shows Randy task');

  find(sr.querySelectorAll('.chip'), 'Grocery').click();
  var hdrs = sr.querySelectorAll('.hname').map(function (c) { return c.textContent; });
  assert.ok(hdrs.indexOf('Dairy & Eggs') >= 0 && hdrs.indexOf('Produce') >= 0 && hdrs.indexOf('Other') >= 0, 'grocery groups: ' + hdrs);
  assert.ok(find(sr.querySelectorAll('.hname'), 'Done (1)'), 'done section');

  /* Costco lean: invisible tag, stripe only */
  var pump = find(sr.querySelectorAll('.row'), 'Pumpkins');
  assert.ok(pump.style.cssText.indexOf('inset 3px 0 0 #60a5fa') >= 0, 'costco stripe');
  assert.ok(txt(sr, '.body').indexOf('Costco') < 0 || sr.querySelectorAll('.tab').length, 'no visible tag text on rows');
  assert.strictEqual(pump.textContent.indexOf('Costco'), -1, 'tag text hidden');

  /* Trip views */
  find(sr.querySelectorAll('.tab'), 'Costco').click();
  var cb = txt(sr, '.body');
  assert.ok(cb.indexOf('Pumpkins') >= 0 && cb.indexOf('Grab it while you are there') > cb.indexOf('Pumpkins'), 'costco run order');
  assert.ok(cb.indexOf('Frigo') > cb.indexOf('Grab it while you are there'), 'any items under grab-it section');
  find(sr.querySelectorAll('.tab'), 'Store').click();
  var sb = txt(sr, '.body');
  assert.ok(sb.indexOf('Could wait for Costco') > sb.indexOf('Frigo') && sb.indexOf('Pumpkins') > sb.indexOf('Could wait for Costco'), 'store run order');
  find(sr.querySelectorAll('.tab'), 'All').click();

  /* Three-state lean from an open row */
  find(sr.querySelectorAll('.row'), 'Frigo').click();
  find(sr.querySelectorAll('.cat'), 'Costco').click();
  var ren = calls.filter(function (c) { return c.service === 'update_item' && c.service_data.rename; });
  assert.strictEqual(ren[ren.length - 1].service_data.rename, '[Costco] Frigo cheese sticks');
  find(sr.querySelectorAll('.row'), 'Frigo').click();
  find(sr.querySelectorAll('.cat'), 'Local').click();
  ren = calls.filter(function (c) { return c.service === 'update_item' && c.service_data.rename; });
  assert.strictEqual(ren[ren.length - 1].service_data.rename, '[Local] Frigo cheese sticks');

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
  sr.querySelector('.snd').click();
  await wait(20);
  var add = calls.filter(function (c) { return c.service === 'add_item'; });
  assert.strictEqual(add[0].service_data.item, '[Costco] Kind bars');
  assert.strictEqual(sr.querySelector('.tog').textContent, 'Any store', 'lean resets after add');
  assert.ok(calls.filter(function (c) { return c.type === 'todo_flow/learn'; }).length === 2, 'pick taught');

  sr.querySelectorAll('.ib')[1].click();
  assert.ok(txt(sr, '.body').indexOf('Aisle order') >= 0 && txt(sr, '.body').indexOf('shout') >= 0, 'settings view');
  sr.querySelectorAll('.ib')[1].click();

  find(sr.querySelectorAll('.chip'), 'Randy').click();
  assert.ok(txt(sr, '.body').indexOf('Fix gate') >= 0 && txt(sr, '.body').indexOf('Oct 20') >= 0, 'list view with overdue date');

  console.log('card smoke test passed');
  process.exit(0);
})().catch(function (e) { console.error('FAIL', e); process.exit(1); });
