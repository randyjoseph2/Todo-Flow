# Todo Flow (beta)

One card for every Home Assistant todo list, with a built-in grocery area that
learns how your household sorts its list.

- Works with **any `todo.*` entity** (Todoist, Local To-do, Shopping List, ...), auto-discovered
- Dark glassmorphism styling that matches the NewUI 4.0 todo cards
- `[P1]` and `[Costco]` summary tags are understood, so existing lists keep working
- Grocery area: category groups in aisle order, Store / Costco tabs, live category preview
- **Learns**: tap an item and pick its category once, and it stays; related words follow
- Learning is stored in Home Assistant and shared across phone, tablet and kitchen display

> Status: **0.1.0 beta**. See [docs/DESIGN.md](docs/DESIGN.md) for how it works and the roadmap.

## Install (HACS)

1. HACS > Integrations > three dots > **Custom repositories**
2. Add `https://github.com/randyjoseph2/Todo-Flow`, category **Integration**
3. Download **Todo Flow**, restart Home Assistant
4. Settings > Devices & services > **Add integration** > Todo Flow
5. Hard-refresh the dashboard (the card JS is registered automatically; no resource to add)

## Use

```yaml
type: custom:todo-flow-card
```

Optional:

```yaml
type: custom:todo-flow-card
title: Todo Flow
grocery_entity: todo.grocery_list   # default
entities: []                        # empty = every todo.* entity
exclude:
  - todo.reminders
colors:
  todo.sam: "#f472b6"
```

On NewUI 4.0, replace the `custom:cox-todoist-card` and `custom:cox-grocery-card`
on the Tasks view with this single card.

## Teaching the grocery list

- Tap an item, pick the right category chip. Done.
- Or type an item and tap the category preview in the add bar before sending.
- Settings (gear) shows everything learned, lets you forget single items, reorder
  aisles, or reset learning. Lists themselves are never touched by reset.

## Develop

```
npm test          # engine unit tests + card smoke test (no dependencies)
npm run build     # src/engine.js + src/card.js -> custom_components/todo_flow/www/todo-flow.js
```

Edit `src/`, rebuild, and commit the built file. Constraints for HA mobile WebView:
no template literals, no emoji (inline SVG only), bare `customElements.define`.
