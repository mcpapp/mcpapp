import type { ComponentRegistry, ComponentRenderProps, Spec } from "@json-render/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { defaultWebSpecSchema, MCPApp, WebHost, useMCPHostRuntime } from "../src";
import {
  defaultWebSpecSchema as serverDefaultWebSpecSchema,
  extractSpec as extractServerSpec,
} from "../src/server";

const Text = ({ element }: ComponentRenderProps<{ value: string }>) => <p>{element.props.value}</p>;

const Button = ({ element, emit }: ComponentRenderProps<{ label: string }>) => (
  <button type="button" onClick={() => emit("press")}>
    {element.props.label}
  </button>
);

const Panel = ({ children, element }: ComponentRenderProps<{ title: string }>) => (
  <section aria-label={element.props.title}>
    <h1>{element.props.title}</h1>
    {children}
  </section>
);

const registry = {
  Button,
  Panel,
  Text,
} satisfies ComponentRegistry;

const panelSpec: Spec = {
  root: "panel",
  elements: {
    panel: {
      type: "Panel",
      props: { title: "Customer profile" },
      children: ["name", "approve"],
    },
    name: {
      type: "Text",
      props: { value: { $state: "/customer/name" } },
      children: [],
    },
    approve: {
      type: "Button",
      props: { label: "Approve" },
      on: {
        press: {
          action: "approval.submit",
          params: { approvalId: "app_123" },
        },
      },
      children: [],
    },
  },
  state: {
    customer: {
      name: "Ada Lovelace",
    },
  },
};

describe("MCPApp", () => {
  it("renders an initial WebHost spec with json-render state bindings", () => {
    render(
      <WebHost initialSpec={panelSpec} registry={registry}>
        <MCPApp />
      </WebHost>,
    );

    expect(screen.getByRole("heading", { name: "Customer profile" })).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("defaults WebHost to local rendering without connecting to an MCP endpoint", () => {
    const RuntimeState = () => {
      const runtime = useMCPHostRuntime();

      return <p>{runtime?.connecting ? "connecting" : "idle"}</p>;
    };

    render(
      <WebHost>
        <RuntimeState />
      </WebHost>,
    );

    expect(screen.getByText("idle")).toBeInTheDocument();
  });

  it("routes spec actions to MCPApp handlers", async () => {
    const submit = vi.fn();
    const user = userEvent.setup();

    render(
      <WebHost connect={false} initialSpec={panelSpec} registry={registry}>
        <MCPApp handlers={{ "approval.submit": submit }} />
      </WebHost>,
    );

    await user.click(screen.getByRole("button", { name: "Approve" }));

    expect(submit).toHaveBeenCalledWith({ approvalId: "app_123" });
  });

  it("lets an MCPApp registry override the host registry", () => {
    const overrideRegistry = {
      ...registry,
      Text: ({ element }: ComponentRenderProps<{ value: string }>) => (
        <strong>Override: {element.props.value}</strong>
      ),
    } satisfies ComponentRegistry;

    render(
      <WebHost connect={false} initialSpec={panelSpec} registry={registry}>
        <MCPApp registry={overrideRegistry} />
      </WebHost>,
    );

    expect(screen.getByText("Override: Ada Lovelace")).toBeInTheDocument();
  });

  it("exposes WebHost capabilities on the host runtime", () => {
    const RuntimeCapabilities = () => {
      const runtime = useMCPHostRuntime();

      return <p>{runtime?.hostCapabilities?.openLinks ? "links supported" : "links blocked"}</p>;
    };

    render(
      <WebHost connect={false} capabilities={{ openLinks: {} }} initialSpec={panelSpec}>
        <RuntimeCapabilities />
      </WebHost>,
    );

    expect(screen.getByText("links supported")).toBeInTheDocument();
  });

  it("exposes spec extraction from the server entrypoint", () => {
    expect(extractServerSpec({ spec: panelSpec })).toBe(panelSpec);
  });

  it("exposes the default web spec schema from package entrypoints", () => {
    const webSpec: Spec = {
      root: "root",
      elements: {
        root: {
          type: "Stack",
          props: { direction: "vertical", gap: "md" },
          children: ["heading", "message"],
          visible: true,
        },
        heading: {
          type: "Heading",
          props: { level: "h1", text: "Hello world" },
          children: [],
          visible: true,
        },
        message: {
          type: "Text",
          props: { text: "This MCPApp spec was validated by the default schema." },
          children: [],
          visible: true,
        },
      },
    };

    expect(defaultWebSpecSchema.parse(webSpec)).toStrictEqual(webSpec);
    expect(serverDefaultWebSpecSchema.parse(webSpec)).toStrictEqual(webSpec);
    expect(defaultWebSpecSchema.safeParse({ elements: {} }).success).toBe(false);
  });
});
