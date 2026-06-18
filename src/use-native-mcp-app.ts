import { useApp } from "@modelcontextprotocol/ext-apps/react";
import { useCallback, useEffect, useState } from "react";
import { toError } from "./errors";
import { extractSpec, extractSpecFromToolResult } from "./spec";
import type { HostContext, MCPAppRuntime, Spec, ToolCaller } from "./types";

const defaultAppName = "mcpapp";
const defaultAppVersion = "0.2.0";

type UseNativeMCPAppOptions = {
  name?: string | undefined;
  version?: string | undefined;
};

export function useNativeMCPApp({
  name = defaultAppName,
  version = defaultAppVersion,
}: UseNativeMCPAppOptions): MCPAppRuntime {
  const [spec, setSpec] = useState<Spec | null>(null);
  const [loading, setLoading] = useState(true);
  const [runtimeError, setRuntimeError] = useState<Error | null>(null);
  const [hostContext, setHostContext] = useState<HostContext | undefined>();

  const onAppCreated = useCallback((app: NonNullable<MCPAppRuntime["app"]>) => {
    app.addEventListener("toolinput", (params) => {
      setLoading(true);
      const nextSpec = extractSpec(params.arguments);
      if (nextSpec) {
        setSpec(nextSpec);
        setLoading(false);
      }
    });

    app.addEventListener("toolinputpartial", (params) => {
      const nextSpec = extractSpec(params.arguments);
      if (nextSpec) {
        setSpec(nextSpec);
      }
    });

    app.addEventListener("toolresult", (params) => {
      const nextSpec = extractSpecFromToolResult(params);
      if (nextSpec) {
        setSpec(nextSpec);
      }
      setLoading(false);
    });

    app.addEventListener("toolcancelled", (params) => {
      setRuntimeError(new Error(params.reason ?? "Tool execution was cancelled"));
      setLoading(false);
    });

    app.addEventListener("hostcontextchanged", (params) => {
      setHostContext((previous) => ({ ...previous, ...params }));
    });
  }, []);

  const { app, error, isConnected } = useApp({
    appInfo: { name, version },
    capabilities: {},
    onAppCreated,
  });

  useEffect(() => {
    if (error) {
      setRuntimeError(error);
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    if (app?.getHostContext()) {
      setHostContext(app.getHostContext());
    }
  }, [app, isConnected]);

  const callServerTool: ToolCaller = useCallback(
    async (toolName, args = {}) => {
      if (!app) {
        return null;
      }

      setLoading(true);
      setRuntimeError(null);

      try {
        const result = await app.callServerTool({
          name: toolName,
          arguments: args,
        });
        const nextSpec = extractSpecFromToolResult(result);
        if (nextSpec) {
          setSpec(nextSpec);
        }
        setRuntimeError(null);
        setLoading(false);
        return nextSpec;
      } catch (value) {
        setRuntimeError(toError(value));
        setLoading(false);
        return null;
      }
    },
    [app],
  );

  return {
    app,
    callServerTool,
    connected: isConnected,
    connecting: !isConnected && !runtimeError,
    error: runtimeError,
    hostCapabilities: app?.getHostCapabilities(),
    hostContext,
    loading,
    registry: undefined,
    spec,
  };
}
