export { createMcpApp, registerJsonRenderResource, registerJsonRenderTool } from "@json-render/mcp";
export { buildAppHtml } from "@json-render/mcp/build-app-html";
export { extractSpec, extractSpecFromToolResult, isSpec } from "./spec";

export type {
  CreateMcpAppOptions,
  McpToolOptions,
  RegisterResourceOptions,
  RegisterToolOptions,
} from "@json-render/mcp";
export type { BuildAppHtmlOptions } from "@json-render/mcp/build-app-html";
