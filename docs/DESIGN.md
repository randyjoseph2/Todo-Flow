# Todo Flow - Design (beta 0.3)

Todo Flow is a Home Assistant custom integration plus a single Lovelace card
(`custom:todo-flow-card`) that sits on top of **any `todo.*` entity**. It
replaces the separate Tasks / Grocery cards in NewUI 4.0 and Tablet 4.0 with one
app-like surface, and adds a grocery area that learns how the household sorts
its list.

## Goals

1. Work with any todo entity (Todoist, Local To-do, Shopping List, Google
   Tasks...). No per-list setup required; lists are auto-discovered.
2. Match the existing NewUI 4.0 todo cardset: dark glassmorphism, rounded 20px
   cards, tap-a-row-to-expand actions, `[P1]` and `[Costco]` summary tags,
   `calc(100vh - 160px)` full-height card.
3. A built-in grocery area with custom categories that gets smarter over time.
4. Learning is shared across every device (phone, tablet, kitchen display).
5. Nothing is written into the todo items themselves except what the user
   already does today (`[Costco]` / `[P1]` prefixes), so the lists stay clean in
   Todoist and everywhere else.

## Non-goals (beta)

- Replacing Todoist/Local To-do as the system of record.
- Cloud or LLM-based categorization. Everything runs locally.
- Recurring tasks, assignments, or notifications (later).

## Architecture

```
custom_components/todo_flow/
  __init__.py      registers card JS, storage, websocket API
  config_flow.py   single-instance "Add integration" flow
  const.py
  www/todo-flow.js built card (src/engine.js + src/card.js)
src/
  engine.js        pure classifier + learning (unit tested in node)
  card.js          Lovelace card (no template literals, SVG icons only)
```

- The integration serves `todo-flow.js` from `/todo_flow/todo-flow.js` and
  registers it with `frontend.add_extra_js_url`, so no dashboard resource is
  needed. Install via HACS (custom repository, type Integration).
- The card talks to todo entities with the standard `todo.get_items`,
  `todo.add_item`, `todo.update_item`, `todo.remove_item` and
  `todo.remove_completed_items` services, so any todo platform works.
- Learned data lives in HA storage (`.storage/todo_flow.data`) and is exposed
  over websocket (`todo_flow/get_data`, `learn`, `forget`, `set_settings`,
  `reset_learning`). Changes fire a `todo_flow_updated` event so every open
  card refreshes. If the integration is missing, the card falls back to
  `localStorage` (this browser only) and says so in Settings.

## Card

Config (all optional):

```yaml
type: custom:todo-flow-card
title: Todo Flow
grocery_entity: todo.grocery_list   # default
entities: []                        # empty = auto-discover every todo.*
exclude: []                         # entity ids to hide
colors:                             # optional per-list color
  todo.sam: "#f472b6"
```

Views (list chips across the top):

- **All** - open items grouped by list, P1 first, then by due date. A compact
  Grocery summary row jumps to the grocery area.
- **Any list** - rows with check, tap-to-expand (Done, Edit, P1, Delete), due
  date badges, add bar.
- **Grocery** - All / Store / Costco tabs, items grouped by category in aisle
  order, Done section with "Clear", add bar with a live category preview.
- **Settings** - aisle order, what Todo Flow has learned (with Forget), reset.

## Grocery categorization

Order of precedence for an item name:

1. **Exact learned override** - the household moved this exact item (after
   normalization) to a category once; it stays there.
2. **Learned word evidence** - words and word pairs from past corrections vote
   for a category. Two or more votes beat the built-in dictionary, so
   corrections generalize ("Shout spray" follows "Shout").
3. **Built-in dictionary** - whole-word, singularized, *longest phrase wins*
   (`peanut butter` is Pantry, not Dairy; `rice` is not Frozen `ice`).
4. **Other** - unknown. Tapping the item and choosing a category teaches it.

Normalization strips `[Costco]`/`[P1]` tags, leading quantities (`2 lb`,
`12 pack`), parentheses, punctuation, and singularizes words, so
`Tortillas`, `tortilla` and `2x Tortillas (flour)` are the same item.

Teaching actions: tap an item, pick a category chip; or pick a category in the
add bar before adding. Both call `learn`. Settings lists every learned item
with a Forget button, and Reset wipes learning only (never the lists).

### Roadmap for "smarter over time"

- v0.2 - purchase history from completed items: suggest "usually bought" items
  and a quick re-add strip.
- v0.3 - learn aisle order from the order items are checked off in-store.
- v0.4 - per-store profiles (Store vs Costco have different layouts).
- v0.5 - optional on-device suggestions from item frequency per time of year.

## Platform constraints honored (from NewUI work)

- No template literals (HA mobile WebView config errors) - string
  concatenation only.
- No emoji in Shadow DOM - inline SVG paths only; list names are stripped of
  non-ASCII.
- Bare `customElements.define`, no guards or try/catch around it.
- Card is a real file served by the integration, not an inline resource, so
  the iOS 24KB inline limit and CSP restrictions do not apply.
- Dates only; no time formatting needed (24-hour rule is respected).

## Store lean (0.2.0)

`[Costco]` / `[Local]` prefixes are the storage format (works in any todo app); the card hides them and
draws a left-edge stripe instead. Costco view = Costco items, then "Grab it while you are there" (Any).
Store view = Local + Any, then dimmed "Could wait for Costco". Undo toast (5s) for check-off and delete.
Next: learned per-item default lean, so the prefix is only written for overrides.

## Beta scope (0.1.0)

In: integration + storage + websocket, card with All / list / grocery views,
learning (add-bar pick, item category chips, forget, reset), aisle ordering,
live sync, localStorage fallback, node unit tests for the engine.

Out: purchase history, per-store profiles, recurring tasks, tablet two-pane
layout (card is single-column; the tablet gets the same card for now).

## Stores, add bar and inline edit (0.3.0)

- Store tags: `[Costco]`, `[Walmart]`, `[Local]` (shown as "Other stores"; the stored tag stays `[Local]` so older lists keep working). No tag = any store.
- Grocery tabs: All / Costco / Walmart / Other stores. A store tab shows that store's items, then "Grab it while you are there" (untagged items), then dimmed "Other stops" for items tagged to a different store. The add bar defaults to the active tab's store.
- The add bar is at the top of the card. In the combined All view a small list button picks which list the new item goes to.
- Tapping a row turns its text into an input right away (Enter saves, Escape closes). Unsaved text survives tapping a store or P1 chip.
