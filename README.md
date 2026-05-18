# MCPApp React

`@mcpapp/react` is a small React runtime for MCP Apps whose interface is
described as json-render data.

```tsx
import { MCPApp } from "@mcpapp/react";

export function App() {
  return <MCPApp />;
}
```

For a normal browser page, wrap the app in `WebHost`:

```tsx
import { MCPApp, WebHost } from "@mcpapp/react";

export function App() {
  return (
    <WebHost>
      <MCPApp />
    </WebHost>
  );
}
```

`MCPApp` handles the app-side MCP Apps lifecycle, resolves the json-render
registry, seeds state from the active spec, and renders through
`@json-render/react`. `WebHost` provides the browser runtime context and can
connect to a Streamable HTTP MCP endpoint at `/mcp`.

## Install

```bash
npm install @mcpapp/react @json-render/react @json-render/mcp @modelcontextprotocol/sdk react react-dom
```

The default browser registry is based on `@json-render/shadcn`. Product apps can
pass their own registry to either `WebHost` or `MCPApp`.

## Server

Server helpers are re-exported from `@json-render/mcp`:

```ts
import { buildAppHtml, createMcpApp } from "@mcpapp/react/server";
```

## Development

```bash
npm install
npm test
npm run lint
npm run format
npm run typecheck
npm run build
```

This repo uses Vite+ (`vp`) for development, checks, tests, and packaging.
`vp check`/`vp lint` provide type-aware checks through the TypeScript Go
toolchain; `typescript` remains installed for ecosystem tools that still import
the TypeScript 6 API.
