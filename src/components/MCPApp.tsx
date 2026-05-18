import {
  JSONUIProvider,
  Renderer,
  createStateStore,
} from "@json-render/react";
import { useCallback, useMemo, useRef } from "react";
import { useMCPHostRuntime } from "../context";
import { defaultWebRegistry } from "../default-web-registry";
import { createSetState, resolveActionHandlers, stateAdapterToStore } from "../state";
import { useNativeMCPApp } from "../use-native-mcp-app";
import type { MCPAppProps, MCPAppRuntime, StateStore } from "../types";
import { DefaultError, DefaultLoading } from "./fallbacks";

function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

function RuntimeMCPApp({
  directives,
  error: renderError,
  fallback,
  functions,
  handlers,
  loading: loadingView,
  registry,
  runtime,
  state,
  validationFunctions,
}: MCPAppProps & { runtime: MCPAppRuntime }) {
  const resolvedRegistry = registry ?? runtime.registry ?? defaultWebRegistry;
  const activeError = runtime.error;

  const controlledStore = useMemo(
    () => (state ? stateAdapterToStore(state) : null),
    [state],
  );
  const localStore = useMemo(
    () => createStateStore(runtime.spec?.state ?? {}),
    [runtime.spec],
  );
  const store: StateStore = controlledStore ?? localStore;
  const storeRef = useLatestRef(store);

  const setState = useCallback(
    () => createSetState(storeRef.current),
    [storeRef],
  );

  const actionHandlers = useMemo(
    () =>
      resolveActionHandlers(
        handlers,
        setState,
        () => storeRef.current.getSnapshot(),
      ),
    [handlers, setState, storeRef],
  );
  const providerOptions = {
    ...(actionHandlers ? { handlers: actionHandlers } : {}),
    ...(directives ? { directives } : {}),
    ...(functions ? { functions } : {}),
    ...(validationFunctions ? { validationFunctions } : {}),
  };
  const rendererOptions = {
    ...(fallback ? { fallback } : {}),
  };

  if (activeError) {
    return <>{renderError ? renderError(activeError) : <DefaultError error={activeError} />}</>;
  }

  if (!runtime.spec) {
    return <>{loadingView ?? <DefaultLoading />}</>;
  }

  return (
    <JSONUIProvider
      registry={resolvedRegistry}
      store={store}
      {...providerOptions}
    >
      <Renderer
        loading={runtime.loading}
        registry={resolvedRegistry}
        spec={runtime.spec}
        {...rendererOptions}
      />
    </JSONUIProvider>
  );
}

function NativeMCPApp(props: MCPAppProps) {
  const runtime = useNativeMCPApp({
    name: props.name,
    version: props.version,
  });

  return <RuntimeMCPApp {...props} runtime={runtime} />;
}

export function MCPApp(props: MCPAppProps) {
  const hostRuntime = useMCPHostRuntime();

  if (hostRuntime) {
    return <RuntimeMCPApp {...props} runtime={hostRuntime} />;
  }

  return <NativeMCPApp {...props} />;
}
