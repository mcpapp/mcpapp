import { defineRegistry } from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";
import { defaultWebCatalog } from "./default-web-catalog";
import type { Registry } from "./types";

export const { registry: defaultWebRegistry } = defineRegistry(defaultWebCatalog, {
  components: shadcnComponents,
}) satisfies { registry: Registry };
