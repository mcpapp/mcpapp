import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { MCPHostRuntimeContext } from "../context";
import { defaultWebRegistry } from "../default-web-registry";
import { toError } from "../errors";
import { extractSpecFromToolResult } from "../spec";
import type { HostCapabilities, MCPAppRuntime, Spec, WebHostProps } from "../types";
import { DefaultError } from "./fallbacks";

const defaultEndpoint = "/mcp";
const defaultToolName = "render-ui";

export const defaultBrowserCapabilities = {
  logging: {},
  openLinks: {},
  serverResources: { listChanged: true },
  serverTools: { listChanged: true },
} satisfies HostCapabilities;

const canUseBrowserTransport = () => typeof window !== "undefined" && typeof fetch === "function";

function endpointUrl(endpoint: string | URL): URL {
  if (endpoint instanceof URL) {
    return endpoint;
  }

  return new URL(endpoint, window.location.href);
}

function stableArgsKey(args: Record<string, unknown>): string {
  try {
    return JSON.stringify(args);
  } catch {
    return "";
  }
}

export function WebHost({
  capabilities = defaultBrowserCapabilities,
  children,
  connect = true,
  endpoint = defaultEndpoint,
  error: renderError,
  hostContext,
  initialArgs = {},
  initialSpec = null,
  loading: loadingView,
  registry = defaultWebRegistry,
  sandbox,
  toolName = defaultToolName,
  transportOptions,
}: WebHostProps) {
  const [spec, setSpec] = useState<Spec | null>(initialSpec);
  const [loading, setLoading] = useState(connect && !initialSpec);
  const [runtimeError, setRuntimeError] = useState<Error | null>(null);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const transportRef = useRef<StreamableHTTPClientTransport | null>(null);
  const argsKey = stableArgsKey(initialArgs);
  const endpointKey = endpoint.toString();

  useEffect(() => {
    setSpec(initialSpec);
  }, [initialSpec]);

  useEffect(() => {
    if (!connect || !canUseBrowserTransport()) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const client = new Client({ name: "mcpapp-web-host", version: "0.1.0" }, { capabilities: {} });
    const transport = new StreamableHTTPClientTransport(endpointUrl(endpoint), transportOptions);

    clientRef.current = client;
    transportRef.current = transport;
    setRuntimeError(null);

    if (!initialSpec) {
      setLoading(true);
    }

    void (async () => {
      await client.connect(transport as unknown as Transport);
      if (cancelled) {
        return;
      }

      setConnected(true);

      if (initialSpec) {
        setLoading(false);
        return;
      }

      const result = await client.callTool({
        name: toolName,
        arguments: initialArgs,
      });
      const nextSpec = extractSpecFromToolResult(result);

      if (!cancelled) {
        setSpec(nextSpec);
        setRuntimeError(null);
        setLoading(false);
      }
    })().catch((value: unknown) => {
      if (!cancelled) {
        setRuntimeError(toError(value, "Unable to connect to the MCP endpoint"));
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      setConnected(false);
      void client.close();
      void transport.close();
      clientRef.current = null;
      transportRef.current = null;
    };
  }, [argsKey, connect, endpointKey, initialSpec, toolName, transportOptions]);

  const runtime = useMemo<MCPAppRuntime>(
    () => ({
      app: null,
      callServerTool: async (name, args = {}) => {
        const client = clientRef.current;
        if (!client) {
          return null;
        }

        setLoading(true);
        setRuntimeError(null);

        try {
          const result = await client.callTool({ name, arguments: args });
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
      connected,
      connecting: loading && !runtimeError,
      error: runtimeError,
      hostCapabilities: capabilities,
      hostContext,
      loading,
      registry,
      spec,
    }),
    [capabilities, connected, hostContext, loading, registry, runtimeError, spec],
  );

  if (runtimeError) {
    return <>{renderError ? renderError(runtimeError) : <DefaultError error={runtimeError} />}</>;
  }

  if (!spec && loadingView && loading) {
    return <>{loadingView}</>;
  }

  return (
    <MCPHostRuntimeContext.Provider value={runtime}>
      <div data-mcpapp-sandbox={typeof sandbox === "string" ? sandbox : sandbox?.allow}>
        {children}
      </div>
    </MCPHostRuntimeContext.Provider>
  );
}
