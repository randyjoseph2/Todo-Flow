"""Todo Flow - todo lists plus a grocery area that learns your categories.

The integration does three things: serves the Lovelace card, persists what the
household has taught the grocery categorizer, and exposes that over websocket
so every device shares it.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components import frontend, websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    CARD_URL,
    DOMAIN,
    EVENT_UPDATED,
    STORAGE_KEY,
    STORAGE_VERSION,
    VERSION,
)

_LOGGER = logging.getLogger(__name__)


def _empty() -> dict[str, Any]:
    return {"overrides": {}, "tok": {}, "settings": {"cat_order": []}}


class TodoFlowStore:
    """Learned grocery data + settings, persisted in .storage."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self.data: dict[str, Any] = _empty()

    async def async_load(self) -> None:
        loaded = await self._store.async_load()
        if isinstance(loaded, dict):
            base = _empty()
            base.update({k: loaded[k] for k in base if k in loaded})
            self.data = base

    def _save(self) -> None:
        self._store.async_delay_save(lambda: self.data, 1)
        self.hass.bus.async_fire(EVENT_UPDATED)

    def _bump(self, feats: list[str], cat: str, delta: int) -> None:
        tok = self.data["tok"]
        for f in feats:
            entry = tok.setdefault(f, {})
            n = entry.get(cat, 0) + delta
            if n <= 0:
                entry.pop(cat, None)
                if not entry:
                    tok.pop(f, None)
            else:
                entry[cat] = n

    def learn(self, norm: str, feats: list[str], cat: str) -> None:
        old = self.data["overrides"].get(norm)
        if old and old != cat:
            self._bump(feats, old, -1)
        self.data["overrides"][norm] = cat
        if old != cat:
            self._bump(feats, cat, 1)
        self._save()

    def forget(self, norm: str, feats: list[str]) -> None:
        old = self.data["overrides"].pop(norm, None)
        if old:
            self._bump(feats, old, -1)
            self._save()

    def set_settings(self, settings: dict[str, Any]) -> None:
        order = settings.get("cat_order", [])
        if isinstance(order, list):
            self.data["settings"]["cat_order"] = [str(k) for k in order][:32]
            self._save()

    def reset_learning(self) -> None:
        self.data["overrides"] = {}
        self.data["tok"] = {}
        self._save()


def _store(hass: HomeAssistant) -> TodoFlowStore:
    return hass.data[DOMAIN]


@websocket_api.websocket_command({vol.Required("type"): "todo_flow/get_data"})
@websocket_api.async_response
async def ws_get_data(hass: HomeAssistant, connection, msg) -> None:
    connection.send_result(msg["id"], _store(hass).data)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "todo_flow/learn",
        vol.Required("norm"): vol.All(str, vol.Length(min=1, max=120)),
        vol.Required("tokens"): [vol.All(str, vol.Length(max=120))],
        vol.Required("category"): vol.All(str, vol.Length(min=1, max=32)),
    }
)
@websocket_api.async_response
async def ws_learn(hass: HomeAssistant, connection, msg) -> None:
    _store(hass).learn(msg["norm"], msg["tokens"][:32], msg["category"])
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "todo_flow/forget",
        vol.Required("norm"): vol.All(str, vol.Length(min=1, max=120)),
        vol.Required("tokens"): [vol.All(str, vol.Length(max=120))],
    }
)
@websocket_api.async_response
async def ws_forget(hass: HomeAssistant, connection, msg) -> None:
    _store(hass).forget(msg["norm"], msg["tokens"][:32])
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "todo_flow/set_settings",
        vol.Required("settings"): dict,
    }
)
@websocket_api.async_response
async def ws_set_settings(hass: HomeAssistant, connection, msg) -> None:
    _store(hass).set_settings(msg["settings"])
    connection.send_result(msg["id"])


@websocket_api.websocket_command({vol.Required("type"): "todo_flow/reset_learning"})
@websocket_api.async_response
async def ws_reset(hass: HomeAssistant, connection, msg) -> None:
    _store(hass).reset_learning()
    connection.send_result(msg["id"])


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    store = TodoFlowStore(hass)
    await store.async_load()
    hass.data[DOMAIN] = store

    www = Path(__file__).parent / "www" / "todo-flow.js"
    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL, str(www), cache_headers=False)]
    )
    frontend.add_extra_js_url(hass, f"{CARD_URL}?v={VERSION}")

    for cmd in (ws_get_data, ws_learn, ws_forget, ws_set_settings, ws_reset):
        websocket_api.async_register_command(hass, cmd)

    _LOGGER.info("Todo Flow %s loaded", VERSION)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    hass.data.pop(DOMAIN, None)
    return True
