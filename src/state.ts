import { getByPath } from "@json-render/core";
import type { SetState, StateModel, StateStore } from "@json-render/react";
import type { MCPAppActionHandlers, ResolvedActionHandlers, StateAdapter } from "./types";

const escapeJsonPointerToken = (token: string) => token.replace(/~/g, "~0").replace(/\//g, "~1");

function toTopLevelUpdates(previous: StateModel, next: StateModel): Record<string, unknown> {
  const previousKeys = new Set(Object.keys(previous));
  const nextKeys = new Set(Object.keys(next));
  const keys =
    typeof previousKeys.union === "function"
      ? previousKeys.union(nextKeys)
      : new Set([...previousKeys, ...nextKeys]);
  const updates: Record<string, unknown> = {};

  for (const key of keys) {
    if (previous[key] !== next[key]) {
      updates[`/${escapeJsonPointerToken(key)}`] = next[key];
    }
  }

  return updates;
}

export function stateAdapterToStore(adapter: StateAdapter | StateStore): StateStore {
  const maybeStore = adapter as Partial<StateStore>;

  if (
    typeof maybeStore.get === "function" &&
    typeof maybeStore.set === "function" &&
    typeof maybeStore.update === "function"
  ) {
    return adapter as StateStore;
  }

  return {
    get(path) {
      return getByPath(adapter.getSnapshot(), path);
    },
    set() {},
    update() {},
    getSnapshot() {
      return adapter.getSnapshot();
    },
    getServerSnapshot() {
      return adapter.getServerSnapshot?.() ?? adapter.getSnapshot();
    },
    subscribe(listener) {
      return adapter.subscribe(listener);
    },
  };
}

export function createSetState(store: StateStore): SetState {
  return (updater) => {
    const previous = store.getSnapshot();
    const next = updater(previous);
    store.update(toTopLevelUpdates(previous, next));
  };
}

export function resolveActionHandlers(
  handlers: MCPAppActionHandlers | undefined,
  getSetState: () => SetState | undefined,
  getState: () => StateModel,
): ResolvedActionHandlers | undefined {
  if (!handlers) {
    return undefined;
  }

  if (typeof handlers === "function") {
    return handlers(getSetState, getState);
  }

  return handlers;
}
