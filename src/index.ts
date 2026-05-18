export { MCPApp } from "./components/MCPApp";
export { WebHost, defaultBrowserCapabilities } from "./components/WebHost";
export { useMCPHostRuntime } from "./context";
export { defaultWebRegistry } from "./default-web-registry";
export { extractSpec, extractSpecFromToolResult, isSpec } from "./spec";
export { isError, toError } from "./errors";

export type {
  ActionHandlers,
  ErrorRenderer,
  HostCapabilities,
  HostContext,
  MCPAppActionHandlers,
  MCPAppProps,
  MCPAppRuntime,
  Registry,
  RegistryActionFactory,
  SandboxPolicy,
  Spec,
  StateAdapter,
  StateModel,
  StateStore,
  ToolCaller,
  WebHostProps,
} from "./types";

export {
  createStateStore,
  type ComponentRegistry,
  type ComponentRenderer,
  type DefineRegistryResult,
} from "@json-render/react";
