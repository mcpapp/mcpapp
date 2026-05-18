import type { Spec } from "./types";

type ToolResultLike = {
  content?: Array<Record<string, unknown>>;
  structuredContent?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object";

export function isSpec(value: unknown): value is Spec {
  return isRecord(value) && typeof value.root === "string" && isRecord(value.elements);
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function firstTextContent(result: ToolResultLike): string | null {
  const content = result.content?.find((item) => item.type === "text");
  return content?.type === "text" && typeof content.text === "string" ? content.text : null;
}

export function extractSpec(value: unknown): Spec | null {
  if (isSpec(value)) {
    return value;
  }

  if (!isRecord(value)) {
    return null;
  }

  if (isSpec(value.spec)) {
    return value.spec;
  }

  if (isRecord(value.structuredContent)) {
    const structuredSpec = extractSpec(value.structuredContent);
    if (structuredSpec) {
      return structuredSpec;
    }
  }

  if (Array.isArray(value.content)) {
    const textContent = value.content.find(
      (item): item is { type: "text"; text: string } =>
        isRecord(item) && item.type === "text" && typeof item.text === "string",
    );
    return textContent ? extractSpec(parseJson(textContent.text)) : null;
  }

  return null;
}

export function extractSpecFromToolResult(result: unknown): Spec | null {
  if (!isRecord(result)) {
    return null;
  }

  const toolResult = result as ToolResultLike;
  const structuredSpec = extractSpec(toolResult.structuredContent);
  if (structuredSpec) {
    return structuredSpec;
  }

  const text = firstTextContent(toolResult);
  if (!text) {
    return null;
  }

  return extractSpec(parseJson(text));
}
