import type {
  ComponentRegistry,
  ComponentRenderer,
  DefineRegistryResult,
  JSONUIProviderProps,
  SetState,
  Spec,
  StateModel,
  StateStore,
} from "@json-render/react";
import type {
  App,
  McpUiHostCapabilities,
  McpUiHostContext,
  McpUiResourcePermissions,
} from "@modelcontextprotocol/ext-apps";
import type { StreamableHTTPClientTransportOptions } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { ReactNode } from "react";

export type Registry = ComponentRegistry;
export type ActionHandlers = NonNullable<JSONUIProviderProps["handlers"]>;
export type RegistryActionFactory = DefineRegistryResult["handlers"];
export type MCPAppActionHandlers = ActionHandlers | RegistryActionFactory;

export type ErrorRenderer = (error: Error) => ReactNode;

export type StateAdapter<TState extends StateModel = StateModel> = {
  getSnapshot(): TState;
  getServerSnapshot?(): TState;
  subscribe(listener: () => void): () => void;
  get?(path: string): unknown;
  set?(path: string, value: unknown): void;
  update?(updates: Record<string, unknown>): void;
};

export type SandboxPolicy =
  | string
  | {
      allow?: string;
      permissions?: McpUiResourcePermissions;
    };

export type HostCapabilities = McpUiHostCapabilities;
export type HostContext = McpUiHostContext;

export type ToolCaller = (
  name: string,
  args?: Record<string, unknown>,
) => Promise<Spec | null>;

export type MCPAppRuntime = {
  app: App | null;
  callServerTool: ToolCaller | undefined;
  connected: boolean;
  connecting: boolean;
  error: Error | null;
  hostContext: HostContext | undefined;
  loading: boolean;
  registry: Registry | undefined;
  spec: Spec | null;
};

export type MCPAppProps = {
  name?: string;
  version?: string;
  registry?: Registry;
  handlers?: MCPAppActionHandlers;
  state?: StateAdapter | StateStore;
  loading?: ReactNode;
  error?: ErrorRenderer;
  fallback?: ComponentRenderer;
  functions?: JSONUIProviderProps["functions"];
  directives?: JSONUIProviderProps["directives"];
  validationFunctions?: JSONUIProviderProps["validationFunctions"];
};

export type WebHostProps = {
  children: ReactNode;
  endpoint?: string | URL;
  initialSpec?: Spec | null;
  initialArgs?: Record<string, unknown>;
  registry?: Registry;
  capabilities?: HostCapabilities;
  hostContext?: HostContext;
  sandbox?: SandboxPolicy;
  loading?: ReactNode;
  error?: ErrorRenderer;
  connect?: boolean;
  toolName?: string;
  transportOptions?: StreamableHTTPClientTransportOptions;
};

export type ResolvedActionHandlers = Record<
  string,
  (params: Record<string, unknown>) => Promise<unknown> | unknown
>;

export type RuntimeStateAccess = {
  getSetState(): SetState | undefined;
  getState(): StateModel;
};

export type { ComponentRenderer, Spec, StateModel, StateStore };
