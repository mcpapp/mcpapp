import type { ComponentRegistry, ComponentRenderProps, Spec } from "@json-render/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MCPApp, WebHost } from "../src";

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
      <WebHost connect={false} initialSpec={panelSpec} registry={registry}>
        <MCPApp />
      </WebHost>,
    );

    expect(screen.getByRole("heading", { name: "Customer profile" })).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
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
});
