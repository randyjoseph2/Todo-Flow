/* Todo Flow card - beta. No template literals, no emoji, SVG icons only (HA mobile WebView). */
var TF = TodoFlowEngine;
var TF_VERSION = '0.2.0-beta';
var LEAN_LABEL = { any: 'Any store', costco: 'Costco', local: 'Local' };
var LEAN_COLOR = { any: '#4ade80', costco: '#60a5fa', local: '#cbd5e1' };
var LEAN_STRIPE = { any: '', costco: 'box-shadow:inset 3px 0 0 #60a5fa;', local: 'box-shadow:inset 3px 0 0 rgba(255,255,255,0.22);' };
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
  '.tabs{display:flex;gap:6px;padding:4px 4px 6px}',
  '.tab{padding:5px 13px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.4);font-size:12px;font-weight:600;cursor:pointer}',
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
  '.bar{display:flex;align-items:center;gap:8px;padding:8px 10px;border-top:0.5px solid rgba(255,255,255,0.07);flex-shrink:0}',
  '.add{flex:1;min-width:0;background:transparent;border:none;border-bottom:1.5px solid rgba(255,255,255,0.2);padding:6px 4px;color:#fff;font-size:15px;outline:none;-webkit-appearance:none}',
  '.add::placeholder{color:rgba(255,255,255,0.22)}',
  '.pv{padding:4px 10px;border-radius:14px;border:1px solid;background:transparent;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0}',
  '.tog{padding:5px 10px;border-radius:16px;border:1px solid rgba(255,255,255,0.12);background:transparent;color:rgba(255,255,255,0.3);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap}',
  '.tog.on{background:rgba(0,80,200,0.2);color:#93c5fd;border-color:rgba(147,197,253,0.3)}',
  '.tog.loc{color:#e2e8f0;border-color:rgba(255,255,255,0.35)}',
  '.toast{position:absolute;left:12px;right:12px;bottom:68px;display:none;align-items:center;gap:10px;padding:10px 14px;border-radius:14px;background:rgba(30,30,46,0.97);border:0.5px solid rgba(255,255,255,0.14);font-size:13px;color:#fff;z-index:50}',
  '.toast button{margin-left:auto;background:none;border:none;color:#4ade80;font-weight:700;font-size:13px;cursor:pointer;padding:4px 8px}',
  '.snd{width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
  '.snd:active{transform:scale(0.88)}',
  '.chooser{display:flex;flex-wrap:wrap;gap:5px;padding:8px 12px 0;flex-shrink:0}',
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
    this._cfg = Object.assign({ grocery_entity: 'todo.grocery_list', title: 'Todo Flow', entities: [], exclude: [], colors: {} }, c || {});
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

  _discover() {
    var self = this, st = this._hass.states;
    var ids = (this._cfg.entities && this._cfg.entities.length) ? this._cfg.entities.slice() :
      Object.keys(st).filter(function (k) { return k.indexOf('todo.') === 0; });
    ids = ids.filter(function (id) { return self._cfg.exclude.indexOf(id) < 0 && st[id]; });
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
    p.text = text;
    var nm = TF.build(p), os = it.summary, od = it.due;
    it.summary = nm;
    it.due = due || undefined;
    this._edit = null; this._open = null;
    this._renderBody();
    this._svc(lid, 'update_item', { item: uid, rename: nm, due_date: due || null }).catch(function () {
      it.summary = os; it.due = od;
      self._renderBody();
    });
  }

  _retag(lid, uid, field) {
    var self = this, it = this._find(lid, uid);
    if (!it) return;
    var p = TF.parse(it.summary);
    p[field] = !p[field];
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
    var p = { text: t, costco: false, local: false, p1: false };
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
    root.appendChild(el('ha-card', null, [top, this._elChips, this._elBody, this._elBar, this._elToast]));
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
    this._elSub.textContent = total + ' open item' + (total !== 1 ? 's' : '') + ' across ' + this._lists.length + ' list' + (this._lists.length !== 1 ? 's' : '');
  }

  _renderChips() {
    var self = this;
    this._elChips.textContent = '';
    var mk = function (id, name, color, count, dot) {
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
    return el('div', { class: 'row' + (done ? ' dn' : ''), onclick: function () { self._open = it.uid; self._edit = null; self._renderBody(); } }, [
      this._check(l.id, it, done, l.color),
      el('div', { class: 'tb' }, [el('div', { class: 'tx' }, p.text), meta.length ? el('div', { class: 'mt' }, meta) : null])
    ]);
  }

  _taskOpen(l, it, p) {
    var self = this;
    if (this._edit === it.uid) return this._editRow(l, it, p);
    return el('div', { class: 'row open' }, [
      el('div', { class: 'rmain' }, [this._check(l.id, it, it.status === 'completed', l.color), el('div', { class: 'tx' }, p.text)]),
      el('div', { class: 'acts' }, [
        el('button', { class: 'act good', onclick: function () { self._toggle(l.id, it.uid); } }, [icon(IC.check, 13, '#4ade80'), it.status === 'completed' ? 'Reopen' : 'Done']),
        el('button', { class: 'act', onclick: function () { self._edit = it.uid; self._renderBody(); } }, [icon(IC.edit, 12), 'Edit']),
        el('button', { class: 'act' + (p.p1 ? ' on' : ''), onclick: function () { self._retag(l.id, it.uid, 'p1'); } }, 'P1'),
        el('button', { class: 'act bad', onclick: function () { self._remove(l.id, it.uid); } }, icon(IC.trash, 14, '#f87171')),
        el('button', { class: 'act', style: 'border-color:transparent;padding:5px', onclick: function () { self._open = null; self._renderBody(); } }, icon(IC.close, 12))
      ])
    ]);
  }

  _editRow(l, it, p) {
    var self = this;
    var inp = el('input', { class: 'inp', value: p.text, placeholder: 'Item name' });
    var dt = el('input', { class: 'date', type: 'date', value: it.due ? String(it.due).slice(0, 10) : '' });
    var save = function () { self._saveEdit(l.id, it.uid, inp.value, dt.value); };
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); save(); }
      if (e.key === 'Escape') { self._edit = null; self._renderBody(); }
    });
    setTimeout(function () { inp.focus(); }, 30);
    return el('div', { class: 'row open' }, [
      el('div', { class: 'edit' }, [inp, dt]),
      el('div', { class: 'acts' }, [
        el('button', { class: 'act good', onclick: save }, [icon(IC.check, 13, '#4ade80'), 'Save']),
        el('button', { class: 'act', onclick: function () { self._edit = null; self._renderBody(); } }, 'Cancel')
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
      return el('div', { class: 'row' + (done ? ' dn' : ''), style: stripe, onclick: function () { self._open = it.uid; self._edit = null; self._renderBody(); } }, [
        this._check(l.id, it, done, cat.c),
        el('div', { class: 'tb' }, el('div', { class: 'tx' }, p.text))
      ]);
    }
    if (this._edit === it.uid) return this._editRow(l, it, p);
    var current = TF.classify(this._data, it.summary);
    var chips = TF.orderedCats(this._data.settings.cat_order).map(function (c) {
      var on = c.k === current.key;
      return el('button', {
        class: 'cat',
        style: 'color:' + c.c + ';border-color:' + (on ? c.c : 'rgba(255,255,255,0.12)') + ';background:' + (on ? c.c + '26' : 'transparent'),
        onclick: function () { self._teach(it.summary, c.k); self._open = null; self._renderBody(); }
      }, c.l);
    });
    var cur = TF.lean(p);
    var leans = ['any', 'costco', 'local'].map(function (k) {
      var on = k === cur, col = LEAN_COLOR[k];
      return el('button', {
        class: 'cat',
        style: 'color:' + col + ';border-color:' + (on ? col : 'rgba(255,255,255,0.12)') + ';background:' + (on ? col + '26' : 'transparent'),
        onclick: function () { self._setLean(l.id, it.uid, k); }
      }, LEAN_LABEL[k]);
    });
    return el('div', { class: 'row open', style: LEAN_STRIPE[cur] }, [
      el('div', { class: 'rmain' }, [this._check(l.id, it, done, cat.c), el('div', { class: 'tx' }, p.text)]),
      el('div', { class: 'lbl' }, current.src === 'learned' ? 'Category (learned)' : 'Category - tap to teach'),
      el('div', { class: 'cats' }, chips),
      el('div', { class: 'lbl' }, 'Where to buy'),
      el('div', { class: 'cats' }, leans),
      el('div', { class: 'acts' }, [
        el('button', { class: 'act', onclick: function () { self._edit = it.uid; self._renderBody(); } }, [icon(IC.edit, 12), 'Edit']),
        el('button', { class: 'act bad', onclick: function () { self._remove(l.id, it.uid); } }, icon(IC.trash, 14, '#f87171')),
        el('button', { class: 'act', style: 'border-color:transparent;padding:5px', onclick: function () { self._open = null; self._renderBody(); } }, icon(IC.close, 12))
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
    [['all', 'All'], ['store', 'Store'], ['costco', 'Costco']].forEach(function (t) {
      var on = self._gview === t[0], col = t[0] === 'costco' ? '#93c5fd' : '#4ade80';
      tabs.appendChild(el('button', {
        class: 'tab',
        style: on ? 'background:' + col + '26;color:' + col + ';border-color:' + col + '55' : '',
        onclick: function () { self._gview = t[0]; self._open = null; self._renderBody(); }
      }, t[1]));
    });
    b.appendChild(tabs);

    var all = this._items[l.id] || [];
    var active = all.filter(function (i) { return i.status === 'needs_action'; });
    var done = all.filter(function (i) { return i.status === 'completed'; });
    var leanOf = function (i) { return TF.lean(TF.parse(i.summary)); };
    var shown = 0;
    if (this._gview === 'costco') {
      shown += this._groceryGroups(b, l, active.filter(function (i) { return leanOf(i) === 'costco'; }), false);
      var anyItems = active.filter(function (i) { return leanOf(i) === 'any'; });
      if (anyItems.length) {
        b.appendChild(el('div', { class: 'sec' }, 'Grab it while you are there (' + anyItems.length + ')'));
        shown += this._groceryGroups(b, l, anyItems, false);
      }
    } else if (this._gview === 'store') {
      shown += this._groceryGroups(b, l, active.filter(function (i) { return leanOf(i) !== 'costco'; }), false);
      var later = active.filter(function (i) { return leanOf(i) === 'costco'; });
      if (later.length) {
        b.appendChild(el('div', { class: 'sec' }, 'Could wait for Costco (' + later.length + ')'));
        shown += this._groceryGroups(b, l, later, true);
      }
    } else {
      shown += this._groceryGroups(b, l, active, false);
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
    if (this._settings || this._active === 'all' || !this._list(this._active)) return;
    var lid = this._active, l = this._list(lid), grocery = l.grocery;
    var input = el('input', { class: 'add', placeholder: grocery ? 'Add grocery item...' : 'Add to ' + l.name + '...', style: 'border-bottom-color:' + l.color + '55' });
    var preview = el('button', { class: 'pv', style: 'display:none' });
    var chooser = el('div', { class: 'chooser', style: 'display:none' });
    var leanBtn = el('button', { class: 'tog', onclick: function () {
      var order = ['any', 'costco', 'local'];
      self._lean = order[(order.indexOf(self._lean) + 1) % order.length];
      paintLean();
    } });
    var paintLean = function () {
      leanBtn.className = 'tog' + (self._lean === 'costco' ? ' on' : (self._lean === 'local' ? ' loc' : ''));
      leanBtn.textContent = LEAN_LABEL[self._lean];
    };
    paintLean();
    var send = el('button', { class: 'snd', style: 'background:' + l.color, onclick: function () { go(); } }, icon(IC.send, 16, '#0a0a14'));

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
      self._lean = 'any';
      paintLean();
    };
    preview.addEventListener('click', function () { self._chooser = !self._chooser; paintChooser(); });
    input.addEventListener('input', function () { if (!input.value.trim()) self._pick = null; paintPreview(); paintChooser(); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });

    bar.appendChild(chooser);
    bar.appendChild(el('div', { class: 'bar' }, [input, preview, grocery ? leanBtn : null, send]));
  }
}

customElements.define('todo-flow-card', TodoFlowCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'todo-flow-card',
  name: 'Todo Flow',
  description: 'Any todo list plus a grocery area that learns your categories.'
});
