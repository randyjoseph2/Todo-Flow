#!/usr/bin/env python3
"""Concatenate src/engine.js + src/card.js into the file the integration serves."""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
engine = (root / "src" / "engine.js").read_text()
card = (root / "src" / "card.js").read_text()
out = root / "custom_components" / "todo_flow" / "www" / "todo-flow.js"
out.write_text("/* Todo Flow - built file, edit src/ and run scripts/build.py */\n" + engine + "\n" + card)
print("wrote %s (%d bytes)" % (out.relative_to(root), out.stat().st_size))
